const AWS = require("aws-sdk");
require("dotenv-safe").config();

const awsConfig = new AWS.Config({
  // accessKeyId: process.env.AWS_ACCESS_KEY,
  // secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const invokeStepFunctions = (requestParams, arn) => {
  try {
    // Initialize the AWS SDK
    const StepFunctions = new AWS.StepFunctions(awsConfig);
    const params = {
      input: JSON.stringify(requestParams),
      stateMachineArn: arn,
    };
    StepFunctions.startExecution(params)
      .promise()
      .then((result) => console.log("Step Function:", result))
      .catch((err) => console.error("Error- Step Function:", err));
  } catch (e) {
    console.error("Error- Invoke Step Function:", e);
  }
};

module.exports = {
  invokeStepFunctions,
};
