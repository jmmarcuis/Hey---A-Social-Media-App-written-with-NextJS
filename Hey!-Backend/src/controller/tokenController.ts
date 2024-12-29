// import { Request, Response } from 'express';
// import User, { IUser } from '../models/userModel.js';
// import jwt from 'jsonwebtoken';
// import chalk from 'chalk';

// // Token Configuration
// const TOKEN_CONFIG = {
//   ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET as string,
//   REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET as string,
//   ACCESS_TOKEN_EXPIRY: '15m',
//   REFRESH_TOKEN_EXPIRY: '7d',
// };

// // Token Generation Interfaces
// interface TokenPayload {
//   id: string;
//   email: string;
//   type: 'access' | 'refresh';
// }


// interface AuthTokens {
//   accessToken: string;
//   refreshToken: string;
// }

// // Enhanced Token Generation Functions
// const generateTokens = (user: IUser): AuthTokens => {
//   const accessTokenPayload: TokenPayload = {
//     id: user._id.toString(),
//     email: user.email,
//     type: 'access'
//   };

//   const refreshTokenPayload: TokenPayload = {
//     id: user._id.toString(),
//     email: user.email,
//     type: 'refresh'
//   };

//   const accessToken = jwt.sign(
//     accessTokenPayload,
//     TOKEN_CONFIG.ACCESS_TOKEN_SECRET,
//     { expiresIn: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY }
//   );

//   const refreshToken = jwt.sign(
//     refreshTokenPayload,
//     TOKEN_CONFIG.REFRESH_TOKEN_SECRET,
//     { expiresIn: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY }
//   );

//   return { accessToken, refreshToken };
// };

// // Token Storage and Management
// const storeRefreshToken = async (user: IUser, refreshToken: string) => {
//   // Store refresh token securely 
//   user.refreshTokens = user.refreshTokens || [];
//   user.refreshTokens.push({
//     token: refreshToken,
//     createdAt: new Date(),    
//     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
//   });

//   // Limit number of refresh tokens and remove expired ones
//   user.refreshTokens = user.refreshTokens
//     .filter(token => token.expiresAt > new Date())
//     .slice(-5); // Keep only the last 5 refresh tokens

//   await user.save();
// };

// const tokenController = {
// // Verify Token Controller
//  verifyToken: async (req: Request, res: Response): Promise<any> => {
//     try {
//       // Get token from header
//       const authHeader = req.headers.authorization;
//       if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(401).json({
//           success: false,
//           message: 'No token provided'
//         });
//       }

//       // Extract token
//       const token = authHeader.split(' ')[1];
// 1
//       // Verify token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
//         id: string,
//         email: string
//       };

//       // Find user with decoded token data
//       const user = await User.findOne({
//         _id: decoded.id,
//         email: decoded.email,
//       }).select('-password -verification.otp'); // Exclude sensitive data

//       if (!user) {
//         return res.status(401).json({
//           success: false,
//           message: 'User not found or token invalid'
//         });
//       }

//       // Check if user is still verified
//       if (!user.verification.isVerified) {
//         return res.status(403).json({
//           success: false,
//           message: 'Account is not verified',
//           code: 'UNVERIFIED_ACCOUNT',
//         });
//       }

//       // Debug
//       console.log(chalk.green('[DEBUG] VERIFY SUCCESSFUL'));

//       // Update last activity
//       user.lastActive = new Date();
//       await user.save();

//       // Return success with user data
//       return res.status(200).json({
//         success: true,
//         user: {
//           id: user._id,
//           username: user.username,
//           email: user.email,
//           profile: user.profile,
//           isVerified: user.verification.isVerified,
//         },
//       });
//       // ! IF THIS SHOWS UP YOU ARE STUPID AND RETARDED 
//     } catch (error) {
//       console.error('Token verification error:', error);

//       // Handle specific JWT errors
//       if (error instanceof jwt.JsonWebTokenError) {
//         console.log(chalk.red('[DEBUG FROM VERIFY TOKEN CONTROLLER] INVALID TOKEN'));
//         return res.status(401).json({
//           success: false,
//           message: 'Invalid token',
//           code: 'INVALID_TOKEN',
//         });
//       } else if (error instanceof jwt.TokenExpiredError) {
//         console.log(chalk.red('[DEBUG FROM VERIFY TOKEN CONTROLLER] EXPIRED TOKEN'));
//         return res.status(401).json({
//           success: false,
//           message: 'Token has expired',
//           code: 'TOKEN_EXPIRED',
//         });
//       }

//       // Handle other errors
//       return res.status(500).json({
//         success: false,
//         message: 'Error verifying token',
//         code: 'VERIFICATION_ERROR',
//       });
//     }
//   },

//   // Token Refresh Controller
//   refreshToken: async (req: Request, res: Response): Promise<any> => {
//     try {
//       const { refreshToken } = req.body;

//       if (!refreshToken) {
//         return res.status(401).json({
//           success: false,
//           message: 'Refresh token is required'
//         });
//       }

//       // Verify the refresh token
//       const decoded = jwt.verify(
//         refreshToken,
//         TOKEN_CONFIG.REFRESH_TOKEN_SECRET
//       ) as TokenPayload;

//       // Find user and check if refresh token is valid
//       const user = await User.findOne({
//         _id: decoded.id,
//         email: decoded.email
//       });

//       if (!user) {
//         return res.status(401).json({
//           success: false,
//           message: 'Invalid refresh token'
//         });
//       }

//       // Check if refresh token is in user's stored tokens
//       const storedTokenExists = user.refreshTokens.some(
//         token => token.token === refreshToken
//       );

//       if (!storedTokenExists) {
//         return res.status(401).json({
//           success: false,
//           message: 'Refresh token has been invalidated'
//         });
//       }

//       // Generate new tokens
//       const {
//         accessToken: newAccessToken,
//         refreshToken: newRefreshToken
//       } = generateTokens(user);

//       // Store new refresh token
//       await storeRefreshToken(user, newRefreshToken);

//       return res.status(200).json({
//         success: true,
//         accessToken: newAccessToken,
//         refreshToken: newRefreshToken
//       });

//       // ! IF THIS SHOWS UP YOU ARE STUPID AND RETARDED 
//     } catch (error) {
//       console.error('Token refresh error:', error);

//       if (error instanceof jwt.TokenExpiredError) {
//         return res.status(401).json({
//           success: false,
//           message: 'Refresh token expired'
//         });
//       }

//       return res.status(500).json({
//         success: false,
//         message: 'Error refreshing token'
//       });
//     }
//   },

//   // Logout Controller (Invalidate Tokens)
//   logout: async (req: Request, res: Response): Promise<any> => {
//     try {
//       const { refreshToken } = req.body;
//       const user = req.user as IUser;

//       if (!user) {
//         return res.status(401).json({
//           success: false,
//           message: 'Unauthorized'
//         });
//       }

//       // Remove specific refresh token
//       user.refreshTokens = user.refreshTokens.filter(
//         token => token.token !== refreshToken
//       );

//       await user.save();

//       return res.status(200).json({
//         success: true,
//         message: 'Logged out successfully'
//       });
//     } catch (error) {
//       console.error('Logout error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Error during logout'
//       });
//     }
//   },
// }

//   export default tokenController;