const async = require('async');
const { FIELDS: ES_QUESTIONS_FIELDS } = require("../../../elasticsearch/indices/question");

/**
* An identifier tag 
*/
const MODEL_TAGS = {
  E: 'MODEL_E',
}

/**
* questions count of each model
*/
const MODEL_PAGE_SIZE = {
  [MODEL_TAGS.E]: 50,
}

/**
* Models score
*/
const SCORES = {
  [MODEL_TAGS.E]: 4,
}

const MODEL_E = require("../models/E");

const decider = {};

decider.buildFeeds = async (userId, options = {}) => {
  //fetching active models
  const _activeModels = _fetchActiveModels();

  //fetching questions from each models
  let { FEEDS, FEEDS_COUNT } = await _fetchFeedsForModels(userId, _activeModels);

  //merging feeds lists from each model
  let feeds = [];
  Object.values(FEEDS).forEach(_feed => {
    feeds = feeds.concat(_feed);
  });

  //removing duplicates from feeds, as a question can come from more than 1 model
  feeds = _removeDuplicates(feeds);

  //rearranging questions based on scores
  feeds = _rearrange(feeds);

  /**
  * returning:
  * FEEDS_COUNT: count of each models in a page fetched from ES (does not consider duplicacy)
  * count: actual page size
  * feeds: questions list
  */
  return { FEEDS_COUNT, count: feeds.length, feeds };
}

module.exports = decider;

/**
* fetching active models
* @returns 
*/
const _fetchActiveModels = () => {
  let _active = [];
  MODEL_E.IS_ACTIVE && MODEL_PAGE_SIZE[MODEL_TAGS.E] && _active.push(MODEL_TAGS.E);
  return _active;
}

/**
* fetching questions of each model concurrently (...currently)
* TODO: If active models count increases by 7 then do optimisation
* @param {*} userId 
* @param {*} activeModels 
* @returns 
*/
const _fetchFeedsForModels = async (userId, activeModels) => {
  return new Promise(async (resolve, reject) => {
    let FEEDS = {};
    let FEEDS_COUNT = {};

    let scripts = [];
    activeModels.forEach(_modelTag => {
      scripts.push(cb => {
        switch (_modelTag) {
          case MODEL_TAGS.E: MODEL_E.fetch(userId, {
            tag: MODEL_TAGS.E, size: MODEL_PAGE_SIZE[MODEL_TAGS.E]
          }).then(result => {
            FEEDS[MODEL_TAGS.E] = result;
            FEEDS_COUNT[MODEL_TAGS.E] = result.length;
            cb();
          }).catch(e => {
            cb();
          })
            break;
        }
      })
    });

    async.parallelLimit(scripts, 10, () => {
      return resolve({ FEEDS, FEEDS_COUNT });
    })
  })
}

/**
* removing duplicates (if any)
* Reason for duplicacy: a question can come up from more than 2 models
* @param {*} list 
* @returns 
*/
const _removeDuplicates = (list) => {
  let modelMap = {};
  list.forEach(_post => {
    if (!Array.isArray(_post.tag)) {
      const _curr = modelMap[_post[ES_QUESTIONS_FIELDS.ID]] || [];
      _curr.push(_post.tag);
      modelMap[_post[ES_QUESTIONS_FIELDS.ID]] = _curr;
    }
  })

  let map = new Map();
  list.forEach(_obj => {
    !Array.isArray(_obj.tag) && (_obj.tag = modelMap[_obj[ES_QUESTIONS_FIELDS.ID]]);
    map.set(_obj[ES_QUESTIONS_FIELDS.ID], _obj);
  })
  list = [...map.values()];
  return list;
}

const _rearrange = (feeds) => {
  feeds.forEach(_obj => {
    let _score = 0;
    const _models = _obj.tag || [];
    _models.forEach(_tag => {
      switch (_tag) {
        case MODEL_TAGS.E: {
          _score += SCORES[MODEL_TAGS.E];
        }
          break;
      }
    });
    _obj._score = _score;
  });
  return feeds;
}
