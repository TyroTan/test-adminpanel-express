import { Router } from 'express';
import quizController from '../controllers/quizController';

const routes = Router({ strict: true });

routes.get('/', quizController.get);

export default routes;
