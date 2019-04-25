/* eslint-disable camelcase */
import { promisify } from "util";
import { CreateInstance } from "before-hook";
import express from "express";

import jwt_decode from "jwt-decode";
import CognitoDecodeVerifyJWTInit from "../utils/cognito-decode-verify-jwt";
import { SubscriptionsDBLibInit } from "../db-lib";

// const { Op } = Sequelize;
/* eslint-disable-next-line no-unused-vars */
import { AuthMiddleware } from "../custom-middleware";

import {
  /* eslint-disable-next-line no-unused-vars */
  Session,
  Subscription,
  User,
  UserSubscription
} from "../models";
import { format_response } from "../utils/lambda";
import { recurly } from "../services";

const router = express.Router();

const { UNSAFE_BUT_FAST_handler } = CognitoDecodeVerifyJWTInit({
  jwt_decode
});

/* eslint-disable-next-line no-unused-vars */
const subscriptionsDBLib = SubscriptionsDBLibInit({
  User,
  UserSubscription,
  Subscription
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
    const data = await subscriptionsDBLib.getUserSubscriptions(event.user.sub);

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

    const promised = promisify(recurly.subscribe);
    const result = await promised(body);

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
    // const promised = promisify(recurly.getPlans);

    // const data = await promised();

    const { user_id = "" } =
      (await User.findOne({
        where: { user_id_cognito_sub: event.user.sub }
      })) || {};

    if (!user_id) {
      throw Error(418); // unexpected scenario, user not in database.
    }

    const data = await Subscription.findAll({
      include: [
        {
          where: {
            user_id
          },
          attributes: ["user_id"],
          required: false,
          model: User,
          through: {
            attributes: []
          },
          as: "user"
        }
      ]
    });

    return context.json(format_response(data));
  } catch (e) {
    return context.json(format_response(e));
  }
};

const beforeHook = CreateInstance({
  configure: {
    augmentMethods: {
      onReturnObject: (...args) => {
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
