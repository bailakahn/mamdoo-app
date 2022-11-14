const axios = require("axios");
const { getSetting, error } = require("_lib/helpers");
const compareAsc = require("date-fns/compareAsc");
const addSeconds = require("date-fns/addSeconds");
let authorizationToken = {};
module.exports = async () => {
  //   console.log({ authorizationToken });
  if (authorizationToken?.access_token) {
    // console.log({
    //   expiresAt: authorizationToken?.expiresAt,
    //   now: new Date(),
    //   compare: compareAsc(authorizationToken?.expiresAt, new Date()),
    // });
    if (compareAsc(authorizationToken?.expiresAt, new Date()) === 1)
      return authorizationToken?.access_token;
  }

  let results;
  try {
    const orangeBaseUrl = await getSetting("orangeBaseUrl");
    const authorizationHeader = await getSetting("authorizationHeader");
    let url = orangeBaseUrl + "oauth/v3/token";
    results = await axios({
      url,
      method: "POST",
      headers: {
        Authorization: `Basic ${authorizationHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: { grant_type: "client_credentials" },
    });

    authorizationToken = {
      ...results?.data,
      expiresAt: addSeconds(new Date(), 10),
    };
    return results?.data?.access_token;
  } catch (authorizationError) {
    console.log({ authorizationError });
    error("OrangeAuthFailded", "Could not get access token from orange api");
  }
};
