import db from '../config/database';

export interface VehicleReportRow {
    id: number;
    name: string;
    total_bookings: number;
    days_rented: number;
    revenue: number;
}

export class ReportModel {
    static async monthlyReport(
        monthStart: string,
        monthEnd: string,
        vehicleId?: number,
    ): Promise<VehicleReportRow[]> {
        const result = await db.raw(
            `
      SELECT
        v.id,
        v.name,
        COUNT(r.id)::int AS total_bookings,
        COALESCE(SUM(
          (LEAST(r.end_date, ?::date) - GREATEST(r.start_date, ?::date)) + 1
        ), 0)::int AS days_rented,
        COALESCE(SUM(
          ((LEAST(r.end_date, ?::date) - GREATEST(r.start_date, ?::date)) + 1) * v.daily_rate
        ), 0)::numeric(10,2) AS revenue
      FROM vehicles v
      LEFT JOIN rentals r
        ON r.vehicle_id = v.id
        AND r.status != 'cancelled'
        AND r.start_date <= ?::date
        AND r.end_date >= ?::date
      WHERE v.deleted_at IS NULL
        ${vehicleId ? 'AND v.id = ?' : ''}
      GROUP BY v.id, v.name
      ORDER BY v.id
      `,
            vehicleId
                ? [monthEnd, monthStart, monthEnd, monthStart, monthEnd, monthStart, vehicleId]
                : [monthEnd, monthStart, monthEnd, monthStart, monthEnd, monthStart],
        );

        return result.rows;
    }
}