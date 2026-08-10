import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { VehicleController } from '../controllers/vehicle.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../config/multer';
import { createVehicleSchema, updateVehicleSchema } from '../validators/vehicle.validator';
import { verifyImageType } from '../middlewares/verifyImageType.middleware';

const router = Router();

router.use(authenticate);

router.get('/', VehicleController.list);
router.get('/:id', VehicleController.getById);

router.post(
    '/',
    upload.single('photo'),
    verifyImageType,
    validate(createVehicleSchema),
    VehicleController.create,
);

router.put(
    '/:id',
    upload.single('photo'),
    verifyImageType,
    validate(updateVehicleSchema),
    VehicleController.update,
);

router.delete('/:id', VehicleController.remove);

// Error handler — must be defined AFTER the routes it protects
router.use((err: unknown, _req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof multer.MulterError) {
        res.status(400).json({ message: err.message });
        return;
    }
    if (err) {
        res.status(400).json({ message: (err as Error).message });
        return;
    }
    next();
});

export default router;