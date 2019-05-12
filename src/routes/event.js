/* eslint-disable camelcase */

import { promisify } from "util";
import { CreateInstance } from "before-hook";
import express from "express";

import jwt_decode from "jwt-decode";

import * as firabseAdmin from "firebase-admin";
import firebaseConfig from "../config/firebase.config";
import serviceAccount from "../config/firebase.serviceAccountKey.json";

import { AuthMiddleware, ValidateAndGetUserInfo } from "../custom-middleware";
import CognitoDecodeVerifyJWTInit from "../utils/cognito-decode-verify-jwt";

/* eslint-disable-next-line no-unused-vars */
import { Event, EventUserQuestion, sequelize } from "../models";
import { format_response } from "../utils/lambda";
// import moment from "moment";

/* eslint-disable-next-line no-unused-vars */
import { hookEventUserQuestion } from "../migrations/hook";

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
    const { params = {} } = event;
    const { event_id } = params;

    /* eslint-disable-next-line  no-unused-vars */

    const list = await Event.findOne({
      where: {
        event_id
      },
      include: [
        {
          model: EventUserQuestion,
          as: "questions"
        }
      ],

      // TODO: must be cleaner to use order: [["createdAt", "DESC"]] but not working smh
      order: sequelize.literal('"questions.createdAt" DESC')
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

    const newQuestion = await EventUserQuestion.create({
      user_id: event.user.user_id,
      event_id,
      question: event.body.question,
      data: JSON.stringify(event.body)
    });
    
    const dbref = firabseAdmin.database().ref("messager_event_questions");
    dbref.once("value", function(snapshot) {
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
