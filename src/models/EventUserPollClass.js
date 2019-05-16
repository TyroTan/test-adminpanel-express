export default ({ sequelize, Sequelize }) => {
  if (!sequelize || !Sequelize) {
    throw Error(
      `sequelize Sequelize are required.
          typeof ${sequelize},
          typeof ${Sequelize}`
    );
  }

  const { Model } = Sequelize;

  class EventUserPoll extends Model {}

  EventUserPoll.init(
    {
      event_poll_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      archived: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      // dynamic
      dynamic_field_0: {
        type: Sequelize.STRING(255)
      },
      dynamic_field_1: {
        type: Sequelize.STRING(255)
      },
      dynamic_field_2: {
        type: Sequelize.STRING(255)
      },
      dynamic_field_3: {
        type: Sequelize.STRING(255)
      },
      dynamic_field_4: {
        type: Sequelize.STRING(255)
      },
      dynamic_field_5: {
        type: Sequelize.STRING(255)
      },
      dynamic_field_6: {
        type: Sequelize.STRING(255)
      },
      dynamic_field_7: {
        type: Sequelize.STRING(255)
      },
      dynamic_field_8: {
        type: Sequelize.STRING(255)
      },
      dynamic_field_9: {
        type: Sequelize.STRING(255)
      },

      data: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    },
    {
      modelName: "event_user_polls", // if you don't do this, webpack transpiles relations
      timestamps: true,
      sequelize
    }
  );

  return EventUserPoll;
};
