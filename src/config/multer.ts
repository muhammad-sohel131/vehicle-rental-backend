import multer from 'multer';

const storage = multer.memoryStorage();

function fileFilter(
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
): void {

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/octet-stream'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only .jpeg, .png, and .webp image formats are allowed'));
    }
}

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 8 * 1024 * 1024 }, // 8MB max
});