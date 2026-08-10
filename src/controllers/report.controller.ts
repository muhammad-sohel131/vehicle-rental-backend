import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';

export class ReportController {
    static async monthlyRentals(req: Request, res: Response): Promise<void> {
        try {
            const month = req.query.month as string;
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