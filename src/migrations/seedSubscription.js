export default async (Subscription) => {
  await Subscription.sync({ force: true });

  const result = Subscription.bulkCreate([
    {
      subscription_type: 'basic-plan',
      data: JSON.stringify({
        id: 'someId',
        variable1: 'some var',
        deeplyNest: { nested: 'one' },
      }),
    },
    {
      subscription_type: 'private-plan',
      data: JSON.stringify({
        id: 'someId2',
        variable1: 'some var2',
        deeplyNest: { nested: 'one2' },
      }),
    },
    {
      subscription_type: 'pro-plan',
      data: JSON.stringify({
        id: 'someId2',
        variable1: 'some var2',
        deeplyNest: { nested: 'one2' },
      }),
    },
    {
      subscription_type: 'premium-plan',
      data: JSON.stringify({
        id: 'someId2',
        variable1: 'some var2',
        deeplyNest: { nested: 'one2' },
      }),
    },
  ]);

  return result;
};
