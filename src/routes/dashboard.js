/* eslint-disable camelcase */
import { promisify } from 'util';
import { CreateInstance } from 'before-hook';
import express from 'express';
import jwt_decode from 'jwt-decode';
import { SubscriptionsDBLibInit } from '../db-lib';
import CognitoDecodeVerifyJWTInit from '../utils/cognito-decode-verify-jwt';


/* eslint-disable-next-line no-unused-vars */
// const { Op } = Sequelize;
import { AuthMiddleware, BaseMiddleware } from '../custom-middleware';

/* eslint-disable-next-line no-unused-vars */
import {
  Session, Subscription, User, UserSubscription,
} from '../models';
import { seedSubscription } from '../migrations';
import { format_response } from '../utils/lambda';

const router = express.Router();

const { UNSAFE_BUT_FAST_handler } = CognitoDecodeVerifyJWTInit({
  jwt_decode,
});

const subscriptionsDBLib = SubscriptionsDBLibInit({
  User,
  UserSubscription,
  Subscription,
});


/* eslint-disable-next-line no-unused-vars */
const getUserSubscriptionsHandler = async (event, context) => {
  try {
    const data = await subscriptionsDBLib.getUserSubscriptions({
      dashboard: true,
    });

    return context.json(format_response(data));
  } catch (e) {
    return context.json(format_response(e));
  }
};

/* eslint-disable-next-line no-unused-vars */
const getUsersListHandler = async (event, context) => {
  try {
    /* eslint-disable-next-line  no-unused-vars */
    const list = await User.findAll({
      attributes: ['user_id', 'email', 'is_active', 'createdAt'],
    });

    return context.json(format_response(list));
  } catch (e) {
    return context.json(format_response(e));
  }
};

/* eslint-disable-next-line no-unused-vars */
const getSubscriptionsListHandler = async (event, context) => {
  try {
    /* eslint-disable-next-line  no-unused-vars */
    const list = await Subscription.findAll({});

    return context.json(format_response(list));
  } catch (e) {
    return context.json(format_response(e));
  }
};

/* eslint-disable-next-line no-unused-vars */
const migrationHandler = async (event, context) => {
  const { body = {} } = event;
  const res = {};

  try {
    if (body && body.view === true) {
      res.user = await User.findAll();
      res.subscription = await Subscription.findAll();
      res.userSubscription = await UserSubscription.findAll();
    } else if (body.resetAll === true) {
      await User.sync({ force: true });
      await Session.sync({ force: true });
      await Subscription.sync({ force: true });
      await UserSubscription.sync({ force: true });
      await seedSubscription(Subscription);
    } else if (body.seed === true) {
      await seedSubscription(Subscription);
    } else if (typeof body.syncOne === 'string') {
      const force = body.syncForce === true;
      switch (body.syncOne) {
        case 'UserSubscription':
          res[`synced ${body.syncOne}`] = await UserSubscription.sync({
            force,
          });
          break;
        case 'Subscription':
          res[`synced ${body.syncOne}`] = await Subscription.sync({
            force,
          });
          break;
        case 'User':
          res[`synced ${body.syncOne} ${force}`] = await User.sync({ force });
          break;
        default:
          break;
      }
    }

    return context.json(
      format_response({
        message: `300 - syncOne 1 ${body.syncOne} ${body.syncForce}`,
        res,
      }),
    );
  } catch (e) {
    return context.json(
      format_response({
        message: 'Err 300 - syncOne 1',
        msg: e && e.message ? e.message : 'somethingwentwrong',
      }),
    );
  }
};

const beforeHook = CreateInstance({
  configure: {
    augmentMethods: {
      onCatch: (...args) => {
        const { arg = {}, getParams } = args[1];

        /* eslint-disable-next-line no-unused-vars */
        const [event, context] = getParams();
        const res = Object.assign({}, arg, {
          headers: { 'Access-Control-Allow-Origin': '*' },
        });

        if (context && context.json) {
          return context.json(res);
        }

        return res;
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

const migration = withHook(migrationHandler).use(
  BaseMiddleware({
    handler: ({ getParams, getHelpers }) => {
      const { returnAndSendResponse } = getHelpers();
      const [event] = getParams();
      if (
        !event.user
        || event.user.sub !== '1897f1a5-ceea-4de9-a186-d2d2433bb7cc'
      ) {
        return returnAndSendResponse({
          statusCode: 403,
          body: 'Invalid Session',
          headers: { 'Access-Control-Allow-Origin': '*' },
        });
      }

      return {};
    },
  }),
);
const getUserSubscriptions = withHook(getUserSubscriptionsHandler);
const getUsersList = withHook(getUsersListHandler);
const getSubscriptionsList = withHook(getSubscriptionsListHandler);

router.post('/migration', migration);
router.get('/getUserSubscriptions', getUserSubscriptions);
router.get('/getUsers', getUsersList);
router.get('/getSubscriptions', getSubscriptionsList);

export default router;
