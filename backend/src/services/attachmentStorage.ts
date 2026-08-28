export interface AttachmentUpload {
  key: string;
  contentType: string;
  size: number;
  name?: string;
  data: Uint8Array;
}

export interface StoredAttachment {
  key: string;
  contentType: string;
  size: number;
  name?: string;
}

export interface AttachmentStorage {
  put(upload: AttachmentUpload): Promise<StoredAttachment>;
  remove(key: string): Promise<void>;
}

export class MemoryAttachmentStorage implements AttachmentStorage {
  private readonly entries = new Map<string, AttachmentUpload>();

  async put(upload: AttachmentUpload): Promise<StoredAttachment> {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(upload.contentType)) {
      throw new Error('messaging.errors.attachment_type');
    }
    if (
      upload.size < 1 ||
      upload.size > 10 * 1024 * 1024 ||
      upload.data.byteLength !== upload.size
    ) {
      throw new Error('messaging.errors.attachment_size');
    }
    this.entries.set(upload.key, upload);
    return {
      key: upload.key,
      contentType: upload.contentType,
      size: upload.size,
      name: upload.name,
    };
  }

  async remove(key: string): Promise<void> {
    this.entries.delete(key);
  }
}
