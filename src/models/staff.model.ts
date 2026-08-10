import db from '../config/database';

export interface Staff {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export class StaffModel {
  private static tableName = 'staff';

  static async findByEmail(email: string): Promise<Staff | undefined> {
    return db<Staff>(this.tableName).where({ email }).first();
  }

  static async findById(id: number): Promise<Staff | undefined> {
    return db<Staff>(this.tableName).where({ id }).first();
  }
}