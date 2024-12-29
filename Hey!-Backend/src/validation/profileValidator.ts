  import { z } from 'zod';

  const profileValidator = {
    CompleteProfile: z.object({
      firstName: z.string().min(3).max(20).trim(),
      lastName: z.string().min(3).max(20).trim(),
      bio: z.string().min(3).max(300).trim(),
      profilePicture: z.string().default("/https://res.cloudinary.com/drf4qnjow/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1735186204/profile_pictures/Fba0rk0XEAEn8Ix_iun2p4.jpg"),  
      coverPicture: z.string().default("/https://res.cloudinary.com/drf4qnjow/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1735186204/profile_pictures/Fba0rk0XEAEn8Ix_iun2p4.jpg"),  
      gender: z.enum(["male", "female", "other"]),  
      dateOfBirth: z.string().transform((val) => new Date(val)),    }),
  };

  export default profileValidator;
