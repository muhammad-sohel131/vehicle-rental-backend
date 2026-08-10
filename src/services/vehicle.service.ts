import fs from 'fs';
import { VehicleModel, Vehicle, VehicleListFilters } from '../models/vehicle.model';

export class VehicleService {
    static async list(filters: VehicleListFilters) {
        return VehicleModel.findAll(filters);
    }

    static async getById(id: number): Promise<Vehicle> {
        const vehicle = await VehicleModel.findById(id);
        if (!vehicle) {
            throw new Error('VEHICLE_NOT_FOUND');
        }
        return vehicle;
    }

    static async create(payload: {
        name: string;
        plate_number: string;
        category: string;
        daily_rate: number;
        photo_path?: string;
    }): Promise<Vehicle> {
        const existing = await VehicleModel.findByPlateNumber(payload.plate_number);
        if (existing) {
            throw new Error('PLATE_NUMBER_EXISTS');
        }
        return VehicleModel.create({
            ...payload,
            daily_rate: payload.daily_rate.toString(),
        });
    }

    static async update(
        id: number,
        payload: Partial<{
            name: string;
            plate_number: string;
            category: string;
            daily_rate: number;
            photo_path: string;
        }>,
    ): Promise<Vehicle> {
        const vehicle = await VehicleModel.findById(id);
        if (!vehicle) {
            throw new Error('VEHICLE_NOT_FOUND');
        }

        if (payload.plate_number && payload.plate_number !== vehicle.plate_number) {
            const existing = await VehicleModel.findByPlateNumber(payload.plate_number);
            if (existing) {
                throw new Error('PLATE_NUMBER_EXISTS');
            }
        }

        // If a new photo was uploaded, delete the old one from disk
        if (payload.photo_path && vehicle.photo_path) {
            fs.unlink(vehicle.photo_path, () => {
                // ignore errors (old file may already be missing)
            });
        }

        const updated = await VehicleModel.update(id, {
            ...payload,
            daily_rate: payload.daily_rate !== undefined ? payload.daily_rate.toString() : undefined,
        });
        return updated as Vehicle;
    }

    static async softDelete(id: number): Promise<void> {
        const vehicle = await VehicleModel.findById(id);
        if (!vehicle) {
            throw new Error('VEHICLE_NOT_FOUND');
        }
        await VehicleModel.softDelete(id);
    }
}