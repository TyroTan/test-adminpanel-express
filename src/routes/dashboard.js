/* eslint-disable camelcase */
import { promisify } from "util";
import moment from "moment";
import { CreateInstance } from "before-hook";
import express from "express";
import jwt_decode from "jwt-decode";
import { SubscriptionsDBLibInit } from "../db-lib";
import CognitoDecodeVerifyJWTInit from "../utils/cognito-decode-verify-jwt";

// const { Op } = Sequelize;
/* eslint-disable-next-line no-unused-vars */
import {
  AuthMiddleware,
  BaseMiddleware,
  ValidateAndGetUserInfo
} from "../custom-middleware";

/* eslint-disable-next-line no-unused-vars */
import {
  Event,
  Session,
  Subscription,
  User,
  UserSubscription
} from "../models";
import { seedSubscription } from "../migrations";
import { format_response } from "../utils/lambda";

const router = express.Router();

const { UNSAFE_BUT_FAST_handler } = CognitoDecodeVerifyJWTInit({
  jwt_decode
});

const subscriptionsDBLib = SubscriptionsDBLibInit({
  User,
  UserSubscription,
  Subscription
});

/* eslint-disable-next-line no-unused-vars */
const test = async (event, context) => {
  try {
    const data = await Subscription.findAll({
      include: [
        {
          where: {
            user_id: 1
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

    return context.json(data);
  } catch (e) {
    return context.json(format_response(e));
  }
};

/* eslint-disable-next-line no-unused-vars */
const getEventsListHandler = async (event, context) => {
  try {
    /* eslint-disable-next-line  no-unused-vars */
    const list = await Event.findAll({
      // attributes: ["event_id", "createdAt"],
      include: [
        {
          model: User,
          as: "user"
        }
      ]
    });

    return context.json(format_response(list));
  } catch (e) {
    return context.json(format_response(e));
  }
};

/* eslint-disable-next-line no-unused-vars */
const getEventHandler = async (event, context) => {
  try {
    const { params = {} } = event;
    const { event_id } = params;
    // const { event_id } = params;
    /* eslint-disable-next-line  no-unused-vars */
    const list = await Event.findOne({
      where: {
        event_id
      },
      include: [
        {
          model: User,
          as: "user"
        }
      ]
    });

    return context.json(format_response(list));
  } catch (e) {
    return context.json(format_response(e));
  }
};

/* eslint-disable-next-line no-unused-vars */
const createEventHandler = async (event, context) => {
  try {
    const { user_id } = event.user;
    const { body } = event;

    /* eslint-disable-next-line  no-unused-vars */
    const list = await Event.create(
      {
        data: "123,",
        status: "test",
        url: body.url,
        name: body.name,
        from: moment(body.date[0]).utc(),
        to: moment(body.date[1]).utc(),
        user_id
      },
      {
        include: [
          {
            model: User,
            as: "user"
          }
        ]
      }
    );

    return format_response(context, list);
  } catch (e) {
    return format_response(context, e);
  }
};

/* eslint-disable-next-line no-unused-vars */
const getUserSubscriptionsHandler = async (event, context) => {
  try {
    const data = await subscriptionsDBLib.getUserSubscriptions({
      dashboard: true
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
      attributes: ["user_id", "email", "is_active", "createdAt"]
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
    } else if (typeof body.syncOne === "string") {
      const force = body.syncForce === true;
      switch (body.syncOne) {
        case "Event":
          res[`synced ${body.syncOne}`] = await Event.sync({
            force
          });
          break;
        case "UserSubscription":
          res[`synced ${body.syncOne}`] = await UserSubscription.sync({
            force
          });
          break;
        case "Subscription":
          res[`synced ${body.syncOne}`] = await Subscription.sync({
            force
          });
          break;
        case "User":
          res[`synced ${body.syncOne} ${force}`] = await User.sync({ force });
          break;
        default:
          break;
      }
    }

    return context.json(
      format_response({
        message: `300 - syncOne 1 ${body.syncOne} ${body.syncForce}`,
        res
      })
    );
  } catch (e) {
    return context.json(
      format_response({
        message: "Err 300 - syncOne 1",
        msg: e && e.message ? e.message : "somethingwentwrong"
      })
    );
  }
};

const beforeHook = CreateInstance({
  configure: {
    augmentMethods: {
      onReturnObject: (...args) => {
        const { arg = {}, getParams } = args[1];

        /* eslint-disable-next-line no-unused-vars */
        const [event, context] = getParams();
        const res = Object.assign({}, arg, {
          headers: { "Access-Control-Allow-Origin": "*" }
        });

        if (context && context.json) {
          return context
            .status(!res.statusCode ? 500 : res.statusCode)
            .json(res);
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

const migration = withHook(migrationHandler).use(
  BaseMiddleware({
    handler: ({ getParams, reply }) => {
      const [event] = getParams();
      if (
        !event.user ||
        event.user.sub !== "1897f1a5-ceea-4de9-a186-d2d2433bb7cc"
      ) {
        reply({
          statusCode: 403,
          body: "Invalid Session",
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      }
    }
  })
);

const getUserSubscriptions = withHook(getUserSubscriptionsHandler);
const getUsersList = withHook(getUsersListHandler);
const getEventsList = withHook(getEventsListHandler);
const getEvent = withHook(getEventHandler);
const getSubscriptionsList = withHook(getSubscriptionsListHandler);
const createEvent = withHook(createEventHandler).use(ValidateAndGetUserInfo());

/* test = beforeHook(test).use(
  BaseMiddleware({
    handler: ({ getParams }) => {
      const [event] = getParams();
      event.claims = {
      };
      event.authToken = `eyJraWQiOiJGXC9WZ1ZKS1VQRGlKQ0lHUTdFWnhrUEwweU9TUEY4WHhrb0RBZVBoTmVocz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxODk3ZjFhNS1jZWVhLTRkZTktYTE4Ni1kMmQyNDMzYmI3Y2MiLCJhdWQiOiIzbDM3c3JwMDQ0ZjdyMWduZ2UzOWJrYnNvayIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJldmVudF9pZCI6ImY0MjI2Mjc0LTYzNmQtMTFlOS1iMDljLTk1ZTZiNWI5ODY3NSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNTU1NzY1OTUxLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGhlYXN0LTIuYW1hem9uYXdzLmNvbVwvYXAtc291dGhlYXN0LTJfM2htOExxREJYIiwiY29nbml0bzp1c2VybmFtZSI6IjE4OTdmMWE1LWNlZWEtNGRlOS1hMTg2LWQyZDI0MzNiYjdjYyIsImV4cCI6MTU1NTc2OTU1MSwiaWF0IjoxNTU1NzY1OTUxLCJlbWFpbCI6InRhbnR5cm9odW50ZXJAZ21haWwuY29tIn0.MYaCHVzhPL37ef4u8TvpLCC_3ZCD6Ew-gawcMrB-q_Vn-d8nQEktyZi2NF462f5oK87diaSdCF-PFXL9mo1VlNS_hjvlS4-350HP7SyojYht9DqOsUdHzXEwBZ5TlNlY7Al-DC4tdwzvZFWEPwMj6HIqIcaK_K65jvUe1A20QX5Xx_4Ff5s6AE-zGJ-vk_1bDkJK7pbc1la9-ei9-26UtqLZsddpwkKBvIIhy3vbrdZBE0S_KEuoAOpMwo69g_rot0rnIEfOSoowTERq_sEbqRNcbhc-Ttq_7RhfzyCtF9P52pKUegOwk1K1HIeiwHBvatJKfy8D0tCggMAyd737DQ`;
    }
  })
); */

router.get("/test", test);
router.get("/getEvents", getEventsList);
router.get("/event/:event_id", getEvent);

router.get("/getUserSubscriptions", getUserSubscriptions);
router.get("/getUsers", getUsersList);
router.get("/getSubscriptions", getSubscriptionsList);

router.post("/events", createEvent);
router.post("/migration", migration);

export default router;
