const { test } = require("./units");
const { putObject, putObjects } = require("_lib/aws/s3Client");

module.exports = async ({ req, res }) => {
  console.log({ ENV_NAME: process.env.ENV_NAME });
  // const data = await putObjects([
  //   {
  //     Bucket: `mamdoo-${process.env.ENV_NAME}-drivers-documents-bucket`,
  //     ContentType: "application/json",
  //     Key: `documents/11111/baila.json`,
  //     Body: JSON.stringify({ baila: true }),
  //   },
  // ]);
  const data = await putObject({
    Bucket: `mamdoo-${process.env.ENV_NAME}-bucket`,
    ContentType: "application/json",
    Key: `documents/11111/baila.json`,
    Body: JSON.stringify({ baila: true }),
  });

  return data;
};
// AccessKey: AKIAZOPFYC2HCXBGAX7P
// Secret: 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
