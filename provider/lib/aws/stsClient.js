const { error } = require("_lib/helpers");
const { STSClient, AssumeRoleCommand } = require("@aws-sdk/client-sts");
// Set the AWS Region.
const REGION = "eu-south-2"; //e.g. "us-east-1"
// Create an Amazon STS service client object.
const stsClient = new STSClient({
  region: REGION,
  credentials: {
    accessKeyId: "AKIAZOPFYC2HCXBGAX7P",
    secretAccessKey: "JCno3TNpZdPSkr0KxZxh0oeYzc3YmxmJhURihvRR",
  },
});

const assumeRole = async ({
  arn,
  sessionName = `${Date.now()}`,
  duration = 900,
}) => {
  if (!arn || typeof arn !== "string")
    error("InvalidParam", "Arn type must be string");

  const params = {
    RoleArn: arn,
    RoleSessionName: sessionName,
    DurationSeconds: duration,
  };

  const data = await stsClient.send(new AssumeRoleCommand(params));
  return data;
};

module.exports = { stsClient, assumeRole };
