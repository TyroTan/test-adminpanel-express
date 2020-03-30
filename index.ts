import express, { Router } from 'express';
// eslint-disable-next-line import/first
import bodyParser from 'body-parser';
import cors from 'cors';
// import { User } from './src/db/models';
import { userRoutes, authRoutes, quizRoutes } from './src/routes';

const app = express();
// migration commands - only execute if first time building the db
// User.sync({ force: true });

const router = Router({ strict: true });

// const whitelist = ['http://localhost:3001', 'http://example2.com'];
// const corsOptions = {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   origin(origin: any, callback: any): void {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// };

// middlewares
app.use(cors());

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// controller routes
router.use('/user', userRoutes);
router.use('/auth', authRoutes);
router.use('/quiz', quizRoutes);

app.use(router);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 3000;

// on 404
app.get('/*', (req, res) => {
  console.log(req.originalUrl);

  res.status(404).json({
    message: 'Requested path does not exist.',
  });
});

app.listen(PORT, () => {
  console.log(`HTTP Server running on port ${PORT}`);
});
