export default ({ sequelize, Sequelize }) => {
  if (!sequelize || !Sequelize) {
    throw Error(
      `sequelize Sequelize are required.
        typeof ${sequelize},
        typeof ${Sequelize}`
    );
  }
  const { Model } = Sequelize;

  class Subscription extends Model {}

  Subscription.init(
    {
      subscription_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      subscription_type: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      data: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    },
    {
      modelName: 'Subscription', // if you don't do this, webpack transpiles relations
      timestamps: true,
      sequelize
    }
  );

  return Subscription;
};
