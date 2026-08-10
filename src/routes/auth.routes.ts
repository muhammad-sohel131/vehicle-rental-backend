import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { loginSchema } from '../validators/auth.validator';
import { loginRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

router.post('/login', loginRateLimiter, validate(loginSchema), AuthController.login);

export default router;