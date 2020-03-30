import { Router } from 'express';
import authController from '../controllers/authController';

const routes = Router({ strict: true });

routes.post('/register', authController.register);
routes.post('/login', authController.login);
routes.get('/me', authController.me);

export default routes;
