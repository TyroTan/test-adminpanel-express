/* eslint-disable camelcase */

import { promisify } from "util";
import { CreateInstance } from "before-hook";
import express from "express";

import jwt_decode from "jwt-decode";
import Joi from "joi";

import * as firabseAdmin from "firebase-admin";
import firebaseConfig from "../config/firebase.config";
import serviceAccount from "../config/firebase.serviceAccountKey.json";

import { AuthMiddleware, ValidateAndGetUserInfo } from "../custom-middleware";
import CognitoDecodeVerifyJWTInit from "../utils/cognito-decode-verify-jwt";

/* eslint-disable-next-line no-unused-vars */
import {
  Event,
  EventUserPoll,
  EventUserPollAnswer,
  EventUserQuestion,
  User,
  sequelize
} from "../models";
import { format_response } from "../utils/lambda";
// import moment from "moment";

/* eslint-disable-next-line no-unused-vars */
import { migrationHookEventUserPollAnswer } from "../migrations/hook";
import { EventDBLibInit } from "../db-lib";

const { getPollAnswers } = EventDBLibInit({
  Event,
  EventUserPoll,
  EventUserPollAnswer,
  EventUserQuestion,
  User,
  sequelize
});

const router = express.Router();

const { UNSAFE_BUT_FAST_handler } = CognitoDecodeVerifyJWTInit({
  jwt_decode
});

firabseAdmin.initializeApp({
  credential: firabseAdmin.credential.cert(serviceAccount),
  databaseURL: firebaseConfig.databaseURL
});

/* eslint-disable-next-line no-unused-vars */
let fetchEventInfoLive = async (event, context) => {
  try {
    // TODO: comment me
    // await EventUserPollAnswer.sync({ force: true });
    // await migrationHookEventUserPollAnswer({ sequelize });

    const { params = {} } = event;
    const { event_id_or_unique_link } = params;
    const isLinkMode = event.query && event.query.isLinkMode === "true";

    /* eslint-disable-next-line  no-unused-vars */

    const findCondition = isLinkMode
      ? {
          url: event_id_or_unique_link
        }
      : {
          event_id: event_id_or_unique_link
        };

    const list = await Event.findOne({
      where: findCondition,
      include: [
        {
          model: EventUserQuestion,
          as: "questions",
          required: false,
          where: {
            archived: false
          }
        },
        {
          model: EventUserPoll,
          as: "polls"
        }
      ],
      order: [
        [sequelize.literal('"questions.createdAt" DESC')],
        [sequelize.literal('"polls.createdAt" DESC')]
      ]
    });

    return context.json(format_response(list));
  } catch (e) {
    return context.json(422, format_response(e));
  }
};

let createEventQuestion = async (event, context) => {
  try {
    const { event_id } = event.params;

    // TODO: comment/remove me
    // await EventUserQuestion.sync({ force: true });
    // await migrationHookEventUserQuestion({ sequelize });

    const newQuestion = await EventUserQuestion.create({
      user_id: event.user.user_id,
      event_id,
      data: JSON.stringify(event.body),
      ...{
        question: event.body.question,
        dynamic_company_name: event.body.dynamic_company_name,
        dynamic_email: event.body.dynamic_email,
        dynamic_name: event.body.dynamic_name,
        dynamic_position: event.body.dynamic_position
      }
    });

    const dbref = firabseAdmin.database().ref("messager_event_questions");
    dbref.once("value", snapshot => {
      const current = JSON.parse(snapshot.val());
      const found = current.find(item => item.event_id === event_id);
      if (found === undefined) {
        current.push({
          event_id: parseInt(event_id, 10),
          event_question_id: newQuestion.event_question_id
        });

        dbref.set(JSON.stringify(current));
      }
    });

    return context.json(format_response({ success: true }));
  } catch (e) {
    return context.json(422, format_response(e));
  }
};

const getValidationSchemaPollAnswer = keys =>
  Joi.object().keys({
    user_id: Joi.number().required(),
    poll_id: Joi.string().required(),
    selected_key: Joi.string().required(),
    selected_value: Joi.string().required(),
    ...keys
  });

let saveEventPollAnswer = async (event, context) => {
  try {
    const { body, params, user } = event;
    const { user_id } = user;
    const { event_poll_id } = params;

    const payload = {
      user_id,
      poll_id: event_poll_id,
      ...body
    };

    const v = Joi.validate(payload, getValidationSchemaPollAnswer());

    if (v.error) {
      console.log("error", v);
      throw Error(v && v.message);
    }

    // newPollAnswer

    await EventUserPollAnswer.create({
      ...payload
    });

    const list = getPollAnswers({ userId: user_id, pollId: event_poll_id });

    /* const dbref = firabseAdmin.database().ref("messager_event_questions");
    dbref.once("value", snapshot => {
      const current = JSON.parse(snapshot.val());
      const found = current.find(item => item.event_id === event_id);
      if (found === undefined) {
        current.push({
          event_id: parseInt(event_id, 10),
          event_question_id: newQuestion.event_question_id
        });

        dbref.set(JSON.stringify(current));
      }
    }); */

    return context.json(format_response(list));
  } catch (e) {
    return context.json(422, format_response(e));
  }
};

const beforeHook = CreateInstance({
  configure: {
    augmentMethods: {
      onReturnObject: (...args) => {
        const { arg, getParams = () => {} } = args[1];

        /* eslint-disable-next-line no-unused-vars */
        const [event, context = {}] = getParams();

        const responseData = {
          ...arg,
          headers: { "Access-Control-Allow-Origin": "*" }
        };

        if (typeof context.json === "function") {
          return context.json(responseData);
        }

        return responseData;
      }
    }
  }
});

const withHook = (...handler) =>
  beforeHook(...handler).use(
    AuthMiddleware({
      promisify,
      cognitoJWTDecodeHandler: UNSAFE_BUT_FAST_handler
    })
  );

[createEventQuestion, fetchEventInfoLive, saveEventPollAnswer] = withHook([
  createEventQuestion,
  fetchEventInfoLive,
  saveEventPollAnswer
]);
createEventQuestion = createEventQuestion.use(ValidateAndGetUserInfo());
saveEventPollAnswer = saveEventPollAnswer.use(ValidateAndGetUserInfo());

router.post("/:event_id/question", createEventQuestion);
router.get("/:event_id_or_unique_link", fetchEventInfoLive);
router.post("/:event_id/poll/:event_poll_id/answer", saveEventPollAnswer);

export default router;
