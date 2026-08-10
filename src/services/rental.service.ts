import { RentalModel, Rental, RentalListFilters, RentalStatus } from '../models/rental.model';
import { VehicleModel } from '../models/vehicle.model';
import db from '../config/database';

function calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return diffDays + 1; // same start/end date counts as 1 day
}

export class RentalService {
    static async list(filters: RentalListFilters) {
        return RentalModel.findAll(filters);
    }

    static async getById(id: number): Promise<Rental> {
        const rental = await RentalModel.findById(id);
        if (!rental) {
            throw new Error('RENTAL_NOT_FOUND');
        }
        return rental;
    }

    static async create(payload: {
        vehicle_id: number;
        customer_name: string;
        customer_phone: string;
        start_date: string;
        end_date: string;
    }): Promise<Rental> {
        const vehicle = await VehicleModel.findById(payload.vehicle_id);
        if (!vehicle) {
            throw new Error('VEHICLE_NOT_FOUND');
        }

        const days = calculateDays(payload.start_date, payload.end_date);
        const totalAmount = days * Number(vehicle.daily_rate);

        return db.transaction(async (trx) => {
            // Lock this vehicle_id for the duration of the transaction so a
            // concurrent request for the same vehicle has to wait its turn.
            await RentalModel.lockVehicle(trx, payload.vehicle_id);

            const overlap = await RentalModel.hasOverlap(
                payload.vehicle_id,
                payload.start_date,
                payload.end_date,
                undefined,
                trx,
            );
            if (overlap) {
                throw new Error('OVERLAPPING_RENTAL');
            }

            return RentalModel.create(
                {
                    ...payload,
                    total_amount: totalAmount.toFixed(2),
                },
                trx,
            );
        });
    }

    static async update(
        id: number,
        payload: Partial<{
            vehicle_id: number;
            customer_name: string;
            customer_phone: string;
            start_date: string;
            end_date: string;
            status: RentalStatus;
        }>,
    ): Promise<Rental> {
        const rental = await RentalModel.findById(id);
        if (!rental) {
            throw new Error('RENTAL_NOT_FOUND');
        }

        const vehicleId = payload.vehicle_id ?? rental.vehicle_id;
        const startDate = payload.start_date ?? rental.start_date;
        const endDate = payload.end_date ?? rental.end_date;

        const datesOrVehicleChanged =
            payload.start_date !== undefined ||
            payload.end_date !== undefined ||
            payload.vehicle_id !== undefined;

        if (!datesOrVehicleChanged) {
            const updated = await RentalModel.update(id, payload);
            return updated as Rental;
        }

        const vehicle = await VehicleModel.findById(vehicleId);
        if (!vehicle) {
            throw new Error('VEHICLE_NOT_FOUND');
        }
        const days = calculateDays(startDate, endDate);
        const totalAmountUpdate = (days * Number(vehicle.daily_rate)).toFixed(2);

        return db.transaction(async (trx) => {
            await RentalModel.lockVehicle(trx, vehicleId);

            const overlap = await RentalModel.hasOverlap(vehicleId, startDate, endDate, id, trx);
            if (overlap) {
                throw new Error('OVERLAPPING_RENTAL');
            }

            const updated = await RentalModel.update(
                id,
                { ...payload, total_amount: totalAmountUpdate },
                trx,
            );
            return updated as Rental;
        });
    }

    static async remove(id: number): Promise<void> {
        const rental = await RentalModel.findById(id);
        if (!rental) {
            throw new Error('RENTAL_NOT_FOUND');
        }
        await RentalModel.delete(id);
    }
}