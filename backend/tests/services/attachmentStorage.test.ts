import { describe, expect, test } from 'vitest';
import { MemoryAttachmentStorage } from '../../src/services/attachmentStorage.js';

describe('MemoryAttachmentStorage', () => {
  test('stores validated metadata without exposing payload', async () => {
    const storage = new MemoryAttachmentStorage();
    const stored = await storage.put({
      key: 'attachment-1',
      contentType: 'image/png',
      size: 3,
      data: new Uint8Array([1, 2, 3]),
    });
    expect(stored).toEqual({
      key: 'attachment-1',
      contentType: 'image/png',
      size: 3,
      name: undefined,
    });
    expect(stored).not.toHaveProperty('data');
  });

  test('rejects unsupported types and invalid sizes', async () => {
    const storage = new MemoryAttachmentStorage();
    await expect(
      storage.put({
        key: 'bad-type',
        contentType: 'text/plain',
        size: 1,
        data: new Uint8Array([1]),
      })
    ).rejects.toThrow('messaging.errors.attachment_type');
    await expect(
      storage.put({
        key: 'bad-size',
        contentType: 'image/png',
        size: 2,
        data: new Uint8Array([1]),
      })
    ).rejects.toThrow('messaging.errors.attachment_size');
  });
});
