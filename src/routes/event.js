/* eslint-disable camelcase */

import { promisify } from "util";
import { CreateInstance } from "before-hook";
import express from "express";

import jwt_decode from "jwt-decode";
import { AuthMiddleware, ValidateAndGetUserInfo } from "../custom-middleware";
import CognitoDecodeVerifyJWTInit from "../utils/cognito-decode-verify-jwt";

import { Event, EventUserQuestion } from "../models";
import { format_response } from "../utils/lambda";

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
    const list = await EventUserQuestion.findAll({
      where: {
        event_id
      },
      include: [
        {
          model: Event,
          as: "event"
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

    // await EventUserQuestion.sync({ force: true });
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
createEventQuestion = withHook(createEventQuestion).use(
  ValidateAndGetUserInfo()
);

router.post("/:event_id/question", createEventQuestion);
router.get("/:event_id", fetchEventInfoLive);

export default router;
