const async = require('async');
const { question: questionES } = require(".");
const { question: { FIELDS: ES_QUESTIONS_FIELDS } } = require("./indices");
const Sequelize = require('../config/connection');
const moment = require('moment');

let DB_MAX_LIMIT = 50;

const log = (isError, methodName, description) => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")} | QUESTION_MIGRATION | ${isError ? "ERROR" : "SUCCESS"}] => ${methodName} : ${description}`);
}

module.exports = (callback) => {
  console.time(`QUESTIONS_MIGRATIONS finished...`);
  _migrateRecursively(0, () => {
    console.timeEnd(`QUESTIONS_MIGRATIONS finished...`);
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
  const query = `SELECT Q.*, C.*, Q.question_id AS id
  FROM questions AS Q
  LEFT JOIN question_category_mapping AS C ON Q.question_id = C.question_id
  LIMIT ${DB_MAX_LIMIT} OFFSET ${offset}`
  Sequelize.query(query, { type: Sequelize.QueryTypes.SELECT }).then(results => {
    log(false, "_fetchFromDB", `fetched from ${offset} -> ${offset + DB_MAX_LIMIT}: ${results.length}`);
    return callback(null, results);
  })
}

const _migrateToES = (data, callback) => {
  const scripts = [];
  data.forEach(_obj => {
    scripts.push(cb => questionES.indexDoc(_obj.id, _obj.question_title, _obj.created_by, _obj.question_date, _obj.created_at, _obj.question_type, {
      [ES_QUESTIONS_FIELDS.IS_ACTIVE]: _obj.is_active,
      [ES_QUESTIONS_FIELDS.IS_DELETED]: _obj.is_deleted,
      [ES_QUESTIONS_FIELDS.IS_EXPIRED]: _obj.is_expired,
      [ES_QUESTIONS_FIELDS.DELETED_AT]: _obj.deleted_at,
      [ES_QUESTIONS_FIELDS.UPDATED_AT]: _obj.updated_at,
      [ES_QUESTIONS_FIELDS.CATEGORY_ID]: _obj.category_id,
    }, () => cb()));
  });
  async.parallelLimit(scripts, 50, () => {
    log(false, "_migrateToES", `Migrated ${data.length} docs`);
    callback()
  });
}
