// utils/validation.js
import { z } from 'zod';

export function validate(schema) {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }
      next(error);
    }
  };
}

export function validateQuery(schema) {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync(req.query);
      req.validatedQuery = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: error.errors,
        });
      }
      next(error);
    }
  };
}

export function validateParams(schema) {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync(req.params);
      req.validatedParams = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parameters',
          errors: error.errors,
        });
      }
      next(error);
    }
  };
}