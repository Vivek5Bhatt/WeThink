const {question: questionES} = require("../../elasticsearch");

const middilewares = {};

middilewares.validate = async(req, res, next) => {
  next();
}

middilewares.fetch = async(req, res, next) => {
  questionES.search(req.body, (error, result) => {
    req._result = result;
    next();
  });
}

middilewares.buildResponse = async(req, res , next) => {
  res.status(200).send({data: req._result, env: process.env.ENV});
}

module.exports = middilewares;