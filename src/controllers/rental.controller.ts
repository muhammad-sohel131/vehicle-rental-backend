import { Request, Response } from 'express';
import { RentalService } from '../services/rental.service';

export class RentalController {
    static async list(req: Request, res: Response): Promise<void> {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const vehicle_id = req.query.vehicle_id ? Number(req.query.vehicle_id) : undefined;
        const status = req.query.status as
            | 'booked'
            | 'ongoing'
            | 'completed'
            | 'cancelled'
            | undefined;
        const from_date = req.query.from_date as string | undefined;
        const to_date = req.query.to_date as string | undefined;

        const result = await RentalService.list({
            page,
            limit,
            vehicle_id,
            status,
            from_date,
            to_date,
        });

        res.status(200).json({
            data: result.data,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(result.total / limit),
            },
        });
    }

    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const rental = await RentalService.getById(id);
            res.status(200).json(rental);
        } catch (err) {
            if (err instanceof Error && err.message === 'RENTAL_NOT_FOUND') {
                res.status(404).json({ message: 'Rental not found' });
                return;
            }
            res.status(500).json({ message: 'Something went wrong' });
        }
    }

    static async create(req: Request, res: Response): Promise<void> {
        try {
            const rental = await RentalService.create(req.body);
            res.status(201).json(rental);
        } catch (err) {
            if (err instanceof Error && err.message === 'VEHICLE_NOT_FOUND') {
                res.status(404).json({ message: 'Vehicle not found' });
                return;
            }
            if (err instanceof Error && err.message === 'OVERLAPPING_RENTAL') {
                res
                    .status(409)
                    .json({ message: 'This vehicle already has an active rental for the selected dates' });
                return;
            }
            res.status(500).json({ message: 'Something went wrong' });
        }
    }

    static async update(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const rental = await RentalService.update(id, req.body);
            res.status(200).json(rental);
        } catch (err) {
            if (err instanceof Error && err.message === 'RENTAL_NOT_FOUND') {
                res.status(404).json({ message: 'Rental not found' });
                return;
            }
            if (err instanceof Error && err.message === 'VEHICLE_NOT_FOUND') {
                res.status(404).json({ message: 'Vehicle not found' });
                return;
            }
            if (err instanceof Error && err.message === 'OVERLAPPING_RENTAL') {
                res
                    .status(409)
                    .json({ message: 'This vehicle already has an active rental for the selected dates' });
                return;
            }
            res.status(500).json({ message: 'Something went wrong' });
        }
    }

    static async remove(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            await RentalService.remove(id);
            res.status(200).json({ message: 'Rental deleted successfully' });
        } catch (err) {
            if (err instanceof Error && err.message === 'RENTAL_NOT_FOUND') {
                res.status(404).json({ message: 'Rental not found' });
                return;
            }
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
}