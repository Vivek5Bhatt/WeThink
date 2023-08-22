const {question: questionES} = require("../../elasticsearch");
const {question: {FIELDS: ES_QUESTIONS_FIELDS}} = require("../../elasticsearch/indices");
const QuestionController = require("../../components/Questions/QuestionController");

const middlewares = {};

/**
* Validating query params
* @param {*} req 
* @param {*} res 
* @param {*} next 
* @returns 
*/
middlewares.validate = async(req, res, next) => {
  const {question_id, shared_question_id} = req.query;
  if(!question_id && !shared_question_id) return res.status(400).send({
    "response_code": 400,
    "message": "Missing id",
    "result": {}
  });
  
  next();
}

/**
* Checking if question or post exists or not
* @param {*} req 
* @param {*} res 
* @param {*} next 
*/
middlewares.fetch = async(req, res, next) => {
  questionES.search({
    "query": {
      "term": {
        "_id": req.query.question_id || req.query.shared_question_id
      }
    }
  }, (error, result) => {
    if(!result || !result.hits || !Array.isArray(result.hits.hits) || !result.hits.hits.length) return res.status(400).send({
      "response_code": 400,
      "message": req.query.question_id ? "question not found" : "post not found",
      "result": {}
    });
    req._result = result.hits.hits[0]._source;
    if(req._result[ES_QUESTIONS_FIELDS.IS_DELETED]) return res.status(400).send({
      "response_code": 400,
      "message": req.query.question_id ? "question already deleted" : "post already deleted",
      "result": {}
    });
    next();
  });
}

/**
* Checking if owner is deleting or not
* @param {*} req 
* @param {*} res 
* @param {*} next 
* @returns 
*/
middlewares.validateOwnership = async(req, res, next) => {
  if(req.query.question_id && req._result[ES_QUESTIONS_FIELDS.CREATED_BY] !== req._userId) return res.status(400).send({
    "response_code": 403,
    "message": "Deletion not allowed",
    "result": {}
  });
  
  if(req.query.shared_question_id && req._result[ES_QUESTIONS_FIELDS.SHARED_BY] !== req._userId) return res.status(400).send({
    "response_code": 403,
    "message": "Deletion not allowed",
    "result": {}
  });
  next();
}

/**
* deleting from ES and Postgres
* @param {*} req 
* @param {*} res 
* @param {*} next 
*/
middlewares.delete = async(req, res, next) => {
  if(req.query.question_id) await new QuestionController().deleteQuestionAndRelatedPostController(req.query.question_id);
  if(req.query.shared_question_id) await new QuestionController().deleteSharedPostsController(req.query.shared_question_id);
  next();
}

/**
* sending reponse
* @param {*} req 
* @param {*} res 
* @param {*} next 
*/
middlewares.buildResponse = async(req, res , next) => {
  res.status(200).send({message: "deleted", data: req._result});
}

module.exports = middlewares;