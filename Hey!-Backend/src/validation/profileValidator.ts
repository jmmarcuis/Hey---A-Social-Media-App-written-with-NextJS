import { z } from 'zod';

const profileValidator = {
  CompleteProfile: z.object({
    firstName: z.string().min(3).max(20).trim(),
    lastName: z.string().min(3).max(20).trim(),
    bio: z.string().min(3).max(300).trim(),
    profilePicture: z.string().default("/default-avatar.png"),  
    coverPicture: z.string().default("/default-cover.png"),  
    gender: z.enum(["male", "female", "other"]),  
    dateOfBirth: z.date(),  
  }),
};

export default profileValidator;
