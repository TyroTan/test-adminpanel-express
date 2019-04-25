export default ({ sequelize, Sequelize }, { User }) => {
  if (!sequelize || !Sequelize) {
    throw Error(
      `sequelize Sequelize are required.
        typeof ${sequelize},
        typeof ${Sequelize}`
    );
  }

  const { Model } = Sequelize;

  class Event extends Model {}

  Event.init(
    {
      event_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      data: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(255),
        allowNull: false
      }
    },
    {
      modelName: "Event", // if you don't do this, webpack transpiles relations
      timestamps: true,
      sequelize
    }
  );
  
  Event.belongsTo(User, {
    as: 'user',
    foreignKey: {
      name: 'user_id'
    },
  });

  return Event;
};
