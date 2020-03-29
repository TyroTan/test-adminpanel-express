// import aws from "aws-sdk";
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import pg from 'pg';
import Sequelize from 'sequelize';

import UserClass from './UserClass';

// import { AwsKMSInit } from "../services";

/* eslint-disable-next-line no-unused-vars */
// const { getPw } = AwsKMSInit({ aws });

import { PG_DATABASE, PG_USER, PG_HOST, PG_PORT, PG_PASSWORD } from '../config';

const sequelize = new Sequelize(
  `${PG_DATABASE}`,
  `${PG_USER}`,
  `${PG_PASSWORD}`,
  {
    dialect: 'postgres',
    host: `${PG_HOST}`,
    port: `${PG_PORT}`,
    logging: false,
    // logging: rawQuery => {
    //   console.log('loggger23123', rawQuery);
    // },
    define: {
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
    pool: {
      max: 5,
      min: 0,
      idle: 20000,
      handleDisconnects: true,
    },
    dialectOptions: {
      requestTimeout: 100000,
    },
  },
);

const User = UserClass({
  sequelize,
  Sequelize,
});

export { User, sequelize, Sequelize };
