import { Injectable } from '@nestjs/common';
import * as snmp from 'net-snmp';

export interface SnmpDeviceInfo {
  sysName?: string;
  sysDescr?: string;
  mac?: string;
  vendor?: string;
  uptime?: number;
}

interface SnmpVarbind {
  oid: string;
  type: number;
  value: any;
}

@Injectable()
export class SnmpService {
  async queryDevice(ip: string, community: string = 'public', version: number = 2): Promise<SnmpDeviceInfo | null> {
    return new Promise((resolve) => {
      const snmpVersion = version === 1 ? snmp.Version1 : snmp.Version2c;
      const session = snmp.createSession(ip, community, {
        version: snmpVersion,
        timeout: 1000,
        retries: 0,
      });

      const oids = [
        '1.3.6.1.2.1.1.5.0', // sysName
        '1.3.6.1.2.1.1.1.0', // sysDescr
        '1.3.6.1.2.1.1.3.0', // sysUpTime
        '1.3.6.1.2.1.2.2.1.6.1', // MAC address (ifPhysAddress)
      ];

      const result: SnmpDeviceInfo = {};

      session.get(oids, (error: Error | null, varbinds: SnmpVarbind[]) => {
        if (error) {
          session.close();
          resolve(null);
          return;
        }

        try {
          varbinds.forEach((varbind: any, idx: number) => {
            if (snmp.isVarbindError(varbind)) return;

            const value = varbind.value;
            if (!value) return;

            switch (idx) {
              case 0: // sysName
                result.sysName = value.toString();
                break;
              case 1: // sysDescr
                result.sysDescr = value.toString();
                // Extract vendor from description
                if (value.toString().includes('Cisco')) result.vendor = 'Cisco';
                else if (value.toString().includes('Juniper')) result.vendor = 'Juniper';
                else if (value.toString().includes('HP')) result.vendor = 'HP';
                else if (value.toString().includes('Dell')) result.vendor = 'Dell';
                else if (value.toString().includes('Ubiquiti')) result.vendor = 'Ubiquiti';
                break;
              case 2: // sysUpTime
                result.uptime = value;
                break;
              case 3: // MAC address
                if (Buffer.isBuffer(value)) {
                  result.mac = value.toString('hex').match(/.{1,2}/g)?.join(':') || undefined;
                }
                break;
            }
          });
        } catch {
          // Silently catch errors
        }

        session.close();
        resolve(Object.keys(result).length > 0 ? result : null);
      });

      setTimeout(() => {
        session.close();
        resolve(null);
      }, 2000);
    });
  }
}
