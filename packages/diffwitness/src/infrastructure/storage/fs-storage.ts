import { mkdir, readdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { DiffWitnessError } from "../../domain/errors.js";
import type { StoragePort, WriteBytesOptions, WriteTextOptions } from "../../ports/storage.js";

export class FsStorage implements StoragePort {
  async exists(targetPath: string): Promise<boolean> {
    try {
      await stat(targetPath);
      return true;
    } catch {
      return false;
    }
  }

  async ensureDir(dirPath: string): Promise<void> {
    try {
      await mkdir(dirPath, { recursive: true });
    } catch (cause) {
      throw new DiffWitnessError("storage", `Failed to create directory: ${dirPath}`, { cause });
    }
  }

  async readText(filePath: string): Promise<string> {
    try {
      return await readFile(filePath, "utf8");
    } catch (cause) {
      throw new DiffWitnessError("storage", `Failed to read file: ${filePath}`, { cause });
    }
  }

  async writeText(filePath: string, content: string, options?: WriteTextOptions): Promise<void> {
    await this.writeBytes(filePath, Buffer.from(content, "utf8"), options);
  }

  async readBytes(filePath: string): Promise<Buffer> {
    try {
      return await readFile(filePath);
    } catch (cause) {
      throw new DiffWitnessError("storage", `Failed to read file: ${filePath}`, { cause });
    }
  }

  async writeBytes(
    filePath: string,
    content: Buffer,
    options?: WriteBytesOptions,
  ): Promise<void> {
    const overwrite = options?.overwrite ?? false;
    if (!overwrite && (await this.exists(filePath))) {
      throw new DiffWitnessError("storage", `Refusing to overwrite existing file: ${filePath}`, {
        exitClass: "user_error",
        details: { code: "already_exists" },
      });
    }
    await this.ensureDir(path.dirname(filePath));
    const tmp = `${filePath}.${randomBytes(8).toString("hex")}.tmp`;
    try {
      await writeFile(tmp, content, { flag: "wx" });
      if (!overwrite && (await this.exists(filePath))) {
        await rmQuiet(tmp);
        throw new DiffWitnessError("storage", `Refusing to overwrite existing file: ${filePath}`, {
          exitClass: "user_error",
          details: { code: "already_exists" },
        });
      }
      await rename(tmp, filePath);
    } catch (cause) {
      await rmQuiet(tmp);
      if (cause instanceof DiffWitnessError) {
        throw cause;
      }
      throw new DiffWitnessError("storage", `Failed to write file: ${filePath}`, { cause });
    }
  }

  async listDir(dirPath: string): Promise<string[]> {
    try {
      return await readdir(dirPath);
    } catch (cause) {
      throw new DiffWitnessError("storage", `Failed to list directory: ${dirPath}`, { cause });
    }
  }
}

async function rmQuiet(filePath: string): Promise<void> {
  try {
    const { unlink } = await import("node:fs/promises");
    await unlink(filePath);
  } catch {
    // ignore
  }
}
