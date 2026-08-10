import { ReportModel, VehicleReportRow } from '../models/report.model';

function getMonthRange(month: string): { start: string; end: string } {
    // month format: "YYYY-MM"
    const [year, mon] = month.split('-').map(Number);
    const start = `${year}-${String(mon).padStart(2, '0')}-01`;
    const lastDay = new Date(year, mon, 0).getDate(); // day 0 of next month = last day of this month
    const end = `${year}-${String(mon).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { start, end };
}

export class ReportService {
    static async monthlyReport(month: string, vehicleId?: number) {
        if (!/^\d{4}-\d{2}$/.test(month)) {
            throw new Error('INVALID_MONTH_FORMAT');
        }

        const { start, end } = getMonthRange(month);
        const rows: VehicleReportRow[] = await ReportModel.monthlyReport(start, end, vehicleId);

        let topVehicle: VehicleReportRow | null = null;
        for (const row of rows) {
            if (!topVehicle || Number(row.revenue) > Number(topVehicle.revenue)) {
                topVehicle = row;
            }
        }

        return {
            month,
            vehicles: rows,
            top_vehicle: topVehicle,
        };
    }
}