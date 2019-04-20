import { UsersDBLibInit } from "../db-lib";
import CognitoDecodeVerifyJWTInit from "../utils/cognito-decode-verify-jwt";
import { AuthMiddleware } from "../custom-middleware";

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

/* eslint-disable-next-line no-unused-vars */
const { Session, Subscription, User, UserSubscription, sequelize } = require("../models");

const { UNSAFE_BUT_FAST_handler } = CognitoDecodeVerifyJWTInit({
  jwt_decode
});
const { format_response } = require("../utils/lambda");

// const { getSubscriptions } = SubscriptionsDBLibInit({ User, Subscription, UserSubscription });

/* eslint-disable-next-line no-unused-vars */
const logSessionUponLoginHandler = async (event, context) => {
  try {
    /* eslint-disable-next-line  no-unused-vars */
    const UsersDBLib = UsersDBLibInit({ User, Session });
    await UsersDBLib.logSessionUponLogin(event.authToken, event.user);

    return context.json(
      format_response({
        logged: true
      })
    );
  } catch (e) {
    return context.json(format_response(e));
  }
};

const beforeHook = CreateInstance({
  configure: {
    augmentMethods: {
      onCatch: (...args) => {
        const { arg, getParams = () => {} } = args[1];
          const [event, context = {}] = getParams();

          const responseData = {
            ...arg,
            headers: { "Access-Control-Allow-Origin": "*" }
          };

          if (typeof context.json === "function") {
            return context.json(responseData)
          }

          return responseData
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

const logSessionUponLogin = withHook(logSessionUponLoginHandler);

router.post("/logSessionUponLogin", logSessionUponLogin);

export default router;
