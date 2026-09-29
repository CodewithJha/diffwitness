/**
 * Filesystem / local persistence port.
 * Domain and application depend on this — not on node:fs directly.
 */

export interface WriteTextOptions {
  readonly overwrite?: boolean;
}

export interface WriteBytesOptions {
  readonly overwrite?: boolean;
}

export interface StoragePort {
  exists(path: string): Promise<boolean>;
  ensureDir(path: string): Promise<void>;
  readText(path: string): Promise<string>;
  writeText(path: string, content: string, options?: WriteTextOptions): Promise<void>;
  readBytes(path: string): Promise<Buffer>;
  writeBytes(path: string, content: Buffer, options?: WriteBytesOptions): Promise<void>;
  listDir(path: string): Promise<string[]>;
}
