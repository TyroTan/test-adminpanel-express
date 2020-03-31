import { Router } from 'express';
import userController from '../controllers/userController';
import authController from '../controllers/authController';

const userRoutes = Router({ strict: true });

userRoutes.get('/', userController.get);

// TODO
userRoutes.post('/', authController.register);

export default userRoutes;
