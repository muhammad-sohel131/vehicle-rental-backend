import db from '../config/database';

export interface Vehicle {
  id: number;
  name: string;
  plate_number: string;
  category: string;
  daily_rate: string;
  photo_path: string | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface VehicleListFilters {
  category?: string;
  search?: string;
  page: number;
  limit: number;
}

export class VehicleModel {
  private static tableName = 'vehicles';

  static async findAll(
    filters: VehicleListFilters,
  ): Promise<{ data: Vehicle[]; total: number }> {
    const { category, search, page, limit } = filters;
    const offset = (page - 1) * limit;

    const baseQuery = db<Vehicle>(this.tableName).whereNull('deleted_at');

    if (category) {
      baseQuery.andWhere({ category });
    }

    if (search) {
      baseQuery.andWhere('name', 'ilike', `%${search}%`);
    }

    const countQuery = baseQuery.clone().count<{ count: string }[]>('id as count');
    const dataQuery = baseQuery
      .clone()
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const [countResult, data] = await Promise.all([countQuery, dataQuery]);

    return {
      data,
      total: Number(countResult[0]?.count || 0),
    };
  }

  static async findById(id: number): Promise<Vehicle | undefined> {
    return db<Vehicle>(this.tableName).where({ id }).whereNull('deleted_at').first();
  }

  static async findByIdIncludingDeleted(id: number): Promise<Vehicle | undefined> {
    return db<Vehicle>(this.tableName).where({ id }).first();
  }

  static async findByPlateNumber(plateNumber: string): Promise<Vehicle | undefined> {
    return db<Vehicle>(this.tableName).where({ plate_number: plateNumber }).first();
  }

  static async create(payload: Partial<Vehicle>): Promise<Vehicle> {
    const [vehicle] = await db<Vehicle>(this.tableName).insert(payload).returning('*');
    return vehicle;
  }

  static async update(id: number, payload: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const [vehicle] = await db<Vehicle>(this.tableName)
      .where({ id })
      .update({ ...payload, updated_at: db.fn.now() })
      .returning('*');
    return vehicle;
  }

  static async softDelete(id: number): Promise<Vehicle | undefined> {
    const [vehicle] = await db<Vehicle>(this.tableName)
      .where({ id })
      .update({ deleted_at: db.fn.now() })
      .returning('*');
    return vehicle;
  }
}