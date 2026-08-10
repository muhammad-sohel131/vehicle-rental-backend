import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { StaffModel } from '../models/staff.model';
import { JwtPayload, LoginResponseBody } from '../types/auth.types';

export class AuthService {
  static async login(email: string, password: string): Promise<LoginResponseBody> {
    const staff = await StaffModel.findByEmail(email);

    if (!staff) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(password, staff.password_hash);

    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const payload: JwtPayload = {
      staffId: staff.id,
      email: staff.email,
    };

    const secret = process.env.JWT_SECRET as string;
    const expiresIn = (process.env.JWT_EXPIRES_IN || '1d') as SignOptions['expiresIn'];

    const token = jwt.sign(payload, secret, { expiresIn });

    return {
      token,
      staff: {
        id: staff.id,
        email: staff.email,
        name: staff.name,
      },
    };
  }
}