import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginRequestBody, LoginResponseBody } from '../types/auth.types';
import { MessageResponse } from '../types/common.types';

export class AuthController {
  static async login(
    req: Request<unknown, unknown, LoginRequestBody>,
    res: Response<LoginResponseBody | MessageResponse>,
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
      }
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
}