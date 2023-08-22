const AbstractElasticsearch = require('./abstract');
const { question: {
  FIELDS: QUESTION_FIELDS,
  NESTED_FIELDS: QUESTION_NESTED_FIELDS,
} } = require('./indices');

const { question: QUERY_QUESTION } = require("./queries");
const { question: SCRIPT_QUESTION } = require("./scripts");
const miscHelper = require("../helpers/misc");
require('dotenv-safe').config();

const indexName = process.env.ENV === "local" ? 'pre-dev-wt-feeds' : 'wt-feeds';

const COMMON_SOURCE_FIELDS = {
  "_source": {
    "exclude": [QUESTION_FIELDS.REPORTED_BY, QUESTION_FIELDS.REPORT_COUNT]
  }
}

const DEFAULT_QUESTION_SORTS = {
  "_script": {
    "type": "string",
    "order": "desc",
    "script": {
      "lang": "painless",
      "source": `if (!doc['${QUESTION_FIELDS.SHARED_AT}'].empty) { doc['${QUESTION_FIELDS.SHARED_AT}'].value.millis.toString()} else {doc['${QUESTION_FIELDS.CREATED_AT}'].value.millis.toString()}`,
      "params": {}
    }
  }
}
class WeThinkQuestions extends AbstractElasticsearch {

  indexDoc(id, title, createdBy, questionDate, createdAt, type, options = {}, callback) {

    const hashTags = miscHelper.pickHashtags(title);
    hashTags && console.log(`hastags for "${title}": ${hashTags}`);

    const _data = {
      [QUESTION_FIELDS.ID]: id,
      [`${QUESTION_FIELDS.TITLE}.${QUESTION_NESTED_FIELDS[QUESTION_FIELDS.TITLE].CRUDE}`]: title,
      [QUESTION_FIELDS.CREATED_BY]: createdBy,
      [QUESTION_FIELDS.QUESTION_DATE]: questionDate && Number((questionDate / 1000).toFixed(0)),
      [QUESTION_FIELDS.CREATED_AT]: createdAt && Number((createdAt / 1000).toFixed(0)),
      [QUESTION_FIELDS.TYPE]: type,
      [QUESTION_FIELDS.LIKE_COUNT]: 0,
      [QUESTION_FIELDS.COMMENT_COUNT]: 0,
      [QUESTION_FIELDS.SHARE_COUNT]: 0,
      [QUESTION_FIELDS.VOTE_COUNT]: 0,
      [QUESTION_FIELDS.HASH_TAGS]: Array.isArray(hashTags) ? hashTags : [],
      [QUESTION_FIELDS.IS_ACTIVE]: options[QUESTION_FIELDS.IS_ACTIVE] || true,
      [QUESTION_FIELDS.IS_DELETED]: options[QUESTION_FIELDS.IS_DELETED] || false,
      [QUESTION_FIELDS.IS_EXPIRED]: options[QUESTION_FIELDS.IS_EXPIRED] || false,
      [QUESTION_FIELDS.CATEGORY_ID]: options[QUESTION_FIELDS.CATEGORY_ID] ? [options[QUESTION_FIELDS.CATEGORY_ID]] : [],
      [QUESTION_FIELDS.DELETED_AT]: options[QUESTION_FIELDS.DELETED_AT] && Number((options[QUESTION_FIELDS.DELETED_AT] / 1000).toFixed(0)),
      [QUESTION_FIELDS.CREATED_AT]: options[QUESTION_FIELDS.UPDATED_AT] ? Number((options[QUESTION_FIELDS.UPDATED_AT] / 1000).toFixed(0)) : Number((createdAt / 1000).toFixed(0)),
      [QUESTION_FIELDS.EXPIRY_AT]: options[QUESTION_FIELDS.EXPIRY_AT] ? Number((options[QUESTION_FIELDS.EXPIRY_AT] / 1000).toFixed(0)) : Number((createdAt / 1000).toFixed(0)) + 14 * 24 * 60 * 60,
      [QUESTION_FIELDS.PARENT_QUESTION_ID]: options[QUESTION_FIELDS.PARENT_QUESTION_ID],
      [`${QUESTION_FIELDS.SHARED_MESSAGE}.${QUESTION_NESTED_FIELDS[QUESTION_FIELDS.SHARED_MESSAGE].CRUDE}`]: options[QUESTION_FIELDS.SHARED_MESSAGE],
      [QUESTION_FIELDS.SHARED_BY]: options[QUESTION_FIELDS.SHARED_BY],
      [QUESTION_FIELDS.REPORTED_BY]: [],
      [QUESTION_FIELDS.REPORT_COUNT]: 0,
      [QUESTION_FIELDS.PRIVACY]: [1, 2].includes(options[QUESTION_FIELDS.PRIVACY]) ? options[QUESTION_FIELDS.PRIVACY] : 1,
      [QUESTION_FIELDS.SHARED_QUESTION_ID]: options[QUESTION_FIELDS.SHARED_QUESTION_ID],
      [QUESTION_FIELDS.SHARED_AT]: options[QUESTION_FIELDS.SHARED_AT] && Number((options[QUESTION_FIELDS.SHARED_AT] / 1000).toFixed(0))
    }
    super.indexDoc(id, _data, callback);
  }

  /**
  * Incrementing like count [default being 1]
  * @param {*} id question id
  * @param {*} incrementBy increment amount
  * @returns 
  */
  incrementLikeCount(id, incrementBy = 1) {
    return new Promise((resolve, reject) => {
      if (!id || !incrementBy) {
        return reject(`[ES] ERROR IN incrementLikeCount():`, `invalid params`);
      }
      super.update(id, SCRIPT_QUESTION.incrementLikeCount(incrementBy), _fulfillPromiseCallback(resolve, reject));
    })
  }

  /**
  * Decrementing like count [default being 1]
  * @param {*} id question id
  * @param {*} incrementBy decrement amount
  * @returns 
  */
  decrementLikeCount(id, incrementBy = 1) {
    return new Promise((resolve, reject) => {
      if (!id || !incrementBy) {
        return reject(`[ES] ERROR IN decrementLikeCount():`, `invalid params`);
      }
      super.update(id, SCRIPT_QUESTION.decrementLikeCount(incrementBy), _fulfillPromiseCallback(resolve, reject));
    })
  }

  /**
  * Incrementing like count [default being 1]
  * @param {*} id question id
  * @param {*} incrementBy increment amount
  * @returns 
  */
  incrementLikeCountPost(id, incrementBy = 1) {
    return new Promise((resolve, reject) => {
      if (!id || !incrementBy) {
        return reject(`[ES] ERROR IN incrementLikeCount():`, `invalid params`);
      }
      super.updateByQuery({
        "term": {
          [QUESTION_FIELDS.SHARED_QUESTION_ID]: id
        }
      }, SCRIPT_QUESTION.incrementLikeCount(incrementBy), _fulfillPromiseCallback(resolve, reject));
    })
  }

  /**
  * Decrementing like count [default being 1]
  * @param {*} id question id
  * @param {*} incrementBy decrement amount
  * @returns 
  */
  decrementLikeCountPost(id, incrementBy = 1) {
    return new Promise((resolve, reject) => {
      if (!id || !incrementBy) {
        return reject(`[ES] ERROR IN decrementLikeCount():`, `invalid params`);
      }
      super.updateByQuery({
        "term": {
          [QUESTION_FIELDS.SHARED_QUESTION_ID]: id
        }
      }, SCRIPT_QUESTION.decrementLikeCount(incrementBy), _fulfillPromiseCallback(resolve, reject));
    })
  }

  /**
  * Incrementing comment count [default being 1]
  * @param {*} id question id
  * @param {*} incrementBy increment amount
  * @returns 
  */
  incrementCommentCount(id, incrementBy = 1) {
    return new Promise((resolve, reject) => {
      if (!id || !incrementBy) {
        return reject(`[ES] ERROR IN incrementCommentCount():`, `invalid params`);
      }
      super.update(id, SCRIPT_QUESTION.incrementCommentCount(incrementBy), _fulfillPromiseCallback(resolve, reject));
    })
  }

  /**
  * Decrementing comment count [default being 1]
  * @param {*} id question id
  * @param {*} incrementBy decrement amount
  * @returns 
  */
  decrementCommentCount(id, incrementBy = 1) {
    return new Promise((resolve, reject) => {
      if (!id || !incrementBy) {
        return reject(`[ES] ERROR IN decrementCommentCount():`, `invalid params`);
      }
      super.update(id, SCRIPT_QUESTION.decrementCommentCount(incrementBy), _fulfillPromiseCallback(resolve, reject));
    })
  }

  /**
  * Incrementing share count [default being 1]
  * @param {*} id question id
  * @param {*} incrementBy increment amount
  * @returns 
  */
  incrementShareCount(id, incrementBy = 1) {
    return new Promise((resolve, reject) => {
      if (!id || !incrementBy) {
        return reject(`[ES] ERROR IN incrementShareCount():`, `invalid params`);
      }
      super.update(id, SCRIPT_QUESTION.incrementShareCount(incrementBy), _fulfillPromiseCallback(resolve, reject));
    })
  }

  /**
  * Decrementing share count [default being 1]
  * @param {*} id question id
  * @param {*} incrementBy decrement amount
  * @returns 
  */
  decrementShareCount(id, incrementBy = 1) {
    return new Promise((resolve, reject) => {
      if (!id || !incrementBy) {
        return reject(`[ES] ERROR IN decrementShareCount():`, `invalid params`);
      }
      super.update(id, SCRIPT_QUESTION.decrementShareCount(incrementBy), _fulfillPromiseCallback(resolve, reject));
    })
  }

  /**
  * Incrementing comment count [default being 1]
  * @param {*} id question id
  * @param {*} incrementBy increment amount
  * @returns 
  */
  incrementCommentCountPost(id, incrementBy = 1) {
    return new Promise((resolve, reject) => {
      if (!id || !incrementBy) {
        return reject(`[ES] ERROR IN incrementCommentCount():`, `invalid params`);
      }
      super.updateByQuery({
        "term": {
          [QUESTION_FIELDS.SHARED_QUESTION_ID]: id
        }
      }, SCRIPT_QUESTION.incrementCommentCount(incrementBy), _fulfillPromiseCallback(resolve, reject));
    })
  }

  /**
  * Decrementing comment count [default being 1]
  * @param {*} id question id
  * @param {*} incrementBy decrement amount
  * @returns 
  */
  decrementCommentCountPost(id, incrementBy = 1) {
    return new Promise((resolve, reject) => {
      if (!id || !incrementBy) {
        return reject(`[ES] ERROR IN decrementCommentCount():`, `invalid params`);
      }
      super.updateByQuery({
        "term": {
          [QUESTION_FIELDS.SHARED_QUESTION_ID]: id
        }
      }, SCRIPT_QUESTION.decrementCommentCount(incrementBy), _fulfillPromiseCallback(resolve, reject));
    })
  }

  /**
  * Incrementing share count [default being 1]
  * @param {*} id question id
  * @param {*} incrementBy increment amount
  * @returns 
  */
  incrementShareCountPost(id, incrementBy = 1) {
    return new Promise((resolve, reject) => {
      if (!id || !incrementBy) {
        return reject(`[ES] ERROR IN incrementShareCount():`, `invalid params`);
      }
      super.updateByQuery({
        "term": {
          [QUESTION_FIELDS.SHARED_QUESTION_ID]: id
        }
      }, SCRIPT_QUESTION.incrementShareCount(incrementBy), _fulfillPromiseCallback(resolve, reject));
    })
  }

  /**
  * Decrementing share count [default being 1]
  * @param {*} id question id
  * @param {*} incrementBy decrement amount
  * @returns 
  */
  decrementShareCountPost(id, incrementBy = 1) {
    return new Promise((resolve, reject) => {
      if (!id || !incrementBy) {
        return reject(`[ES] ERROR IN decrementShareCount():`, `invalid params`);
      }
      super.updateByQuery({
        "term": {
          [QUESTION_FIELDS.SHARED_QUESTION_ID]: id
        }
      }, SCRIPT_QUESTION.decrementShareCount(incrementBy), _fulfillPromiseCallback(resolve, reject));
    })
  }

  /**
  * Incrementing vote count [default being 1]
  * @param {*} id question id
  * @param {*} incrementBy increment amount
  * @returns 
  */
  incrementVoteCount(id, incrementBy = 1) {
    return new Promise((resolve, reject) => {
      if (!id || !incrementBy) {
        return reject(`[ES] ERROR IN incrementVoteCount():`, `invalid params`);
      }
      super.update(id, SCRIPT_QUESTION.incrementVoteCount(incrementBy), _fulfillPromiseCallback(resolve, reject));
    })
  }

  /**
  * Decrementing vote count [default being 1]
  * @param {*} id question id
  * @param {*} incrementBy decrement amount
  * @returns 
  */
  decrementVoteCount(id, incrementBy = 1) {
    return new Promise((resolve, reject) => {
      if (!id || !incrementBy) {
        return reject(`[ES] ERROR IN decrementVoteCount():`, `invalid params`);
      }
      super.update(id, SCRIPT_QUESTION.decrementVoteCount(incrementBy), _fulfillPromiseCallback(resolve, reject));
    })
  }

  trendingModelA(userId, options = {}) {
    const _body = {
      size: options.pageData ? options.pageData.size : 50,
      from: options.pageData ? options.pageData.from : 0,
      query: QUERY_QUESTION.trendingA(userId, options)
    };
    return new Promise((resolve, reject) => super.search(_body, _fulfillPromiseCallback(resolve, reject)));
  }

  trendingModelB(userId, options = {}) {
    const _body = {
      size: options.pageData ? options.pageData.size : 50,
      from: options.pageData ? options.pageData.from : 0,
      query: QUERY_QUESTION.trendingB(userId, options),
      ...COMMON_SOURCE_FIELDS
    };
    return new Promise((resolve, reject) => super.search(_body, _fulfillPromiseCallback(resolve, reject)));
  }

  trendingModelC(userId, options = {}) {
    const _body = {
      size: options.pageData ? options.pageData.size : 50,
      from: options.pageData ? options.pageData.from : 0,
      query: QUERY_QUESTION.trendingC(userId, options),
      ...COMMON_SOURCE_FIELDS
    };
    return new Promise((resolve, reject) => super.search(_body, _fulfillPromiseCallback(resolve, reject)));
  }

  trendingModelD(userId, options = {}) {
    const _body = {
      size: options.pageData ? options.pageData.size : 50,
      from: options.pageData ? options.pageData.from : 0,
      query: QUERY_QUESTION.trendingD(userId, options),
      ...COMMON_SOURCE_FIELDS
    };
    return new Promise((resolve, reject) => super.search(_body, _fulfillPromiseCallback(resolve, reject)));
  }

  updateDeletion(id, flag, options = {}) {
    if (!id) return;
    return new Promise((resolve, reject) => super.updateWithPartialDoc(id, {
      [QUESTION_FIELDS.IS_DELETED]: flag
    }, _fulfillPromiseCallback(resolve, reject)));
  }

  markUserAllPostsDeleted(userId, options = {}) {
    if (!userId) return;
    const query = {
      "bool": {
        "should": [{
          "term": {
            [QUESTION_FIELDS.CREATED_BY]: userId
          }
        }, {
          "term": {
            [QUESTION_FIELDS.SHARED_BY]: userId
          }
        }]
      }
    };
    return new Promise((resolve, reject) => super.updateByQuery(query, SCRIPT_QUESTION.updateDelete(), _fulfillPromiseCallback(resolve, reject)));
  }

  updateActive(id, flag, options = {}) {
    if (!id) return;
    return new Promise((resolve, reject) => super.updateWithPartialDoc(id, {
      [QUESTION_FIELDS.IS_ACTIVE]: flag
    }, _fulfillPromiseCallback(resolve, reject)));
  }

  updateExpiration(id, flag, options = {}) {
    if (!id) return;
    return new Promise((resolve, reject) => super.updateWithPartialDoc(id, {
      [QUESTION_FIELDS.IS_EXPIRED]: flag
    }, _fulfillPromiseCallback(resolve, reject)));
  }

  keywordSearch(userId, options = {}) {
    const _body = {
      size: options.size || 50,
      from: options.from || 0,
      query: QUERY_QUESTION.keywordSearch(userId, options),
      sort: [{ _score: "desc" }],
      ...COMMON_SOURCE_FIELDS
    };
    return new Promise((resolve, reject) => super.search(_body, _fulfillPromiseCallback(resolve, reject)));
  }

  hashtaggedQuestions(userId, options = {}) {
    const _body = {
      size: options.size || 50,
      from: options.from || 0,
      query: QUERY_QUESTION.hastaggedQuestions(userId, options),
      ...COMMON_SOURCE_FIELDS
    };
    return new Promise((resolve, reject) => super.search(_body, _fulfillPromiseCallback(resolve, reject)));
  }

  getDetailByIds(ids) {
    const _body = {
      query: {
        "terms": {
          [QUESTION_FIELDS.ID]: ids
        }
      },
      from: 0,
      size: 1000,
      ...COMMON_SOURCE_FIELDS
    }
    return new Promise((resolve, reject) => super.search(_body, _fulfillPromiseCallback(resolve, reject)));
  }

  myFeeds(userIds, options = {}) {
    const _body = {
      size: options.size || 50,
      from: options.from || 0,
      query: QUERY_QUESTION.myFeeds(userIds, options),
      sort: DEFAULT_QUESTION_SORTS,
      ...COMMON_SOURCE_FIELDS
    };
    return new Promise((resolve, reject) => super.search(_body, _fulfillPromiseCallback(resolve, reject)));
  }

  user(userId, options = {}) {
    const _body = {
      size: (typeof options.size === 'number' && options.size >= 0 && options.size <= 50) ? options.size : 50,
      from: options.from || 0,
      query: QUERY_QUESTION.userFeeds(userId, options),
      ...COMMON_SOURCE_FIELDS
    };
    if (!options.keyword) {
      _body["sort"] = DEFAULT_QUESTION_SORTS;
    }
    return new Promise((resolve, reject) => super.search(_body, _fulfillPromiseCallback(resolve, reject)));
  }

  /**
  * Report a poll
  * @param {*} id question id
  * @param {*} reportedBy reported by user id
  * @returns 
  */
  report(id, reportedBy) {
    return new Promise((resolve, reject) => {
      if (!id || !reportedBy) {
        return reject(`[ES] ERROR IN report():`, `invalid params`);
      }
      super.update(id, SCRIPT_QUESTION.report(reportedBy), _fulfillPromiseCallback(resolve, reject));
    })
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

  /**
  * updating privacy of user's all posts
  * @param {*} userId 
  * @param {*} privacy 
  * @param {*} options 
  * @returns 
  */
  updatePrivacy(userId, privacy = 0, options = {}) {
    return new Promise((resolve, reject) => {
      if (!userId) {
        return reject(`[ES] ERROR IN updatePrivacy():`, `invalid params`);
      }
      super.updateByQuery({
        "bool": {
          "must": [{
            "term": {
              [QUESTION_FIELDS.CREATED_BY]: userId
            }
          }]
        }
      }, SCRIPT_QUESTION.updatePrivacy(privacy), _fulfillPromiseCallback(resolve, reject));
    })
  }

  deleteQuestionsAndRelatedPost(questionid, options = {}) {
    return new Promise((resolve, reject) => {
      if (!questionid) {
        return reject(`[ES] ERROR IN deleteQuestionsAndRelatedPost():`, `invalid params`);
      }
      super.updateByQuery({
        "bool": {
          "should": [{
            "term": {
              [QUESTION_FIELDS.PARENT_QUESTION_ID]: questionid
            }
          }, {
            "term": {
              "_id": questionid
            }
          }]
        }
      }, SCRIPT_QUESTION.updateDelete(), _fulfillPromiseCallback(resolve, reject));
    })
  }

  expireOldQuestions(options = {}) {
    return new Promise((resolve, reject) => {
      super.updateByQuery({
        "bool": {
          "must": [{
            "range": {
              [QUESTION_FIELDS.EXPIRY_AT]: {
                "lte": `now`
              }
            }
          }]
        }
      }, SCRIPT_QUESTION.expire(), _fulfillPromiseCallback(resolve, reject));
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