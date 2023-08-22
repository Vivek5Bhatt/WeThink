const builder = require("./builder/trending");
const async = require('async');
const {question: {FIELDS: ES_QUESTION_FIELDS, NESTED_FIELDS: ES_QUESTION_NESTED_FIELDS}} = require("../../elasticsearch/indices");
const {question: questionES} = require("../../elasticsearch");

const middilewares = {};

middilewares.validate = async(req, res, next) => {
  const {id} = req.query;
  if(!id) return res.status(400).send({
    "response_code": 400,
    "message": "Missing id",
    "result": {}
  })
  next();
}


middilewares.build = async(req, res, next) => {
  req._feedsResult = await questionES.user(req.query.id, {
    from: req.query.offset || 0,
    size: req.query.limit || 50,
    userId: req._userId,
    keyword: req.query.keyword || "",
    categoryId: req.query.categoryId || "",
    repost: req.query.repost == 1 ? true : false
  });
  req._questionIds = [], req._categoryIds = [], req._userIds = [], req._feeds = []; req._parentQuestionIds = [];
  req._questionSharedIds = [];
  
  if(req._feedsResult && req._feedsResult.hits && Array.isArray(req._feedsResult.hits.hits) && req._feedsResult.hits.hits.length){
    req._feedsResult.hits.hits.forEach(_obj => {
      _obj = _obj._source;
      req._feeds.push(_obj);
      _obj[ES_QUESTION_FIELDS.SHARED_QUESTION_ID] && req._questionSharedIds.push(_obj[ES_QUESTION_FIELDS.SHARED_QUESTION_ID]);
      if(_obj[ES_QUESTION_FIELDS.PARENT_QUESTION_ID]){
        req._questionIds.push(_obj[ES_QUESTION_FIELDS.PARENT_QUESTION_ID]);
        req._parentQuestionIds.push(_obj[ES_QUESTION_FIELDS.PARENT_QUESTION_ID]);
      }else{
        req._questionIds.push(_obj[ES_QUESTION_FIELDS.ID]);
      }
      req._userIds.push(_obj[ES_QUESTION_FIELDS.CREATED_BY]);
      _obj[ES_QUESTION_FIELDS.SHARED_BY] && req._userIds.push(_obj[ES_QUESTION_FIELDS.SHARED_BY]);
      Array.isArray(_obj[ES_QUESTION_FIELDS.CATEGORY_ID]) && _obj[ES_QUESTION_FIELDS.CATEGORY_ID].length && (req._categoryIds = req._categoryIds.concat(_obj[ES_QUESTION_FIELDS.CATEGORY_ID]));
    });
  }
  req._questionIds = [...new Set(req._questionIds.filter(Boolean))];
  req._categoryIds = [...new Set(req._categoryIds.filter(Boolean))];
  req._userIds = [...new Set(req._userIds.filter(Boolean))];
  req._parentQuestionIds = [...new Set(req._parentQuestionIds.filter(Boolean))];
  next();
}


module.exports = middilewares;