export default ({ sequelize, Sequelize }) => {
  if (!sequelize || !Sequelize) {
    throw Error(
      `sequelize Sequelize are required.
          typeof ${sequelize},
          typeof ${Sequelize}`
    );
  }

  const { Model } = Sequelize;

  class EventUserQuestion extends Model {}

  EventUserQuestion.init(
    {
      event_question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      data: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    },
    {
      modelName: "EventUserQuestion", // if you don't do this, webpack transpiles relations
      timestamps: true,
      sequelize
    }
  );

  return EventUserQuestion;
};
