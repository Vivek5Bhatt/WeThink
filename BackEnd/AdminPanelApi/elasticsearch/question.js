const AbstractElasticsearch = require('./abstract');
const { question: {
  FIELDS: QUESTION_FIELDS,
  NESTED_FIELDS: QUESTION_NESTED_FIELDS,
} } = require('./indices');

const { question: SCRIPT_QUESTION } = require("./scripts");
require('dotenv-safe').config();

const indexName = process.env.ENV === "local" ? 'pre-dev-wt-feeds' : 'wt-feeds';

class WeThinkQuestions extends AbstractElasticsearch {
  
  
  updateDeletion(id, flag, options = {}) {
    if (!id) return;
    return new Promise((resolve, reject) => super.updateWithPartialDoc(id, {
      [QUESTION_FIELDS.IS_DELETED]: flag
    }, _fulfillPromiseCallback(resolve, reject)));
  }
  
  
  updateActive(id, flag, options = {}) {
    if (!id) return;
    return new Promise((resolve, reject) => super.updateWithPartialDoc(id, {
      [QUESTION_FIELDS.IS_ACTIVE]: flag
    }, _fulfillPromiseCallback(resolve, reject)));
  }
  
  /**
  * Reset report a poll
  * @param {*} id question id
  * @param {*} incrementBy increment amount
  * @returns 
  */
  resetReport(id) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject(`[ES] ERROR IN resetReport():`, `invalid params`);
      }
      super.update(id, SCRIPT_QUESTION.resetReport(), _fulfillPromiseCallback(resolve, reject));
    })
  }
}

module.exports = new WeThinkQuestions(indexName);

_fulfillPromiseCallback = (resolve, reject) => {
  return (err, response) => {
    if (err) {
      return resolve();
    }
    resolve(response);
  };
}