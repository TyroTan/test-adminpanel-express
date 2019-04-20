import recurlyConfig from "../config/config.recurly";

// const Recurly = require('recurly-js');

const util = require("../utils/recurly-util");

const { getCurrencyUnit } = util;

const RecurlyInit = Recurly => {
  if (!Recurly || !recurlyConfig || !recurlyConfig.API_KEY) {
    throw Error(
      `Recurly library and RecurlyConfig is required. type ${typeof Recurly} - ${typeof recurlyConfig}`
    );
  }

  const recurly = new Recurly(recurlyConfig);

  const getlist = cb => {
    recurly.accounts.list((errResponse, response) => {
      // console.log(`recurly.accounts.list`, errResponse, response);
      if (errResponse) {
        return cb(errResponse);
      }
      return cb(null, response.data);
    });
  };

  const getAccount = (account, cb) => {
    recurly.accounts.get(account, (errResponse, response) => {
      // console.log(`recurly.accounts.get`, errResponse, response);
      if (errResponse) {
        return cb(errResponse);
      }
      return cb(null, response.data);
    });
  };

  const getSubscriptions = (account, cb) => {
    recurly.subscriptions.listByAccount(account, (errResponse, response) => {
      // console.log(`recurly.accounts.listByAccount`, errResponse, response);
      if (errResponse) {
        return cb(errResponse);
      }

      let subs =
        response.data &&
        response.data.subscriptions &&
        response.data.subscriptions.subscription
          ? response.data.subscriptions.subscription
          : false;

      if (!subs) {
        return cb(null, {});
      }

      subs = Array.isArray(subs) ? subs : [subs];

      const data = subs.map(d => ({
        uuid: d.uuid,
        plan: d.plan.name,
        state: d.state,
        created: d.activated_at._,
        nextInvoice: d.current_period_ends_at._
      }));

      return cb(null, data);
    });
  };

  const subscribe = (data, cb) => {
    /* eslint-disable-next-line camelcase */
    const { account_code = "", token = "", plan_code = "" } = data;

    const details = {
      /* eslint-disable-next-line camelcase */
      plan_code: plan_code || "premium-plan",
      currency: "USD",
      account: {
        account_code,
        billing_info: {
          token_id: token
        }
      }
    };

    recurly.subscriptions.create(details, (errResponse, response) => {
      // console.log(`recurly.subscriptions.create`, errResponse, response);
      if (errResponse) {
        return cb(errResponse);
      }
      return cb(null, response.data);
    });
  };

  const getPlans = cb => {
    const filter = {};

    return recurly.plans.list((err, res) => {
      if (err) return cb(err);

      const detailsArr = Array.isArray(res.data.plans.plan)
        ? res.data.plans.plan
        : [res.data.plans.plan];

      // if (detailsArr) return cb(null, detailsArr);

      const data = detailsArr.map(details => {
        const currencyUnit = getCurrencyUnit(details);
        if (!currencyUnit) return {};
        const price =
          parseFloat(details.unit_amount_in_cents[currencyUnit]._) / 100;
        const pricePerMonthLabel =
          details.plan_interval_length._ > 1
            ? `${price} ${currencyUnit}/${details.plan_interval_length._} ${
                details.plan_interval_unit
              }`
            : `${price} ${currencyUnit}/${details.plan_interval_unit}`;
        return {
          name: details.name,
          code: details.plan_code,
          priceLabel: pricePerMonthLabel,
          price: details.unit_amount_in_cents.USD._,
          term: Math.round(
            details.plan_interval_length._ * details.total_billing_cycles._
          ),
          termLabel: `${Math.round(
            details.plan_interval_length._ * details.total_billing_cycles._
          )} ${details.plan_interval_unit}`,
          setupFee: details.setup_fee_in_cents,
          setupFeeLabel: `${parseFloat(
            details.setup_fee_in_cents[currencyUnit]._ / 100
          )} ${currencyUnit}`,
          trial:
            details.trial_interval_length._ > 1
              ? `${details.trial_interval_length._} ${
                  details.trial_interval_unit
                }`
              : "",
          plan: details.plan,
          currencySymbol: currencyUnit === "USD" ? "$" : "Unit",
          description: details.description
        };
      });

      return cb(null, data);
    }, filter);
  };

  return {
    getlist,
    getAccount,
    getSubscriptions,
    subscribe,
    getPlans
  };
};

export default RecurlyInit;
