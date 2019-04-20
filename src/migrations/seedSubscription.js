export default async Subscription => {
  await Subscription.sync({ force: true });

  const result = Subscription.bulkCreate([
    {
      subscription_type: "basic-plan",
      data: JSON.stringify({
        name: "Basic",
        code: "basic-plan",
        priceLabel: "5 USD/months",
        price: "500",
        term: 2,
        termLabel: "2 months",
        setupFee: { USD: { _: "0", $: { type: "integer" } } },
        setupFeeLabel: "0 USD",
        trial: "",
        currencySymbol: "$",
        description:
          "Crowdsource questions\r\n3 polls per event\r\nBrainstorm ideas"
      })
    },
    {
      subscription_type: "private-plan",
      data: JSON.stringify({
        name: "Private",
        code: "private-plan",
        priceLabel: "8 USD/months",
        price: "800",
        term: 6,
        termLabel: "6 months",
        setupFee: { USD: { _: "500", $: { type: "integer" } } },
        setupFeeLabel: "5 USD",
        trial: "7 days",
        currencySymbol: "$",
        description:
          "All Basic plus:\r\nModeration of questions\r\n5 polls per event\r\nExport data and more"
      })
    },
    {
      subscription_type: "pro-plan",
      data: JSON.stringify({
        name: "Pro",
        code: "pro-plan",
        priceLabel: "40 USD/3 months",
        price: "4000",
        term: 6,
        termLabel: "6 months",
        setupFee: { USD: { _: "25000", $: { type: "integer" } } },
        setupFeeLabel: "250 USD",
        trial: "",
        currencySymbol: "$",
        description:
          "All Private plus:\r\nUnlimited Polls and surveys\r\nEvent collaborators\r\nBranding and more"
      })
    },
    {
      subscription_type: "premium-plan",
      data: JSON.stringify({
        name: "Premium",
        code: "premium-plan",
        priceLabel: "999 USD/12 months",
        price: "99900",
        term: 12,
        termLabel: "12 months",
        setupFee: { USD: { _: "50000", $: { type: "integer" } } },
        setupFeeLabel: "500 USD",
        trial: "",
        currencySymbol: "$",
        description:
          "All Pro plus:\r\nUp to 5000 participants\r\nProfessional onboarding\r\nEvent agenda and more"
      })
    }
  ]);

  return result;
};
