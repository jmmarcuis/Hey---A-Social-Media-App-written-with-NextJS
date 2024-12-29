// types/express/index.d.ts
import { IUser } from '../models/userModel.ts';
import { Types } from 'mongoose';
declare global {
  namespace Express {
    interface Request {
      user_id?: Types.ObjectId; 
      user?: IUser;
    }
  }
}