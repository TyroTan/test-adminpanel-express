import express, { Router } from 'express';
// eslint-disable-next-line import/first
// import { User } from './src/db/model';
import bodyParser from 'body-parser';
import { userRoutes, authRoutes } from './src/routes';

const app = express();

// migration commands - only execute if first time building the db
// User.sync();

const router = Router({ strict: true });

// middlewares
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// controller routes
router.use('/user', userRoutes);
router.use('/auth', authRoutes);

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
