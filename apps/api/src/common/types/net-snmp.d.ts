declare module 'net-snmp' {
  export const Version1: number;
  export const Version2c: number;
  export const Version3: number;

  export interface SessionOptions {
    version?: number;
    timeout?: number;
    retries?: number;
  }

  export interface Session {
    get(oids: string[], callback: (error: Error | null, varbinds: any[]) => void): void;
    getNext(oids: string[], callback: (error: Error | null, varbinds: any[]) => void): void;
    getBulk(nonRepeaters: number, maxRepetitions: number, oids: string[], callback: (error: Error | null, varbinds: any[]) => void): void;
    set(varbinds: any[], callback: (error: Error | null, varbinds: any[]) => void): void;
    close(): void;
  }

  export function createSession(target: string, community: string, options?: SessionOptions): Session;
  export function isVarbindError(varbind: any): boolean;
}
