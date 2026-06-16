import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma, UnmanagedStatus } from '@prisma/client';
import { PingService } from './ping.service';
import { SnmpService } from './snmp.service';

@Injectable()
export class DiscoveryService {
  private isScanning = false;

  constructor(
    private prisma: PrismaService,
    private pingService: PingService,
    private snmpService: SnmpService,
  ) {}

  async runScan(
    subnet: string,
    snmpCommunity: string = 'public',
    snmpVersion: number = 2,
    triggeredBy?: string,
  ) {
    // Prevent concurrent scans
    if (this.isScanning) {
      throw new BadRequestException('Uma varredura já está em andamento');
    }

    this.isScanning = true;

    const scanRun = await this.prisma.networkScanRun.create({
      data: {
        subnet,
        status: 'RUNNING',
        startedAt: new Date(),
        triggeredBy,
      },
    });

    try {
      // Step 1: Ping sweep
      const aliveHosts = await this.pingService.pingSweep(subnet, 1000);

      // Step 2: SNMP query for each host
      const devicePromises = aliveHosts.map(async (ip) => {
        const snmpInfo = await this.snmpService.queryDevice(ip, snmpCommunity, snmpVersion);

        // Check if device is already imported
        const existingDevice = await this.prisma.unmanagedDevice.findUnique({
          where: { ip },
        });

        if (existingDevice && existingDevice.importedAssetId) {
          return null; // Skip already imported devices
        }

        const deviceData: Prisma.UnmanagedDeviceUncheckedCreateInput = {
          ip,
          mac: snmpInfo?.mac || null,
          sysName: snmpInfo?.sysName || null,
          sysDescr: snmpInfo?.sysDescr || null,
          vendor: snmpInfo?.vendor || null,
          status: 'NEW',
          scanRunId: scanRun.id,
          firstSeen: existingDevice?.firstSeen || new Date(),
          lastSeen: new Date(),
          rawData: snmpInfo?.uptime ? { uptime: snmpInfo.uptime } : undefined,
        };

        // Upsert (update or create)
        const device = await this.prisma.unmanagedDevice.upsert({
          where: { ip },
          update: {
            lastSeen: new Date(),
            scanRunId: scanRun.id,
            status: existingDevice?.status || 'NEW',
          },
          create: deviceData,
        });

        return device;
      });

      const devices = await Promise.all(devicePromises);
      const newDevices = devices.filter((d) => d && d.status === 'NEW').length;

      // Step 3: Update scan run
      await this.prisma.networkScanRun.update({
        where: { id: scanRun.id },
        data: {
          status: 'SUCCESS',
          hostsAlive: aliveHosts.length,
          devicesFound: devices.filter((d) => d).length,
          newDevices,
          finishedAt: new Date(),
        },
      });

      this.isScanning = false;
      return scanRun;
    } catch (error) {
      await this.prisma.networkScanRun.update({
        where: { id: scanRun.id },
        data: {
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          finishedAt: new Date(),
        },
      });

      this.isScanning = false;
      throw error;
    }
  }

  async getScanRuns(limit: number = 20) {
    return this.prisma.networkScanRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
  }

  async getUnmanagedDevices(status?: UnmanagedStatus) {
    const where = status ? { status } : {};
    return this.prisma.unmanagedDevice.findMany({
      where,
      orderBy: { lastSeen: 'desc' },
    });
  }

  async importDevice(deviceId: string, assetData: Prisma.AssetCreateInput) {
    const device = await this.prisma.unmanagedDevice.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new Error('Dispositivo não encontrado');
    }

    // Create asset with device info
    const { hostname: _, ...restData } = assetData;
    const asset = await this.prisma.asset.create({
      data: {
        hostname: assetData.hostname || device.sysName || device.ip,
        ip: device.ip,
        manufacturer: device.vendor || assetData.manufacturer,
        ...restData,
      },
    });

    // Mark device as imported
    await this.prisma.unmanagedDevice.update({
      where: { id: deviceId },
      data: {
        status: 'IMPORTED',
        importedAssetId: asset.id,
      },
    });

    return asset;
  }

  async ignoreDevice(deviceId: string) {
    return this.prisma.unmanagedDevice.update({
      where: { id: deviceId },
      data: { status: 'IGNORED' },
    });
  }
}
