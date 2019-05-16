export default ({ sequelize, Sequelize }) => {
  if (!sequelize || !Sequelize) {
    throw Error(
      `sequelize Sequelize are required.
          typeof ${sequelize},
          typeof ${Sequelize}`
    );
  }

  const { Model } = Sequelize;

  class EventUserPollAnswer extends Model {}

  EventUserPollAnswer.init(
    {
      selected_key: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      selected_value: {
        type: Sequelize.STRING(255),
        allowNull: false
      }
    },
    {
      modelName: "event_user_poll_answers", // if you don't do this, webpack transpiles relations
      timestamps: true,
      sequelize
    }
  );

  EventUserPollAnswer.removeAttribute('id');

  return EventUserPollAnswer;
};
