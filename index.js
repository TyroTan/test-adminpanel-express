import express from 'express';

// eslint-disable-next-line import/first
import { User } from './src/db/model';

const app = express();

User.sync();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Example app listening on port 8000!');
});
