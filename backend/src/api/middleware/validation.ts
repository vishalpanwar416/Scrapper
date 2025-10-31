/**
 * Input Validation Middleware
 * Validates request data (body, query, params) before processing
 */

import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler.js';

export type ValidationType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface ValidationRule {
  type: ValidationType;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: (string | number)[];
  custom?: (value: any) => boolean | string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

/**
 * Validate a single field
 */
const validateField = (value: any, rule: ValidationRule, fieldName: string): string | null => {
  // Check if required
  if (rule.required && (value === undefined || value === null || value === '')) {
    return `${fieldName} is required`;
  }

  // Allow undefined/null for non-required fields
  if (!rule.required && (value === undefined || value === null)) {
    return null;
  }

  // Type validation
  const isArray = Array.isArray(value);
  if (rule.type === 'array') {
    if (!isArray) {
      return `${fieldName} must be an array`;
    }
  } else if (rule.type !== 'object' && typeof value !== rule.type) {
    return `${fieldName} must be of type ${rule.type}`;
  }

  // String validations
  if (rule.type === 'string' && typeof value === 'string') {
    const min = rule.min;
    const max = rule.max;

    if (min !== undefined && value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    if (max !== undefined && value.length > max) {
      return `${fieldName} must not exceed ${max} characters`;
    }
    if (rule.pattern && !rule.pattern.test(value)) {
      return `${fieldName} format is invalid`;
    }
    if (rule.enum && !rule.enum.includes(value)) {
      return `${fieldName} must be one of: ${rule.enum.join(', ')}`;
    }
  }

  // Number validations
  if (rule.type === 'number' && typeof value === 'number') {
    const min = rule.min;
    const max = rule.max;

    if (min !== undefined && value < min) {
      return `${fieldName} must be at least ${min}`;
    }
    if (max !== undefined && value > max) {
      return `${fieldName} must not exceed ${max}`;
    }
    if (rule.enum && !rule.enum.includes(value)) {
      return `${fieldName} must be one of: ${rule.enum.join(', ')}`;
    }
  }

  // Array validations
  if (rule.type === 'array' && isArray) {
    const min = rule.min;
    const max = rule.max;

    if (min !== undefined && value.length < min) {
      return `${fieldName} must have at least ${min} items`;
    }
    if (max !== undefined && value.length > max) {
      return `${fieldName} must not have more than ${max} items`;
    }
  }

  // Custom validation
  if (rule.custom) {
    const result = rule.custom(value);
    if (result !== true) {
      return typeof result === 'string' ? result : `${fieldName} validation failed`;
    }
  }

  return null;
};

/**
 * Validate request body against schema
 */
export const validateBody = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { [key: string]: string } = {};

    // Validate each field in schema
    for (const [fieldName, rule] of Object.entries(schema)) {
      const value = req.body[fieldName];
      const error = validateField(value, rule, fieldName);
      if (error) {
        errors[fieldName] = error;
      }
    }

    // If there are errors, return 400
    if (Object.keys(errors).length > 0) {
      return next(
        new CustomError(
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          errors
        )
      );
    }

    next();
  };
};

/**
 * Validate request query parameters
 */
export const validateQuery = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { [key: string]: string } = {};

    for (const [fieldName, rule] of Object.entries(schema)) {
      let value: any = req.query[fieldName];

      // Convert string to appropriate type
      if (rule.type === 'number' && typeof value === 'string') {
        value = Number(value);
      } else if (rule.type === 'boolean' && typeof value === 'string') {
        value = value === 'true' || value === '1';
      }

      const error = validateField(value, rule, fieldName);
      if (error) {
        errors[fieldName] = error;
      }
    }

    if (Object.keys(errors).length > 0) {
      return next(
        new CustomError(
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          errors
        )
      );
    }

    next();
  };
};

/**
 * Validate request URL parameters
 */
export const validateParams = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { [key: string]: string } = {};

    for (const [fieldName, rule] of Object.entries(schema)) {
      const value = req.params[fieldName];
      const error = validateField(value, rule, fieldName);
      if (error) {
        errors[fieldName] = error;
      }
    }

    if (Object.keys(errors).length > 0) {
      return next(
        new CustomError(
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          errors
        )
      );
    }

    next();
  };
};

/**
 * Validate entire request (body + query + params)
 */
export const validate = (
  bodySchema?: ValidationSchema,
  querySchema?: ValidationSchema,
  paramsSchema?: ValidationSchema
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { [key: string]: string } = {};

    // Validate body
    if (bodySchema) {
      for (const [fieldName, rule] of Object.entries(bodySchema)) {
        const value = req.body[fieldName];
        const error = validateField(value, rule, `body.${fieldName}`);
        if (error) errors[fieldName] = error;
      }
    }

    // Validate query
    if (querySchema) {
      for (const [fieldName, rule] of Object.entries(querySchema)) {
        let value: any = req.query[fieldName];
        if (rule.type === 'number' && typeof value === 'string') {
          value = Number(value);
        }
        const error = validateField(value, rule, `query.${fieldName}`);
        if (error) errors[`query.${fieldName}`] = error;
      }
    }

    // Validate params
    if (paramsSchema) {
      for (const [fieldName, rule] of Object.entries(paramsSchema)) {
        const value = req.params[fieldName];
        const error = validateField(value, rule, `params.${fieldName}`);
        if (error) errors[`params.${fieldName}`] = error;
      }
    }

    if (Object.keys(errors).length > 0) {
      return next(
        new CustomError(
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          errors
        )
      );
    }

    next();
  };
};

/**
 * Sanitize request body
 * Removes potentially dangerous content
 */
export const sanitizeBody = (req: Request, res: Response, next: NextFunction) => {
  // Remove script tags and dangerous attributes
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove script tags and event handlers
      return obj
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .trim();
    } else if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }

  next();
};

/**
 * Trim string fields in request body
 */
export const trimStrings = (req: Request, res: Response, next: NextFunction) => {
  const trim = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim();
    } else if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        return obj.map(trim);
      }
      const trimmed: any = {};
      for (const [key, value] of Object.entries(obj)) {
        trimmed[key] = trim(value);
      }
      return trimmed;
    }
    return obj;
  };

  if (req.body) {
    req.body = trim(req.body);
  }

  next();
};

/**
 * Validate scraper-specific data
 */
export const validateScraperInput = validateBody({
  websiteId: {
    type: 'string',
    required: true,
    min: 1,
  },
});

/**
 * Validate website creation
 */
export const validateWebsiteCreation = validateBody({
  name: {
    type: 'string',
    required: true,
    min: 3,
    max: 255,
  },
  url: {
    type: 'string',
    required: true,
    pattern: /^https?:\/\/.+/,
  },
  selectors: {
    type: 'object',
    required: false,
  },
});

/**
 * Validate product filtering
 */
export const validateProductFilter = validateQuery({
  websiteId: {
    type: 'string',
    required: false,
  },
  limit: {
    type: 'number',
    required: false,
    min: 1,
    max: 100,
  },
  offset: {
    type: 'number',
    required: false,
    min: 0,
  },
  search: {
    type: 'string',
    required: false,
    max: 255,
  },
});
