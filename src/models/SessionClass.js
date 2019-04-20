export default ({ sequelize, Sequelize }) => {
  if (!sequelize || !Sequelize) {
    throw Error(
      `sequelize Sequelize are required.
        typeof ${sequelize},
        typeof ${Sequelize}`,
    );
  }

  const { Model } = Sequelize;

  class Session extends Model {}

  Session.init(
    {
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      data: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      user_data: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
    },
    {
      modelName: 'Session', // if you don't do this, webpack transpiles relations
      timestamps: true,
      sequelize,
    },
  );

  return Session;
};
