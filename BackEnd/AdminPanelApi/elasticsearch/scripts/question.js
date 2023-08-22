const {FIELDS: QUESTION_FIELDS} = require("../indices/question");
const moment = require('moment');

const script = {};

script.resetReport = () => {
  return {
    inline: `
    ctx._source.${QUESTION_FIELDS.REPORT_COUNT} = 0;
    ctx._source.${QUESTION_FIELDS.UPDATED_AT} = ${moment().unix()};
    List tmp = new ArrayList();
    ctx._source.${QUESTION_FIELDS.REPORTED_BY} = tmp;
    `
  }
}

module.exports = script;