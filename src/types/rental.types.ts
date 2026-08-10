import { RentalStatus } from '../models/rental.model';

export interface CreateRentalRequestBody {
  vehicle_id: number;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
}

export interface UpdateRentalRequestBody {
  vehicle_id?: number;
  customer_name?: string;
  customer_phone?: string;
  start_date?: string;
  end_date?: string;
  status?: RentalStatus;
}

export interface RentalListQuery {
  page?: string;
  limit?: string;
  vehicle_id?: string;
  status?: RentalStatus;
  from_date?: string;
  to_date?: string;
}

export interface RentalResponseBody {
  id: number;
  vehicle_id: number;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  total_amount: string;
  status: RentalStatus;
  created_at: Date;
  updated_at: Date;
}