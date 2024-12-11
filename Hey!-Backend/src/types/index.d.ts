// types/express/index.d.ts
import { IUser } from '../models/userModel.ts';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}