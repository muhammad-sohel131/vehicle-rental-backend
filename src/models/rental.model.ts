import { Knex } from 'knex';
import db from '../config/database';

export type RentalStatus = 'booked' | 'ongoing' | 'completed' | 'cancelled';

export interface Rental {
    id: number;
    vehicle_id: number;
    customer_name: string;
    customer_phone: string;
    start_date: string;
    end_date: string;
    total_amount: string;
    status: RentalStatus;
    created_at: Date;
    updated_at: Date;
}

export interface RentalListFilters {
    vehicle_id?: number;
    status?: RentalStatus;
    from_date?: string;
    to_date?: string;
    page: number;
    limit: number;
}

export class RentalModel {
    private static tableName = 'rentals';

    static async lockVehicle(trx: Knex.Transaction, vehicleId: number): Promise<void> {
        await trx.raw('SELECT pg_advisory_xact_lock(?)', [vehicleId]);
    }

    static async hasOverlap(
        vehicleId: number,
        startDate: string,
        endDate: string,
        excludeRentalId?: number,
        trx?: Knex.Transaction,
    ): Promise<boolean> {
        const queryRunner = trx || db;

        const result = await queryRunner.raw(
            `
      SELECT 1
      FROM rentals
      WHERE vehicle_id = ?
        AND status != 'cancelled'
        AND (start_date, end_date) OVERLAPS (?::date, ?::date)
        ${excludeRentalId ? 'AND id != ?' : ''}
      LIMIT 1
      `,
            excludeRentalId
                ? [vehicleId, startDate, endDate, excludeRentalId]
                : [vehicleId, startDate, endDate],
        );

        return result.rows.length > 0;
    }

    static async findAll(
        filters: RentalListFilters,
    ): Promise<{ data: Rental[]; total: number }> {
        const { vehicle_id, status, from_date, to_date, page, limit } = filters;
        const offset = (page - 1) * limit;

        const baseQuery = db<Rental>(this.tableName);

        if (vehicle_id) {
            baseQuery.andWhere({ vehicle_id });
        }
        if (status) {
            baseQuery.andWhere({ status });
        }
        if (from_date) {
            baseQuery.andWhere('end_date', '>=', from_date);
        }
        if (to_date) {
            baseQuery.andWhere('start_date', '<=', to_date);
        }

        const countQuery = baseQuery.clone().count<{ count: string }[]>('id as count');
        const dataQuery = baseQuery
            .clone()
            .orderBy('start_date', 'desc')
            .limit(limit)
            .offset(offset);

        const [countResult, data] = await Promise.all([countQuery, dataQuery]);

        return {
            data,
            total: Number(countResult[0]?.count || 0),
        };
    }

    static async findById(id: number): Promise<Rental | undefined> {
        return db<Rental>(this.tableName).where({ id }).first();
    }

    static async create(payload: Partial<Rental>, trx?: Knex.Transaction): Promise<Rental> {
        const queryRunner = trx || db;
        const [rental] = await queryRunner<Rental>(this.tableName).insert(payload).returning('*');
        return rental;
    }

    static async update(id: number, payload: Partial<Rental>): Promise<Rental | undefined> {
        const [rental] = await db<Rental>(this.tableName)
            .where({ id })
            .update({ ...payload, updated_at: db.fn.now() })
            .returning('*');
        return rental;
    }

    static async delete(id: number): Promise<number> {
        return db<Rental>(this.tableName).where({ id }).del();
    }
}