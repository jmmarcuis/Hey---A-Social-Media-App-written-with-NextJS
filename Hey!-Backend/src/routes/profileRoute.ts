// // routes/profileRoutes.js
// import express from 'express';
// import { authMiddleware } from '../middleware/authMiddleware.js';
// import { verifyMiddleware } from '../middleware/verifyMiddleware.js';
// import { profileController } from '../controllers/profileController.js';

// const router = express.Router();

// // Ensure user is authenticated and verified
// router.use(authMiddleware, verifyMiddleware);

// // Get the user's profile
// router.get('/', profileController.getProfile);

// // Update the user's profile
// router.put('/', profileController.updateProfile);

// export default router;