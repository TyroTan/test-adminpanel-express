/* eslint-disable camelcase */

import { promisify } from "util";
import { CreateInstance } from "before-hook";
import express from "express";

import jwt_decode from "jwt-decode";
import { AuthMiddleware, ValidateAndGetUserInfo } from "../custom-middleware";
import CognitoDecodeVerifyJWTInit from "../utils/cognito-decode-verify-jwt";

/* eslint-disable-next-line no-unused-vars */
import { Event, EventUserQuestion, sequelize } from "../models";
import { format_response } from "../utils/lambda";

/* eslint-disable-next-line no-unused-vars */
import { hookEventUserQuestion } from "../migrations/hook";

const router = express.Router();

const { UNSAFE_BUT_FAST_handler } = CognitoDecodeVerifyJWTInit({
  jwt_decode
});

/* eslint-disable-next-line no-unused-vars */
let fetchEventInfoLive = async (event, context) => {
  try {
    const { params = {} } = event;
    const { event_id } = params;

    /* eslint-disable-next-line  no-unused-vars */

    const list = await Event.findAll({
      where: {
        event_id
      },
      include: [
        {
          model: EventUserQuestion,
          as: "questions"
        }
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
    // await hookEventUserQuestion({ sequelize });

    await EventUserQuestion.create({
      user_id: event.user.user_id,
      event_id,
      question: event.body.question,
      data: JSON.stringify(event.body)
    });

    return context.json(format_response({ success: true }));
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

[createEventQuestion, fetchEventInfoLive] = withHook([
  createEventQuestion,
  fetchEventInfoLive
]);
createEventQuestion = createEventQuestion.use(ValidateAndGetUserInfo());

router.post("/:event_id/question", createEventQuestion);
router.get("/:event_id", fetchEventInfoLive);

export default router;
