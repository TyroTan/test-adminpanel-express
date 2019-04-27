/* Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file
 except in compliance with the License. A copy of the License is located at

     http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS"
 BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 License for the specific language governing permissions and limitations under the License.
*/

/* eslint-disable camelcase */

import { cognito } from "../config/aws.config";

// const https = require('https');
// const jose = require('node-jose');

// const region = AwsConfig.cognito.REGION;
// const userpool_id = AwsConfig.cognito.USER_POOL_ID;
const app_client_id = cognito.APP_CLIENT_ID;
// const keys_url = `https://cognito-idp.${region}.amazonaws.com/${userpool_id}/.well-known/jwks.json`;

// const jwt_decode = require('jwt-decode');
const CognitoDecodeVerifyJWTInit = ({ jwt_decode }) => {
  if (!jwt_decode) {
    throw ReferenceError("package jwt_decode is required.");
  }

  return {
    UNSAFE_BUT_FAST_handler: (event, context, callback) => {
      try {
        const token =
          event.headers && event.headers.Authorization
            ? event.headers.Authorization
            : ".";

        const claims = jwt_decode(token);

        if (claims && claims.exp && claims.aud) {
          const current_ts = Math.floor(new Date() / 1000);
          if (current_ts > claims.exp) {
            return callback(Error("invalid a"));
          }
          // and the Audience (use claims.client_id if verifying an access token)
          if (claims.aud !== app_client_id) {
            return callback(Error("invalid b"));
          }

          return callback(null, claims);
        }
        return callback(Error("invalid c"));
      } catch (e) {
        const msg = e && e.message ? `${e.message}` : e;
        return callback(msg, msg);
      }
    }
  };
};

/* exports.handler = (event, context, callback) => {
  const token =
    event.headers && event.headers.Authorization
      ? event.headers.Authorization
      : '.';
  const sections = token.split('.');
  // get the kid from the headers prior to verification
  let header = jose.util.base64url.decode(sections[0]);
  header = JSON.parse(header);
  const { kid } = header;
  // download the public keys
  https.get(keys_url, response => {
    if (response.statusCode === 200) {
      response.on('data', function(body) {
        const { keys } = JSON.parse(body);
        // search for the kid in the downloaded public keys
        let key_index = -1;
        for (let i = 0; i < keys.length; i++) {
          if (kid === keys[i].kid) {
            key_index = i;
            break;
          }
        }
        if (key_index === -1) {
          console.log('Public key not found in jwks.json');
          return callback();
        }
        // construct the public key
        jose.JWK.asKey(keys[key_index]).then(result => {
          // verify the signature
          jose.JWS.createVerify(result)
            .verify(token)
            .then(function(result2) {
              // now we can use the claims
              const claims = JSON.parse(result2.payload);
              // additionally we can verify the token expiration
              const current_ts = Math.floor(new Date() / 1000);
              if (current_ts > claims.exp) {
                return callback();
              }
              // and the Audience (use claims.client_id if verifying an access token)
              if (claims.aud != app_client_id) {
                return callback();
              }
              callback(null, claims);
            })
            .catch(function() {
              return callback();
            });
        });
      });
    }
  });
};
*/

export default CognitoDecodeVerifyJWTInit;
