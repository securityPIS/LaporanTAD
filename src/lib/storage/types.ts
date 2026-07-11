export interface FileMeta {
  id: string;
  name: string;
  mime: string;
  size: number;
}

export interface StoredFile {
  bytes: Buffer;
  mime: string;
  name: string;
}

export interface StorageDriver {
  put(folder: string, name: string, mime: string, bytes: Buffer): Promise<FileMeta>;
  get(id: string): Promise<StoredFile | null>;
  delete(id: string): Promise<void>;
}
