import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

@Injectable()
export class PingService {
  async ping(host: string, timeout: number = 1000): Promise<boolean> {
    try {
      const timeoutSec = Math.ceil(timeout / 1000);
      // Windows: ping -n 1 -w {timeout}
      // Unix: ping -c 1 -W {timeout}
      const isWindows = process.platform === 'win32';
      const cmd = isWindows
        ? `ping -n 1 -w ${timeout} ${host}`
        : `ping -c 1 -W ${timeoutSec * 1000} ${host}`;

      await execPromise(cmd, { timeout: timeout + 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async pingSweep(subnet: string, timeout: number = 1000): Promise<string[]> {
    // Subnet format: "192.168.1.0/24"
    const [baseIp, cidr] = subnet.split('/');
    const parts = baseIp.split('.');
    const lastOctet = parseInt(parts[3], 10);

    const maskBits = parseInt(cidr || '24', 10);
    const hostsCount = Math.min(Math.pow(2, 32 - maskBits) - 2, 256); // Cap at /24 = 254 hosts

    const aliveHosts: string[] = [];
    const promises: Promise<void>[] = [];
    const concurrency = 32;

    for (let i = 1; i < hostsCount; i++) {
      const host = `${parts[0]}.${parts[1]}.${parts[2]}.${i + lastOctet}`;

      const promise = this.ping(host, timeout)
        .then((alive) => {
          if (alive) aliveHosts.push(host);
        })
        .catch(() => {});

      promises.push(promise);

      if (promises.length >= concurrency) {
        await Promise.race(promises);
        promises.splice(promises.findIndex((p) => p === promise), 1);
      }
    }

    await Promise.all(promises);
    return aliveHosts;
  }
}
