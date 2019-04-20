export default ({ sequelize, Sequelize }, { Session }) => {
  if (!sequelize || !Sequelize) {
    throw Error(
      `sequelize Sequelize are required.
        typeof ${sequelize},
        typeof ${Sequelize}`
    );
  }

  const { Model } = Sequelize;

  class User extends Model {}

  User.init(
    {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      user_id_cognito_sub: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      data: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    },
    {
      modelName: 'User', // if you don't do this, webpack transpiles relations
      timestamps: true,
      sequelize
    }
  );

  User.belongsTo(Session, {
    as: "session",
    foreignKey: {
      name: "session_id",
      unique: true
    }
  });

  return User;
};
