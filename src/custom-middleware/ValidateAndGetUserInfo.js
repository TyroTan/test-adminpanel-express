import { BaseMiddleware } from "before-hook";

import { User } from "../models";

export default () => {
  return BaseMiddleware({
    configure: {
      augmentMethods: {
        onCatch: (...args) => {
          const { getParams } = args[1];

          return getParams()[1].json({
            statusCode: 418,
            body: "Unexpected behavior.",
            headers: { "Access-Control-Allow-Origin": "*" }
          });
        }
      }
    },
    handler: async ({ getParams, reply }) => {
      const [event] = getParams();
      const user = await User.findOne({
        where: { user_id_cognito_sub: event.user.sub }
      });

      if (!user) {
        reply({
          statusCode: 418,
          body: "Unexpected behavior.",
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      }

      event.user.user_id = user.user_id;

      return {};
    }
  });
};
