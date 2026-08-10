import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';
import { MessageResponse } from '../types/common.types';
import { VehicleReportRow } from '../models/report.model';

interface MonthlyReportQuery {
    month?: string;
    vehicle_id?: string;
}

interface MonthlyReportResponse {
    month: string;
    vehicles: VehicleReportRow[];
    top_vehicle: VehicleReportRow | null;
}

export class ReportController {
    static async monthlyRentals(
        req: Request<unknown, unknown, unknown, MonthlyReportQuery>,
        res: Response<MonthlyReportResponse | MessageResponse>,
    ): Promise<void> {
        try {
            const month = req.query.month;
            const vehicleId = req.query.vehicle_id ? Number(req.query.vehicle_id) : undefined;

            if (!month) {
                res.status(400).json({ message: 'month query parameter is required (format: YYYY-MM)' });
                return;
            }

            const report = await ReportService.monthlyReport(month, vehicleId);
            res.status(200).json(report);
        } catch (err) {
            if (err instanceof Error && err.message === 'INVALID_MONTH_FORMAT') {
                res.status(400).json({ message: 'month must be in YYYY-MM format' });
                return;
            }
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
}