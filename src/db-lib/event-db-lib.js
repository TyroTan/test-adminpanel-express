export default ({
  Event,
  EventUserPoll,
  EventUserPollAnswer,
  EventUserQuestion,
  User,
  sequelize
}) => {
  if (
    typeof Event === "undefined" ||
    typeof EventUserPoll === "undefined" ||
    typeof EventUserPollAnswer === "undefined" ||
    typeof EventUserQuestion === "undefined" ||
    typeof User === "undefined"
  ) {
    throw ReferenceError(
      `Model cant be undefined. type is ${typeof Event}` +
        ` type is ${typeof sequelize}` +
        ` type is ${typeof User}` +
        ` type is ${typeof EventUserPoll}` +
        ` type is ${typeof EventUserPollAnswer}` +
        ` type is ${typeof EventUserQuestion}` +
        ` type is ${typeof User}`
    );
  }

  const getQuestions = eventId => {
    if (!eventId) throw Error(`missing eventId. type is ${typeof eventId}`);
    return Event.findOne({
      where: {
        event_id: eventId
      },
      include: [
        {
          model: User,
          as: "user"
        },
        {
          model: EventUserQuestion,
          as: "questions"
        }
      ],

      // TODO: must be cleaner to use order: [["createdAt", "DESC"]] but not working smh
      order: sequelize.literal('"questions.createdAt" DESC')
    });
  };

  const getQuestionsAndPolls = async eventId => {
    if (!eventId) throw Error(`missing eventId. type is ${typeof eventId}`);
    // await User.sync({ force: true });
    // await Event.sync({ force: true });
    // await EventUserPoll.sync({ force: true });
    // await EventUserQuestion.sync({ force: true });
    return Event.findOne({
      where: {
        event_id: eventId
      },
      include: [
        {
          model: User,
          as: "user"
        },
        {
          model: EventUserQuestion,
          as: "questions"
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

      // TODO: must be cleaner to use order: [["createdAt", "DESC"]] but not working smh
      // order: sequelize.literal(
      //   '"polls.createdAt" DESC'
      // )
    });
  };

  const getPolls = eventId => {
    if (!eventId) throw Error(`missing eventId. type is ${typeof eventId}`);
    return Event.findOne({
      where: {
        event_id: eventId
      },
      include: [
        {
          model: User,
          as: "user"
        },
        {
          model: EventUserPoll,
          as: "polls"
        }
      ],
      order: [[sequelize.literal('"polls.createdAt" DESC')]]

      // TODO: must be cleaner to use order: [["createdAt", "DESC"]] but not working smh
      // order: sequelize.literal(
      //   '"polls.createdAt" DESC'
      // )
    });
  };

  const getPollAnswers = ({ userId, pollId }) => {
    return EventUserPollAnswer.findOne({
      where: {
        user_id: userId,
        poll_id: pollId
      },
      include: [
        {
          model: User,
          as: "user"
        },
        {
          model: EventUserPoll,
          as: "polls"
        }
      ]
    });
  };

  const getEventPollRunning = eventId => {
    if (!eventId) throw Error(`missing eventId. type is ${typeof eventId}`);

    return sequelize.query(
      "SELECT * FROM event_poll_running WHERE event_id = :event_id ",
      {
        replacements: { event_id: eventId },
        type: sequelize.QueryTypes.SELECT
      }
    );
  };

  return { getEventPollRunning, getPolls, getPollAnswers, getQuestionsAndPolls, getQuestions };
};
