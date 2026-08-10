export interface CreateVehicleRequestBody {
    name: string;
    plate_number: string;
    category: string;
    daily_rate: number;
}

export interface UpdateVehicleRequestBody {
    name?: string;
    plate_number?: string;
    category?: string;
    daily_rate?: number;
}

export interface VehicleListQuery {
    page?: string;
    limit?: string;
    category?: string;
    search?: string;
}

export interface VehicleResponseBody {
    id: number;
    name: string;
    plate_number: string;
    category: string;
    daily_rate: string;
    photo_path: string | null;
    deleted_at: Date | null;
    created_at: Date;
    updated_at: Date;
}