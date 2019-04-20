export default ({ User, Session }) => {
  if (typeof User === "undefined" || typeof Session === "undefined") {
    throw ReferenceError(
      `Model cant be undefined. type is ${typeof User} type is ${typeof Session}`
    );
  }

  const logSessionUponLogin = async (token, claims) => {
    const user = await User.findOne({
      user_id_cognito_sub: claims.sub
    });

    if (user && user.user_id) {
      // const hasSession = await Session.findOne({
      //   where: { data: token }
      // });

      /* if (!hasSession) {
        const session = await Session.create({
          data: token,
          user_data: JSON.stringify(claims)
        });

        console.log("session", session);

        if (session && session.session_id) {
          return User.create({
            data: JSON.stringify(claims),
            user_id_cognito_sub: claims.sub,
            session_id: session.session_id
          });
        }
      } */

      return Session.update(
        { data: token },
        { where: { session_id: user.session_id } }
      );
    }

    return User.create(
      {
        data: JSON.stringify(claims),
        email: claims.email,
        user_id_cognito_sub: claims.sub,
        session: {
          data: token,
          user_data: JSON.stringify(claims)
        }
      },
      {
        include: [
          {
            model: Session,
            as: "session"
          }
        ]
      }
    );
  };

  return {
    logSessionUponLogin
  };
};
