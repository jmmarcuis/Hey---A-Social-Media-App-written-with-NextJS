// routes/profileRoutes.js
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { verifyMiddleware } from '../middleware/verifyMiddleware.js';
import { profileController } from '../controller/profileController.js';
import { validateData } from '../middleware/validationMiddleware.js';
import profileValidator from '../validation/profileValidator.js';

const router = express.Router();

// Ensure user is authenticated and verified
router.use(authMiddleware);

// Get the user's profile
router.get('/', profileController.getProfile);

// Complete a verified user's profile
router.put('/completeprofile', validateData(profileValidator.CompleteProfile), profileController.completeProfile)

// Update the user's profile
router.put('/', profileController.updateProfile);


export default router;