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
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      from: {
        type: Sequelize.DATE,
        allowNull: false
      },
      to: {
        type: Sequelize.DATE,
        allowNull: false
      },
      url: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      // dynamic
      dynamic_name: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      dynamic_company_name: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      dynamic_email: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      dynamic_position: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    },
    {
      modelName: "Events", // if you don't do this, webpack transpiles relations
      timestamps: true,
      sequelize
    }
  );
  
  Event.belongsTo(User, {
    as: 'user',
    foreignKey: {
      name: 'user_id',
      allowNull: false
    },
  });

  return Event;
};
