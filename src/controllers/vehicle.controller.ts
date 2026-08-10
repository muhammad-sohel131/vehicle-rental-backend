import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { VehicleService } from '../services/vehicle.service';
import { IdParam, MessageResponse, PaginatedResponse } from '../types/common.types';
import {
    CreateVehicleRequestBody,
    UpdateVehicleRequestBody,
    VehicleListQuery,
    VehicleResponseBody,
} from '../types/vehicle.types';

const uploadPath = process.env.UPLOAD_PATH || 'uploads';

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

function saveFileToDisk(file: Express.Multer.File): string {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const filename = `vehicle-${uniqueSuffix}${ext}`;
    const filePath = path.join(uploadPath, filename);

    fs.writeFileSync(filePath, file.buffer);

    return filePath.split(path.sep).join('/');
}

export class VehicleController {
    static async list(
        req: Request<unknown, unknown, unknown, VehicleListQuery>,
        res: Response<PaginatedResponse<VehicleResponseBody>>,
    ): Promise<void> {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const category = req.query.category;
        const search = req.query.search;

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

    static async getById(
        req: Request<IdParam>,
        res: Response<VehicleResponseBody | MessageResponse>,
    ): Promise<void> {
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

    static async create(
        req: Request<unknown, unknown, CreateVehicleRequestBody>,
        res: Response<VehicleResponseBody | MessageResponse>,
    ): Promise<void> {
        try {
            const { name, plate_number, category, daily_rate } = req.body;
            const photo_path = req.file ? saveFileToDisk(req.file) : undefined;

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

    static async update(
        req: Request<IdParam, unknown, UpdateVehicleRequestBody>,
        res: Response<VehicleResponseBody | MessageResponse>,
    ): Promise<void> {
        try {
            const id = Number(req.params.id);
            const { name, plate_number, category, daily_rate } = req.body;
            const photo_path = req.file ? saveFileToDisk(req.file) : undefined;

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

    static async remove(
        req: Request<IdParam>,
        res: Response<MessageResponse>,
    ): Promise<void> {
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