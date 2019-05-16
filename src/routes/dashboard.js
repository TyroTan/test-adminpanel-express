/* eslint-disable camelcase */
import { promisify } from "util";
import moment from "moment";
import { CreateInstance } from "before-hook";
import express from "express";
import jwt_decode from "jwt-decode";
import Joi from "joi";
import { EventDBLibInit, SubscriptionsDBLibInit } from "../db-lib";
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
  EventUserPoll,
  EventUserQuestion,
  Session,
  Subscription,
  User,
  UserSubscription,
  sequelize
} from "../models";
import { seedSubscription } from "../migrations";
import { format_response } from "../utils/lambda";
// import { migrationHookEventUserPoll } from "../migrations/hook";

const { getQuestionsAndPolls, getPolls, getQuestions } = EventDBLibInit({
  Event,
  EventUserPoll,
  EventUserQuestion,
  User,
  sequelize
});

const router = express.Router();

const { UNSAFE_BUT_FAST_handler } = CognitoDecodeVerifyJWTInit({
  jwt_decode
});

const subscriptionsDBLib = SubscriptionsDBLibInit({
  User,
  UserSubscription,
  Subscription
});

const getValidationSchemaPoll = keys =>
  Joi.object().keys({
    user_id: Joi.number().required(),
    question: Joi.string().required(),
    event_id: Joi.number().required(),
    data: Joi.string().required(),
    dynamic_field_0: Joi.string().allow(""),
    dynamic_field_1: Joi.string().allow(""),
    dynamic_field_2: Joi.string().allow(""),
    dynamic_field_3: Joi.string().allow(""),
    dynamic_field_4: Joi.string().allow(""),
    dynamic_field_5: Joi.string().allow(""),
    dynamic_field_6: Joi.string().allow(""),
    dynamic_field_7: Joi.string().allow(""),
    dynamic_field_8: Joi.string().allow(""),
    dynamic_field_9: Joi.string().allow(""),
    ...keys
  });

/* eslint-disable-next-line no-unused-vars */
// const test = async (event, context) => {
//   try {
//     const data = await getQuestionsAndPolls(3);
//
//     return context.json(format_response(data));
//   } catch (e) {
//     return context.json(format_response(e));
//   }
// };

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

    const list = await getQuestionsAndPolls(event_id);

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

    const schema = Joi.object().keys({
      dynamicFields: Joi.object().pattern(/^/, Joi.boolean()),
      url: Joi.string()
        .min(3)
        .max(99)
        .required(),
      name: Joi.string()
        .min(3)
        .max(99)
        .required(),
      date: Joi.array().items(Joi.string().isoDate())
    });

    const v = Joi.validate(body, schema);

    if (v.error) {
      console.log("error", v);
      throw Error(v && v.message);
    }

    const found = await Event.findOne({ where: { url: body.url } });
    if (found) {
      throw Error(`link ${body.url} is not available`);
    }

    /* eslint-disable-next-line  no-unused-vars */
    const list = await Event.create(
      {
        data: "123,",
        status: "test",
        url: body.url,
        name: body.name,
        from: moment(body.date[0]).utc(),
        to: moment(body.date[1]).utc(),
        user_id,
        ...body.dynamicFields
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
const patchEventHandler = async (event, context) => {
  try {
    const { event_id } = event.params;
    const { user_id } = event.user;
    const { body } = event;

    const schema = Joi.object().keys({
      dynamicFields: Joi.object().pattern(/^/, Joi.boolean()),
      url: Joi.string()
        .min(3)
        .max(99)
        .required(),
      name: Joi.string()
        .min(3)
        .max(99)
        .required(),
      date: Joi.array().items(Joi.string().isoDate())
    });

    const v = Joi.validate(body, schema);

    if (v.error) {
      console.log("error", v);
      throw Error(v && v.message);
    }

    const found = await Event.findOne({ where: { url: body.url } });
    if (found && parseInt(event_id, 10) !== parseInt(found.event_id, 10)) {
      throw Error(`link ${body.url} is not available`);
    }

    await Event.update(
      {
        url: body.url,
        name: body.name,
        from: moment(body.date[0]).utc(),
        to: moment(body.date[1]).utc(),
        user_id,
        ...{
          dynamic_name: false,
          dynamic_company_name: false,
          dynamic_email: false,
          dynamic_position: false,
          ...body.dynamicFields
        }
      },
      {
        where: {
          event_id
        }
      }
    );

    const list = await getQuestions(event_id);

    return context.json(format_response(list));
  } catch (e) {
    return context.json(422, format_response(e));
  }
};

let createEventPoll = async (event, context) => {
  try {
    const { event_id } = event.params;
    const { user_id } = event.user;
    const { body } = event;

    if (
      Object.keys(body).reduce((acc, cur) => {
        let sum = acc;
        if (cur.indexOf(`dynamic_field_`) > -1 && body[cur]) {
          sum += 1;
        }

        return sum;
      }, 0) < 2
    ) {
      return context.json(
        422,
        format_response(Error("At least two options are required."))
      );
    }

    const payload = {
      user_id,
      event_id,
      question: body.question,
      data: "dummy",
      dynamic_field_0: body.dynamic_field_0,
      dynamic_field_1: body.dynamic_field_1,
      dynamic_field_2: body.dynamic_field_2,
      dynamic_field_3: body.dynamic_field_3,
      dynamic_field_4: body.dynamic_field_4,
      dynamic_field_5: body.dynamic_field_5,
      dynamic_field_6: body.dynamic_field_6,
      dynamic_field_7: body.dynamic_field_7,
      dynamic_field_8: body.dynamic_field_8,
      dynamic_field_9: body.dynamic_field_9
    };

    const schema = getValidationSchemaPoll();

    const v = Joi.validate(payload, schema);

    if (v.error) {
      console.log("error", v);
      throw Error(v && v.message);
    }

    await EventUserPoll.create(payload);

    const list = await getPolls(event_id);

    return context.json(format_response(list));
  } catch (e) {
    return context.json(422, format_response(e));
  }
};

let patchEventPoll = async (event, context) => {
  try {
    const { body, params } = event;
    const { event_id, event_poll_id } = params;
    const { user_id } = event.user;

    const payload = {
      user_id,
      event_id,
      event_poll_id,
      question: body.question,
      data: "dummy",
      dynamic_field_0: body.dynamic_field_0,
      dynamic_field_1: body.dynamic_field_1,
      dynamic_field_2: body.dynamic_field_2,
      dynamic_field_3: body.dynamic_field_3,
      dynamic_field_4: body.dynamic_field_4,
      dynamic_field_5: body.dynamic_field_5,
      dynamic_field_6: body.dynamic_field_6,
      dynamic_field_7: body.dynamic_field_7,
      dynamic_field_8: body.dynamic_field_8,
      dynamic_field_9: body.dynamic_field_9
    };

    const schema = getValidationSchemaPoll({
      event_poll_id: Joi.number().required()
    });

    const v = Joi.validate(payload, schema);

    if (v.error) {
      console.log("error", v);
      throw Error(v && v.message);
    }

    delete payload.event_id;
    delete payload.event_poll_id;
    await EventUserPoll.update(
      { ...payload },
      {
        where: { event_id, event_poll_id }
      }
    );

    const list = await getPolls(event_id);

    return context.json(format_response(list));
  } catch (e) {
    return context.json(422, format_response(e));
  }
};

let patchEventQuestion = async (event, context) => {
  try {
    const { event_id, event_question_id } = event.params;
    const { user_id } = event.user;
    const { body } = event;

    const schema = Joi.object().keys({
      archive: Joi.boolean().required(),
      type: Joi.string()
        .valid("archive")
        .required(),
      event_id: Joi.number().required(),
      event_question_id: Joi.number().required()
    });

    const v = Joi.validate(
      { event_id, event_question_id, type: body.type, archive: body.archive },
      schema
    );

    if (v.error) {
      console.log("error", v);
      throw Error(v && v.message);
    }

    await EventUserQuestion.update(
      {
        archived: body.archive === true,
        user_id
      },
      {
        where: { event_id, event_question_id }
      }
    );

    const list = await getQuestions(event_id);

    return context.json(format_response(list));
  } catch (e) {
    return context.json(422, format_response(e));
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
const patchEvent = withHook(patchEventHandler).use(ValidateAndGetUserInfo());
patchEventQuestion = withHook(patchEventQuestion).use(ValidateAndGetUserInfo());
patchEventPoll = withHook(patchEventPoll).use(ValidateAndGetUserInfo());
createEventPoll = withHook(createEventPoll).use(ValidateAndGetUserInfo());

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

// router.get("/test", test);
router.get("/events", getEventsList);
router.get("/event/:event_id", getEvent);

router.get("/getUserSubscriptions", getUserSubscriptions);
router.get("/getUsers", getUsersList);
router.get("/getSubscriptions", getSubscriptionsList);

router.post("/event", createEvent);
router.post("/event/:event_id/poll", createEventPoll);

router.patch("/event/:event_id", patchEvent);
router.patch(
  "/event/:event_id/question/:event_question_id",
  patchEventQuestion
);
router.patch("/event/:event_id/poll/:event_poll_id", patchEventPoll);

router.post("/migration", migration);

export default router;
