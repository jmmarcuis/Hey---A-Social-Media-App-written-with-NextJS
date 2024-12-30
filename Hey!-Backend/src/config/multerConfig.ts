import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, 'src/uploads/'); // Local folder for temporary uploads
  },
  filename: (req: Request, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// Configure file filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const fileTypes = /jpeg|jpg|png|gif|webp/; // Acceptable file types
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// Initialize Multer
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB size limit
  },
  fileFilter,
});

export default upload;
