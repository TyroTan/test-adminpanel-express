/* eslint-disable import/no-commonjs */

const yaml = require("js-yaml");
const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");

const { NODE_ENV } = process.env;

if (NODE_ENV) {
  var env = fs.readFileSync(
    path.join(__dirname, `src/config/config.${NODE_ENV}.json`)
  );

  const envParsed = JSON.parse(env);
  Object.keys(envParsed).forEach(key => (process.env[key] = envParsed[key]));
}

const slsConf = yaml.safeLoad(
  fs.readFileSync(path.join(__dirname, "serverless.yml"))
);
const remoteNodeVersion = slsConf.provider.runtime.replace("nodejs", "");

module.exports = {
  // entry: './handler.js',
  entry: slsw.lib.entries,
  target: "node",
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "env",
                {
                  targets: { node: remoteNodeVersion }
                }
              ]
            ]
          }
        }
      }
    ]
  }
};
