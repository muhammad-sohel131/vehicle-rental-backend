import Joi from 'joi';

export const createVehicleSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  plate_number: Joi.string().trim().min(1).required(),
  category: Joi.string().trim().min(1).required(),
  daily_rate: Joi.number().positive().precision(2).required(),
});

export const updateVehicleSchema = Joi.object({
  name: Joi.string().trim().min(1),
  plate_number: Joi.string().trim().min(1),
  category: Joi.string().trim().min(1),
  daily_rate: Joi.number().positive().precision(2),
}).min(1);

export const vehicleListQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category: Joi.string().trim(),
  search: Joi.string().trim(),
});