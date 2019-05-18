/* eslint-disable camelcase */

// const error = require("./errors");

// helper function to format a message for Lambda return value
const format_response_json = (res, messageObj) => {
  /* eslint-disable-next-line no-use-before-define */
  const msg = format_response(messageObj);
  const status = msg && msg.statusCode ? msg.statusCode : 500;
  /* eslint-disable-next-line no-use-before-define */
  return res.status(status).json(msg);
};

const format_response = (obj, message) => {
  if (obj && obj.json && typeof obj.status === "function") {
    return format_response_json(obj, message);
  }

  /* eslint-disable-next-line no-param-reassign */
  message = obj;
  let status_code = 200;
  let msg = message;

  if (message instanceof Error) {
    status_code = 500;
    msg = message.message ? message.message : message;
  }

  if (message && typeof message.statusCode !== "undefined") {
    if (message.statusCode >= 400 && message.statusCode <= 499) {
      status_code = message.statusCode;
    }
  }

  return {
    statusCode: status_code,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: typeof msg === "string" ? msg : JSON.stringify(msg)
  };
};

export { format_response };
export default format_response;
