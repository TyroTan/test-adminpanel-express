import { SubscriptionsDBLibInit } from "../db-lib";
import CognitoDecodeVerifyJWTInit from "../utils/cognito-decode-verify-jwt";

const { promisify } = require("util");
const { CreateInstance } = require("before-hook");
const express = require("express");

const router = express.Router();
// const { getUserAgencies } = require('../../dataHandlers/agency');

/* eslint-disable camelcase, import/prefer-default-export */

/* eslint-disable-next-line no-unused-vars */
// import { resolve } from './lib/resolver';

/* eslint-disable-next-line no-unused-vars */
// const { Op } = Sequelize;
const jwt_decode = require("jwt-decode");
const { AuthMiddleware } = require("../custom-middleware");

/* eslint-disable-next-line no-unused-vars */
const { Session, Subscription, User, UserSubscription } = require("../models");


const { UNSAFE_BUT_FAST_handler } = CognitoDecodeVerifyJWTInit({
  jwt_decode
});
const { format_response } = require("../utils/lambda");
const { recurly } = require("../services");

const { getUserSubscriptions } = SubscriptionsDBLibInit({
  User,
  Subscription,
  UserSubscription
});

/* eslint-disable-next-line no-unused-vars */
const getListHandler = async (event, context, next) => {
  try {
    const promised = promisify(recurly.getlist);

    const data = await promised();

    return context.json({ data });
  } catch (e) {
    return context.json(format_response(e));
    // return next(e);
  }
};

/* eslint-disable-next-line no-unused-vars */
const getAccountHandler = async (event, context) => {
  try {
    const promised = promisify(recurly.getAccount);

    const data = await promised(event.user.sub);
    // return format_response(data);
    return context.json(format_response(data));
  } catch (e) {
    return context.json(format_response(e));
  }
};

/* eslint-disable-next-line no-unused-vars */
const getSubscriptionsHandler = async (event, context) => {
  try {
    const data = await getUserSubscriptions(event.user.sub);

    return context.json(format_response(data));
  } catch (e) {
    return context.json(format_response(e));
  }
};

/* eslint-disable-next-line no-unused-vars */
const subscribeHandler = async (event, context) => {
  try {
    /* eslint-disable-next-line no-unused-vars */
    const { body = {} } = event;
    let insertAction = () => {};

    body.account_code = event.user.sub;
    /* eslint-disable-next-line no-unused-vars */
    const subscriptionsDBLib = SubscriptionsDBLibInit({
      User,
      UserSubscription,
      Subscription
    });

    try {
      insertAction = await subscriptionsDBLib.subscribe({
        userSub: event.user.sub,
        planCode: body.plan_code
      });
    } catch (e) {
      return context.json(
        format_response({
          statusCode: 422,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({
            e: e && e.message
          })
        })
      );
    }

    // const promised = promisify(recurly.subscribe);
    const result = {}; // await promised(body);

    if (result && result.subscription && result.subscription.uuid) {
      await insertAction();
      return context.json(
        format_response({
          success: true,
          uuid: result.subscription.uuid
        })
      );
    }

    /** DB LOG - why the txn failed * */
    return context.json(format_response({ statusCode: 500, msg: "failure" }));
  } catch (e) {
    return context.json(format_response(e));
  }
};

/* eslint-disable-next-line no-unused-vars */
const getPlansHandler = async (event, context) => {
  try {
    const promised = promisify(recurly.getPlans);

    const data = await promised();

    return context.json(format_response(data));
  } catch (e) {
    return context.json(format_response(e));
  }
};

const beforeHook = CreateInstance({
  configure: {
    augmentMethods: {
      onCatch: (...args) => {
        const { arg = {}, getParams } = args[1];
        const res = Object.assign({}, arg, {
          headers: { "Access-Control-Allow-Origin": "*" }
        });

        if (
          getParams &&
          getParams()[1] &&
          typeof getParams()[1].json === "function"
        ) {
          return getParams()[1].json(arg);
        }

        return res;
      }
    }
  }
});

const withHook = handler =>
  beforeHook(promisify(handler)).use(
    AuthMiddleware({
      promisify,
      cognitoJWTDecodeHandler: UNSAFE_BUT_FAST_handler
    })
  );

const getlist = withHook(getListHandler);
const getAccount = withHook(getAccountHandler);
const subscribe = withHook(subscribeHandler);
const getPlans = withHook(getPlansHandler);
const getSubscriptions = withHook(getSubscriptionsHandler);

router.get("/getAccount", getAccount);
router.get("/getList", getlist);
router.post("/subscribe", subscribe);
router.get("/getPlans", getPlans);
router.get("/getSubscriptions", getSubscriptions);

export default router;
