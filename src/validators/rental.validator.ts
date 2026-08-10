import Joi from 'joi';

export const createRentalSchema = Joi.object({
  vehicle_id: Joi.number().integer().positive().required(),
  customer_name: Joi.string().trim().min(1).required(),
  customer_phone: Joi.string().trim().min(1).required(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).required(),
});

export const updateRentalSchema = Joi.object({
  vehicle_id: Joi.number().integer().positive(),
  customer_name: Joi.string().trim().min(1),
  customer_phone: Joi.string().trim().min(1),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso().min(Joi.ref('start_date')),
  status: Joi.string().valid('booked', 'ongoing', 'completed', 'cancelled'),
}).min(1);

export const rentalListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  vehicle_id: Joi.number().integer().positive(),
  status: Joi.string().valid('booked', 'ongoing', 'completed', 'cancelled'),
  from_date: Joi.date().iso(),
  to_date: Joi.date().iso(),
});