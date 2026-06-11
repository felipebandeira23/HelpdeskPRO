/**
 * Tipagem mínima do multer — evita adicionar @types/multer como dependência
 * nova (PLANO.md §5). Cobre apenas o que o módulo de anexos usa.
 */
declare module 'multer' {
  export interface MulterFile {
    fieldname: string;
    originalname: string;
    mimetype: string;
    size: number;
    filename: string;
    path: string;
    destination: string;
  }

  export interface StorageEngine {
    _handleFile(req: unknown, file: unknown, cb: unknown): void;
    _removeFile(req: unknown, file: unknown, cb: unknown): void;
  }

  export interface DiskStorageOptions {
    destination?: (
      req: unknown,
      file: MulterFile,
      cb: (error: Error | null, destination: string) => void,
    ) => void;
    filename?: (
      req: unknown,
      file: MulterFile,
      cb: (error: Error | null, filename: string) => void,
    ) => void;
  }

  export function diskStorage(options: DiskStorageOptions): StorageEngine;

  const multer: unknown;
  export default multer;
}
