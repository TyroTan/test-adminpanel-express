const {
  PG_HOST,
  PG_DATABASE,
  PG_USER,
  PG_PASSWORD,
  PG_PORT,
  JWT_SECRET,
} = process.env;

console.log('PG_HOST', PG_HOST, PG_PORT);

const ENV = 'dev';

export { PG_HOST, PG_DATABASE, PG_USER, PG_PASSWORD, PG_PORT, ENV, JWT_SECRET };
