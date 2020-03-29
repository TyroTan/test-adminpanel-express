import { Router } from 'express';
import userController from '../controllers/userController';

const userRoutes = Router({ strict: true });

userRoutes.get('/', userController.get);

export default userRoutes;
