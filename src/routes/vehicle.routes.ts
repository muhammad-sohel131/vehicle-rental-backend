import { Router } from 'express';
import { VehicleController } from '../controllers/vehicle.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { upload } from '../config/multer';
import { createVehicleSchema, updateVehicleSchema } from '../validators/vehicle.validator';

const router = Router();

router.use(authenticate);

router.get('/', VehicleController.list);
router.get('/:id', VehicleController.getById);

router.post(
  '/',
  upload.single('photo'),
  validate(createVehicleSchema),
  VehicleController.create,
);

router.put(
  '/:id',
  upload.single('photo'),
  validate(updateVehicleSchema),
  VehicleController.update,
);

router.delete('/:id', VehicleController.remove);

export default router;