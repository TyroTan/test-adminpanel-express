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

      // dynamic
      dynamic_name: {
        type: Sequelize.STRING(255)
      },
      dynamic_company_name: {
        type: Sequelize.STRING(255)
      },
      dynamic_email: {
        type: Sequelize.STRING(255)
      },
      dynamic_position: {
        type: Sequelize.STRING(255)
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
