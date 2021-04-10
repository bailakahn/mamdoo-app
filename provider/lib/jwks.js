const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const Cookies = require("cookies");
let client;

const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key = {}) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
};

module.exports = async (id_token, nonce) => {
  //   const cookies = new Cookies(req, null);

  //   const nonce = cookies.get("nonce");
  //   console.log({ nonce });

  const issuer = process.env.OIDC_ISSUER;
  const audience = process.env.OIDC_AUDIENCE;

  if (!client)
    client = jwksClient({
      jwksUri: `${issuer}/jwks`,
    });
  return new Promise((resolve, reject) => {
    jwt.verify(
      id_token,
      getKey,
      {
        algorithms: ["RS256"],
        audience,
        issuer,
        nonce,
      },
      async (err, decoded) => {
        if (err) {
          reject(err);
          return err;
        }

        // console.log({ decoded });
        resolve(decoded);
      }
    );
  });
};
