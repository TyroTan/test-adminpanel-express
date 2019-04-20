/* eslint-disable no-console */
/* eslint-disable import/no-commonjs */
/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
const config = require('./webpack.config');
const { join } = require('path');
const { spawn } = require('child_process');

config.entry = './local-serve.js';
config.devtool = 'source-map';
config.output = {
  path: join(__dirname, '.webpack', 'local'),
  filename: 'serve.js',
};
config.module.rules.forEach((rule) => {
  if (rule.use.loader === 'babel-loader') {
    try {
      rule.use.options.presets.forEach((preset) => {
        try {
          // eslint-disable-next-line no-param-reassign
          if (preset[0] === 'env') preset[1].targets.node = 'current';
        } catch (_) {} // eslint-disable-line no-empty
      });
    } catch (_) {} // eslint-disable-line no-empty
  }
});

let pid = null;

const restart = () => {
  if (pid) pid.kill();
  pid = spawn('node', [join(__dirname, '.webpack', 'local', 'serve.js')], { stdio: 'inherit' });
};

webpack(config).watch({}, (err, stats) => {
  console.log();
  console.log();
  console.log(stats.toString({ colors: true }));
  console.log();
  restart();
});
