/* eslint-disable @typescript-eslint/explicit-function-return-type */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default ({ sequelize, Sequelize }, { Session } = {}) => {
  if (!sequelize || !Sequelize) {
    throw Error(
      `sequelize Sequelize are required.
        typeof ${sequelize},
        typeof ${Sequelize}`,
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
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      modelName: 'User',
      timestamps: true,
      sequelize,
    },
  );

  // User.belongsTo(Session, {
  //   as: 'session',
  //   foreignKey: {
  //     name: 'session_id',
  //     unique: true,
  //     allowNull: false
  //   }
  // });

  return User;
};
