// validation/profileValidator.ts
import { z } from 'zod';

const CompleteProfile = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  bio: z.string().max(300).optional(),
  gender: z.enum(['male', 'female', 'other']),
  dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }), 
});

export default {
  CompleteProfile,
};