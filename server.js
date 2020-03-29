/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-commonjs */
// Transpile all code following this line with babel and use '@babel/preset-env' (aka ES6) preset.
require('@babel/register')({
  presets: ['@babel/preset-env'],
});

const dotenv = require('dotenv');

const env = dotenv.config();
Object.keys(env && env.parsed ? env.parsed : {}).forEach((variable) => {
  const val = (env.parsed || {})[variable];

  process.env[variable] = val;
  console.log('nowprocess.env[variable]', variable, process.env[variable]);
});

// Import the rest of our application.
module.exports = require('./index.js');
