const getCurrencyUnit = (details) => {
  if (details && details.unit_amount_in_cents) {
    const o = details.unit_amount_in_cents;
    const keys = Object.keys(o);

    return keys.reduce((acc, cur) => {
      if (acc !== '' && cur !== '$') return acc;
      return cur !== '$' ? cur : '';
    }, '');
  }

  return '';
};

export { getCurrencyUnit };
export default getCurrencyUnit;
