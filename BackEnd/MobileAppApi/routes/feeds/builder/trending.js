const async = require('async');
const { FIELDS: ES_QUESTIONS_FIELDS } = require("../../../elasticsearch/indices/question");
const jwt = require('jsonwebtoken');
const UserController = require("../../../components/User/UserController");

/**
* An identifier tag 
*/
const MODEL_TAGS = {
  A: 'MODEL_A',
  B: 'MODEL_B',
  C: 'MODEL_C',
  D: 'MODEL_D',
}

/**
* questions count of each model
*/
const MODEL_PAGE_SIZE = {
  [MODEL_TAGS.A]: 10,
  [MODEL_TAGS.B]: 10,
  [MODEL_TAGS.C]: 10,
  [MODEL_TAGS.D]: 10,
}

/**
* default page data
*/
const DEFAULT_PAGE_DATA = {
  [MODEL_TAGS.A]: {
    from: 0,
    size: MODEL_PAGE_SIZE[MODEL_TAGS.A]
  },
  [MODEL_TAGS.B]: {
    from: 0,
    size: MODEL_PAGE_SIZE[MODEL_TAGS.B]
  },
  [MODEL_TAGS.C]: {
    from: 0,
    size: MODEL_PAGE_SIZE[MODEL_TAGS.C]
  },
  [MODEL_TAGS.D]: {
    from: 0,
    size: MODEL_PAGE_SIZE[MODEL_TAGS.D]
  },
}

/**
* Models score
*/
const SCORES = {
  [MODEL_TAGS.A]: 10,
  [MODEL_TAGS.B]: 8,
  [MODEL_TAGS.C]: 6,
  [MODEL_TAGS.D]: 4,
}

const MODEL_A = require("../models/A");
const MODEL_B = require("../models/B");
const MODEL_C = require("../models/C");
const MODEL_D = require("../models/D");

const decider = {};

decider.buildFeeds = async (userId, options = {}) => {
  //fetching active models
  const _activeModels = _fetchActiveModels();

  let _blockedUsers = [];
  const __blocked = await new UserController().getBlockListController({page_number: 1, limit: 1000}, userId);
  if(__blocked && Array.isArray(__blocked.data) && __blocked.data.length){
    _blockedUsers = [...new Set(__blocked.data.map(_obj => _obj.user_id))];
  }

  //fetching questions from each models
  let { FEEDS, FEEDS_COUNT, nextCursor } = await _fetchFeedsForModels(userId, _activeModels, options.cursor, options.categoryId, _blockedUsers);

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
  return { FEEDS_COUNT, count: feeds.length, feeds, cursor: nextCursor };
}

module.exports = decider;

/**
* fetching active models
* @returns 
*/
const _fetchActiveModels = () => {
  let _active = [];
  MODEL_A.IS_ACTIVE && MODEL_PAGE_SIZE[MODEL_TAGS.A] && _active.push(MODEL_TAGS.A);
  MODEL_B.IS_ACTIVE && MODEL_PAGE_SIZE[MODEL_TAGS.B] && _active.push(MODEL_TAGS.B);
  MODEL_C.IS_ACTIVE && MODEL_PAGE_SIZE[MODEL_TAGS.C] && _active.push(MODEL_TAGS.C);
  MODEL_D.IS_ACTIVE && MODEL_PAGE_SIZE[MODEL_TAGS.D] && _active.push(MODEL_TAGS.D);
  return _active;
}

/**
* fetching questions of each model concurrently (...currently)
* TODO: If active models count increases by 7 then do optimisation
* @param {*} userId 
* @param {*} activeModels 
* @returns 
*/
const _fetchFeedsForModels = async (userId, activeModels, cursor, categoryId, blockedUsers = []) => {
  return new Promise(async (resolve, reject) => {
    let FEEDS = {};
    let FEEDS_COUNT = {};

    const { pageData, nextCursor } = _paginationHandler(cursor);

    let scripts = [];
    activeModels.forEach(_modelTag => {
      scripts.push(cb => {
        switch (_modelTag) {
          case MODEL_TAGS.A: MODEL_A.fetch(userId, {
            tag: MODEL_TAGS.A, size: MODEL_PAGE_SIZE[MODEL_TAGS.A], pageData: pageData[MODEL_TAGS.A], categoryId, blockedUsers
          }).then(result => {
            FEEDS[MODEL_TAGS.A] = result;
            FEEDS_COUNT[MODEL_TAGS.A] = result.length;
            cb();
          }).catch(e => {
            cb();
          })
            break;
          case MODEL_TAGS.B: MODEL_B.fetch(userId, {
            tag: MODEL_TAGS.B, size: MODEL_PAGE_SIZE[MODEL_TAGS.B], pageData: pageData[MODEL_TAGS.B], categoryId, blockedUsers
          }).then(result => {
            FEEDS[MODEL_TAGS.B] = result;
            FEEDS_COUNT[MODEL_TAGS.B] = result.length;
            cb();
          }).catch(e => {
            cb();
          })
            break;
          case MODEL_TAGS.C: MODEL_C.fetch(userId, {
            tag: MODEL_TAGS.C, size: MODEL_PAGE_SIZE[MODEL_TAGS.C], pageData: pageData[MODEL_TAGS.C], categoryId, blockedUsers
          }).then(result => {
            FEEDS[MODEL_TAGS.C] = result;
            FEEDS_COUNT[MODEL_TAGS.C] = result.length;
            cb();
          }).catch(e => {
            cb();
          })
            break;
          case MODEL_TAGS.D: MODEL_D.fetch(userId, {
            tag: MODEL_TAGS.D, size: MODEL_PAGE_SIZE[MODEL_TAGS.D], pageData: pageData[MODEL_TAGS.D], categoryId, blockedUsers
          }).then(result => {
            FEEDS[MODEL_TAGS.D] = result;
            FEEDS_COUNT[MODEL_TAGS.D] = result.length;
            cb();
          }).catch(e => {
            cb();
          })
            break;
        }
      })
    });

    async.parallelLimit(scripts, 10, () => {
      return resolve({ FEEDS, FEEDS_COUNT, nextCursor });
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
        case MODEL_TAGS.A: {
          _score += SCORES[MODEL_TAGS.A];
        }
          break;
        case MODEL_TAGS.B: {
          _score += SCORES[MODEL_TAGS.B];
        }
          break;
        case MODEL_TAGS.C: {
          _score += SCORES[MODEL_TAGS.C];
        }
          break;
        case MODEL_TAGS.D: {
          _score += SCORES[MODEL_TAGS.D];
        }
          break;
      }
    });
    _obj._score = _score;
  });
  return feeds;
}

const PAGE_SALT = "PAGE_SALT:sdk39!"
const _paginationHandler = (cursor) => {
  try {
    if (!cursor) {
      return {
        pageData: DEFAULT_PAGE_DATA,
        nextCursor: jwt.sign(DEFAULT_PAGE_DATA, PAGE_SALT, {})
      };
    }

    const pageData = jwt.verify(cursor, PAGE_SALT);
    if (!pageData) {
      return {
        pageData: DEFAULT_PAGE_DATA,
        nextCursor: jwt.sign(DEFAULT_PAGE_DATA, PAGE_SALT, {})
      };
    }

    //Building next cursor
    pageData[MODEL_TAGS.A] = {
      from: pageData[MODEL_TAGS.A].from + pageData[MODEL_TAGS.A].size,
      size: pageData[MODEL_TAGS.A].size
    }
    pageData[MODEL_TAGS.B] = {
      from: pageData[MODEL_TAGS.B].from + pageData[MODEL_TAGS.B].size,
      size: pageData[MODEL_TAGS.B].size
    }
    pageData[MODEL_TAGS.C] = {
      from: pageData[MODEL_TAGS.C].from + pageData[MODEL_TAGS.C].size,
      size: pageData[MODEL_TAGS.C].size
    }
    pageData[MODEL_TAGS.D] = {
      from: pageData[MODEL_TAGS.D].from + pageData[MODEL_TAGS.D].size,
      size: pageData[MODEL_TAGS.D].size
    }

    return {
      pageData,
      nextCursor: jwt.sign(pageData, PAGE_SALT, {})
    };
  } catch (e) {
    return {
      pageData: DEFAULT_PAGE_DATA,
      nextCursor: jwt.sign(DEFAULT_PAGE_DATA, PAGE_SALT, {})
    };
  }
}