/* eslint-disable camelcase */

// const error = require("./errors");

// helper function to format a message for Lambda return value
const format_response = (message) => {
  let status_code = 200;
  let msg = message;

  if (message instanceof Error) {
    status_code = 500;
    msg = message.message ? message.message : message;
  }

  if (message && typeof message.statusCode !== 'undefined') {
    if (message.statusCode >= 400 && message.statusCode <= 499) {
      status_code = message.statusCode;
    }
  }

  return {
    statusCode: status_code,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: typeof msg === 'string' ? msg : JSON.stringify(msg),
  };
};

export { format_response };
export default format_response;
