import { Router } from 'express';
import { RentalController } from '../controllers/rental.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { createRentalSchema, updateRentalSchema } from '../validators/rental.validator';

const router = Router();

router.use(authenticate);

router.get('/', RentalController.list);
router.get('/:id', RentalController.getById);
router.post('/', validate(createRentalSchema), RentalController.create);
router.put('/:id', validate(updateRentalSchema), RentalController.update);
router.delete('/:id', RentalController.remove);

export default router;