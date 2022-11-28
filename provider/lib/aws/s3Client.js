const { error } = require("_lib/helpers");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { assumeRole } = require("./stsClient");
// Set the AWS Region.
const REGION = "eu-south-2"; //e.g. "us-east-1"
// Create an Amazon STS service client object.

const putObject = async (putObject = {}) => {
  const data = await assumeRole({
    arn: "arn:aws:iam::649558759054:role/MamdooDeveloper",
  });

  const rolecreds = {
    accessKeyId: data.Credentials.AccessKeyId,
    secretAccessKey: data.Credentials.SecretAccessKey,
    sessionToken: data.Credentials.SessionToken,
  };

  const s3Client = new S3Client({
    region: REGION,
    credentials: rolecreds,
  });

  const results = await s3Client.send(new PutObjectCommand(putObject));

  return results;
};

const putObjects = async (putObjects = []) => {
  const data = await assumeRole({
    arn: "arn:aws:iam::649558759054:role/MamdooDeveloper",
  });

  const rolecreds = {
    accessKeyId: data.Credentials.AccessKeyId,
    secretAccessKey: data.Credentials.SecretAccessKey,
    sessionToken: data.Credentials.SessionToken,
  };

  const s3Client = new S3Client({
    region: REGION,
    credentials: rolecreds,
  });

  const s3Puts = [];

  putObjects.forEach((putObject) => {
    s3Puts.push(s3Client.send(new PutObjectCommand(putObject)));
  });

  const files = await Promise.allSettled(s3Puts);

  return files;
};

module.exports = { putObject, putObjects };
