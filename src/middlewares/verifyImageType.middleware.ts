import { Request, Response, NextFunction } from 'express';

const { fileTypeFromBuffer } = require('file-type') as {
  fileTypeFromBuffer: (buffer: Buffer | Uint8Array) => Promise<{ mime: string } | undefined>;
};

export async function verifyImageType(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.file) {
    next();
    return;
  }

  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const type = await fileTypeFromBuffer(req.file.buffer);

  if (!type || !allowedMimes.includes(type.mime)) {
    res.status(400).json({ message: 'Only .jpeg, .png, and .webp image formats are allowed' });
    return;
  }

  next();
}