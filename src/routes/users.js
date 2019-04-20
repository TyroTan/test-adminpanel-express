/* eslint-disable camelcase */

import { promisify } from 'util';
import { CreateInstance } from 'before-hook';
import express from 'express';

// const { getUserAgencies } = require('../../dataHandlers/agency');

/* eslint-disable-next-line no-unused-vars */
// import { resolve } from './lib/resolver';

/* eslint-disable-next-line no-unused-vars */
// const { Op } = Sequelize;
import jwt_decode from 'jwt-decode';
import { AuthMiddleware } from '../custom-middleware';
import CognitoDecodeVerifyJWTInit from '../utils/cognito-decode-verify-jwt';
import { UsersDBLibInit } from '../db-lib';

import { Session, User } from '../models';
import { format_response } from '../utils/lambda';

const router = express.Router();

const { UNSAFE_BUT_FAST_handler } = CognitoDecodeVerifyJWTInit({
  jwt_decode,
});

const usersDBLib = UsersDBLibInit({ User, Session });

// const { getSubscriptions } = SubscriptionsDBLibInit({ User, Subscription, UserSubscription });

/* eslint-disable-next-line no-unused-vars */
const logSessionUponLoginHandler = async (event, context) => {
  try {
    const got = await usersDBLib.logSessionUponLogin(
      event.authToken,
      event.user,
    );

    return context.json(
      format_response({
        got,
        logged: true,
      }),
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
        /* eslint-disable-next-line no-unused-vars */
        const [event, context = {}] = getParams();

        const responseData = {
          ...arg,
          headers: { 'Access-Control-Allow-Origin': '*' },
        };

        if (typeof context.json === 'function') {
          return context.json(responseData);
        }

        return responseData;
      },
    },
  },
});

const withHook = handler => beforeHook(promisify(handler)).use(
  AuthMiddleware({
    promisify,
    cognitoJWTDecodeHandler: UNSAFE_BUT_FAST_handler,
  }),
);

const logSessionUponLogin = withHook(logSessionUponLoginHandler);

router.post('/logSessionUponLogin', logSessionUponLogin);
export default router;
