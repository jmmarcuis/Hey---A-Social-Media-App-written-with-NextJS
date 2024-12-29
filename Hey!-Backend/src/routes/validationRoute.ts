import { Router } from 'express';
import {
    authMiddleware,
} from '../middleware/authMiddleware.js';
import validationController from "../controller/validationController.js"

const router = Router()

router.get('/isVerified', authMiddleware, validationController.isVerified)
router.get('/isProfileComplete', authMiddleware, validationController.isProfileComplete)
export default router;
