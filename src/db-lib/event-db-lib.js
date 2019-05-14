export default ({ Event, EventUserQuestion, User, sequelize }) => {
  if (
    typeof Event === "undefined" ||
    typeof EventUserQuestion === "undefined"
  ) {
    throw ReferenceError(
      `Model cant be undefined. type is ${typeof Event}` +
        ` type is ${typeof sequelize}` +
        ` type is ${typeof User} type is ${typeof EventUserQuestion} type is ${typeof User}`
    );
  }

  const getQuestions = (eventId) => {
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

  return { getQuestions };
};
