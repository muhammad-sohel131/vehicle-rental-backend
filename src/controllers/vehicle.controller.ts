import { Request, Response } from 'express';
import { VehicleService } from '../services/vehicle.service';

export class VehicleController {
  static async list(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await VehicleService.list({ page, limit, category, search });

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
      const vehicle = await VehicleService.getById(id);
      res.status(200).json(vehicle);
    } catch (err) {
      if (err instanceof Error && err.message === 'VEHICLE_NOT_FOUND') {
        res.status(404).json({ message: 'Vehicle not found' });
        return;
      }
      res.status(500).json({ message: 'Something went wrong' });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, plate_number, category, daily_rate } = req.body;
      const photo_path = req.file ? req.file.path : undefined;

      const vehicle = await VehicleService.create({
        name,
        plate_number,
        category,
        daily_rate: Number(daily_rate),
        photo_path,
      });

      res.status(201).json(vehicle);
    } catch (err) {
      if (err instanceof Error && err.message === 'PLATE_NUMBER_EXISTS') {
        res.status(409).json({ message: 'A vehicle with this plate number already exists' });
        return;
      }
      res.status(500).json({ message: 'Something went wrong' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { name, plate_number, category, daily_rate } = req.body;
      const photo_path = req.file ? req.file.path : undefined;

      const vehicle = await VehicleService.update(id, {
        name,
        plate_number,
        category,
        daily_rate: daily_rate !== undefined ? Number(daily_rate) : undefined,
        photo_path,
      });

      res.status(200).json(vehicle);
    } catch (err) {
      if (err instanceof Error && err.message === 'VEHICLE_NOT_FOUND') {
        res.status(404).json({ message: 'Vehicle not found' });
        return;
      }
      if (err instanceof Error && err.message === 'PLATE_NUMBER_EXISTS') {
        res.status(409).json({ message: 'A vehicle with this plate number already exists' });
        return;
      }
      res.status(500).json({ message: 'Something went wrong' });
    }
  }

  static async remove(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      await VehicleService.softDelete(id);
      res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
      if (err instanceof Error && err.message === 'VEHICLE_NOT_FOUND') {
        res.status(404).json({ message: 'Vehicle not found' });
        return;
      }
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
}