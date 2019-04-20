/* eslint-disable-next-line no-unused-vars */

/* eslint-disable-next-line no-unused-vars */
import UserClass from "./UserClass";
import SessionClass from "./SessionClass";
import SubscriptionClass from "./SubscriptionClass";
import UserSubscriptionClass from "./UserSubscriptionClass";

import aws from "aws-sdk";

import { AwsKMSInit } from "../services";
const Sequelize = require("sequelize");
const pg = require("pg");

/* eslint-disable-next-line no-unused-vars */
const { getPw } = AwsKMSInit({ aws });

const { PG_DATABASE, PG_USER, PG_HOST, PG_PORT, PG_PASSWORD } = process.env;

const sequelize = new Sequelize(
  `${PG_DATABASE}`,
  `${PG_USER}`,
  `${PG_PASSWORD}`,
  {
    dialect: "postgres",
    host: `${PG_HOST}`,
    port: `${PG_PORT}`,
    logging: false,
    define: {
      charset: "utf8",
      collate: "utf8_general_ci"
    },
    pool: {
      max: 5,
      min: 0,
      idle: 20000,
      handleDisconnects: true
    },
    dialectOptions: {
      requestTimeout: 100000
    }
  }
);

const Session = SessionClass({
  sequelize,
  Sequelize
});

const Subscription = SubscriptionClass({
  sequelize,
  Sequelize
});
const User = UserClass(
  {
    sequelize,
    Sequelize
  },
  { Session }
);
const UserSubscription = UserSubscriptionClass({
  sequelize,
  Sequelize
});
Subscription.belongsToMany(User, {
  through: UserSubscription,
  as: "user",
  foreignKey: "subscription_id"
});
User.belongsToMany(Subscription, {
  through: UserSubscription,
  as: "user_subscription",
  foreignKey: "user_id"
});
// UserSubscription.belongsTo(models.Role, { as: "role", foreignKey: "roleId" });
UserSubscription.belongsTo(User, { as: "user", foreignKey: "user_id" });
UserSubscription.belongsTo(Subscription, {
  as: "subscription",
  foreignKey: "subscription_id"
});
// through is required!

export { Session, Subscription, User, UserSubscription, sequelize, Sequelize };
