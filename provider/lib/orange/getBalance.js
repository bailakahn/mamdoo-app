const axios = require("axios");
const { getSetting, error } = require("_lib/helpers");
const auth = require("./auth");
module.exports = async ({ country_code }) => {
  let results;
  try {
    const access_token = await auth();
    const orangeBaseUrl = await getSetting("orangeBaseUrl");
    let url = orangeBaseUrl + `sms/admin/v1/contracts`;
    results = await axios({
      url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      data: {
        country_code,
      },
    });

    results = results?.data;
  } catch (getBralanceError) {
    console.log({ getBralanceError });
    error("GetBalanceError", "Could not get orange balance");
  }

  return results;
};
