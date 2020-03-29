import { Router } from 'express';
import authController from '../controllers/authController';

const routes = Router({ strict: true });

routes.post('/register', authController.register);

export default routes;
