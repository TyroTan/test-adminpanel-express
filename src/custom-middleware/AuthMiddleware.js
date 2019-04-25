import { BaseMiddleware } from "before-hook";

const isAsyncFunction = fn => fn.constructor.name === "AsyncFunction";

export default ({ promisify, cognitoJWTDecodeHandler } = {}) => {
  if (
    (promisify && typeof promisify !== "function") ||
    (cognitoJWTDecodeHandler && typeof cognitoJWTDecodeHandler !== "function")
  ) {
    throw Error(
      `invalid (promisify and cognitoJWTDecodeHandler) passed. ${typeof promisify},  ${typeof cognitoJWTDecodeHandler}`
    );
  }

  return BaseMiddleware({
    configure: {
      augmentMethods: {
        onCatch: (...args) => {
          const { prevRawMethod } = args[1];

          return prevRawMethod({
            statusCode: 403,
            body: "Invalid Session",
            headers: { "Access-Control-Allow-Origin": "*" }
          });
        }
      }
    },
    handler: async ({ getParams, reply }) => {
      const [event, context] = getParams();

      if (!event || !event.headers) return {};

      const newEventHeaders = {
        ...event.headers
      };

      if (!newEventHeaders.Authorization) {
        newEventHeaders.Authorization = newEventHeaders.authorization;
      }

      let promised = cognitoJWTDecodeHandler;
      if (!isAsyncFunction(promised)) {
        promised = promisify(promised);
      }
      const claims = await promised(
        Object.assign({}, event, { headers: newEventHeaders }),
        context
      );

      if (!claims || typeof claims.sub !== "string") {
        reply({
          statusCode: 403,
          body: "Invalid Session",
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      }

      event.user = claims;
      event.authToken = newEventHeaders.Authorization;

      return {}
    }
  });
};
