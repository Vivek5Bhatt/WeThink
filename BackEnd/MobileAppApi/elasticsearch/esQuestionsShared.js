const async = require('async');
const { question: questionES } = require("../elasticsearch");
const { question: { FIELDS: ES_QUESTIONS_FIELDS } } = require("../elasticsearch/indices");
const Sequelize = require('../config/connection');
const moment = require('moment');

let DB_MAX_LIMIT = 50;

const log = (isError, methodName, description) => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")} | QUESTION_SHARED_MIGRATION | ${isError ? "ERROR" : "SUCCESS"}] => ${methodName} : ${description}`);
}

module.exports = (callback) => {
  console.time(`QUESTION_SHARED_MIGRATION finished...`);
  _migrateRecursively(0, () => {
    console.timeEnd(`QUESTION_SHARED_MIGRATION finished...`);
    callback();
  });
}

const _migrateRecursively = (offset, callback) => {
  _fetchFromDB(offset, (error, data) => {
    if (!Array.isArray(data) || !data.length) return callback();
    _migrateToES(data, () => {
      _migrateRecursively(offset + DB_MAX_LIMIT, callback);
    })
  })
}

const _fetchFromDB = (offset, callback) => {
  const query = `SELECT Q.*, C.*, Q.question_id AS id,
  S.question_shared_id AS sharedquestiond, S.question_id as parentquestionid, S.user_id AS shareduserid, S.created_at as sharedcreatedat,
  S.share_message AS sharedmessage, S.is_deleted as sharedisdeleted, S.is_active AS sharedisactive
  FROM user_shared_questions AS S
  LEFT JOIN questions AS Q ON S.question_id = Q.question_id
  LEFT JOIN question_category_mapping AS C ON Q.question_id = C.question_id
  LIMIT ${DB_MAX_LIMIT} OFFSET ${offset}`;
  Sequelize.query(query, { type: Sequelize.QueryTypes.SELECT }).then(results => {
    log(false, "_fetchFromDB", `fetched from ${offset} -> ${offset + DB_MAX_LIMIT}: ${results.length}`);
    return callback(null, results);
  })
}

const _migrateToES = (data, callback) => {
  const scripts = [];
  data.forEach(_obj => {
    const _id = _obj.parentquestionid ? `${_obj.sharedquestiond}:${_obj.parentquestionid}` : _obj.id;
    scripts.push(cb => questionES.indexDoc(_id, _obj.question_title, _obj.created_by, _obj.question_date, _obj.created_at, _obj.question_type, {
      [ES_QUESTIONS_FIELDS.IS_ACTIVE]: _obj.is_active,
      [ES_QUESTIONS_FIELDS.IS_DELETED]: _obj.is_deleted,
      [ES_QUESTIONS_FIELDS.IS_EXPIRED]: _obj.is_expired,
      [ES_QUESTIONS_FIELDS.DELETED_AT]: _obj.deleted_at,
      [ES_QUESTIONS_FIELDS.UPDATED_AT]: _obj.updated_at,
      [ES_QUESTIONS_FIELDS.CATEGORY_ID]: _obj.category_id,
      [ES_QUESTIONS_FIELDS.SHARED_MESSAGE]: _obj.sharedmessage,
      [ES_QUESTIONS_FIELDS.PARENT_QUESTION_ID]: _obj.parentquestionid,
      [ES_QUESTIONS_FIELDS.SHARED_BY]: _obj.shareduserid,
      [ES_QUESTIONS_FIELDS.SHARED_QUESTION_ID]: _obj.sharedquestiond,
      [ES_QUESTIONS_FIELDS.SHARED_AT]: _obj.sharedcreatedat,
    }, () => cb()));
  });
  async.parallelLimit(scripts, 50, () => {
    log(false, "_migrateToES", `Migrated ${data.length} docs`);
    callback()
  });
}
