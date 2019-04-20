export default ({ User, UserSubscription, Subscription }) => {
  if (
    typeof Subscription === 'undefined'
    || typeof User === 'undefined'
    || typeof UserSubscription === 'undefined'
  ) {
    throw Error(
      `Model can't be undefined. type ${Subscription} - type ${User} - type ${UserSubscription}`,
    );
  }

  const getUserSubscriptions = async (userSub) => {
    const dashboard = typeof userSub === 'object' && userSub.dashboard === true;

    const includeUserSub = [
      {
        model: Subscription,
        as: 'subscription',
        attributes: ['subscription_type'],
      },
    ];

    if (dashboard === true) {
      return UserSubscription.findAll({
        attributes: { exclude: ['user_data'] },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['email'],
          },
          ...includeUserSub,
        ],
      });
    }

    const userData = await User.findOne({
      where: { user_id_cognito_sub: userSub },
    });

    if (!userData) {
      return [];
    }

    return UserSubscription.findAll({
      attributes: { exclude: ['user_data'] },
      where: { user_id: userData.user_id },
      include: includeUserSub,
    });

    // throw Error("Cannot subscribe. Invalid user.");
  };

  const subscribe = async ({ userSub, planCode }) => {
    const userData = await User.findOne({
      where: { user_id_cognito_sub: userSub },
    });

    const subscriptionData = await Subscription.findOne({
      where: { subscription_type: planCode },
    });

    if (!subscriptionData || !subscriptionData.subscription_id) {
      throw Error('Cannot subscribe. Invalid plan code.');
    }

    if (userData && userData.user_id) {
      const existsData = await UserSubscription.findOne({
        where: {
          subscription_id: subscriptionData.subscription_id,
          user_id: userData.user_id,
        },
      });

      if (existsData) {
        throw Error('Invalid action. User already subscribed.');
      }

      return () => UserSubscription.create(
        {
          user_data: JSON.stringify(userData),
          user_id: userData.user_id,
          subscription_id: subscriptionData.subscription_id,
        },
        {
          include: [
            {
              model: User,
              as: 'user',
            },
            {
              model: Subscription,
              as: 'subscription',
            },
          ],
        },
      );
    }

    throw Error('Cannot subscribe. Invalid user.');
  };

  return {
    getUserSubscriptions,
    subscribe,
  };
};
