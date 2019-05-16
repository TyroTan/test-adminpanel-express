export default ({
  Event,
  EventUserPoll,
  EventUserQuestion,
  User,
  sequelize
}) => {
  if (
    typeof Event === "undefined" ||
    typeof EventUserPoll === "undefined" ||
    typeof EventUserQuestion === "undefined" ||
    typeof User === "undefined"
  ) {
    throw ReferenceError(
      `Model cant be undefined. type is ${typeof Event}` +
        ` type is ${typeof sequelize}` +
        ` type is ${typeof User}` +
        ` type is ${typeof EventUserPoll}` +
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

  return { getPolls, getQuestionsAndPolls, getQuestions };
};
