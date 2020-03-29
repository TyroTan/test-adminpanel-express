const {
  PG_HOST,
  PG_DATABASE,
  PG_USER,
  PG_PASSWORD,
  PG_PORT,
  JWT_SECRET,
} = process.env;

const ENV = 'dev';

export { PG_HOST, PG_DATABASE, PG_USER, PG_PASSWORD, PG_PORT, ENV, JWT_SECRET };
