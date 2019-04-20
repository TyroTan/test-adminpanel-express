export default ({ sequelize, Sequelize }) => {
  if (!sequelize || !Sequelize) {
    throw Error(
      `sequelize Sequelize are required.
          typeof ${sequelize},
          typeof ${Sequelize}`,
    );
  }
  const { Model } = Sequelize;

  class UserSubscription extends Model {}

  UserSubscription.init(
    {
      user_data: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
    },
    {
      modelName: 'UserSubscription', // if you don't do this, webpack transpiles relations
      timestamps: true,
      sequelize,
    },
  );

  return UserSubscription;
};
