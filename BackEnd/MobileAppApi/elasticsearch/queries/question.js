const {
  FIELDS: QUERY_FIELDS, 
  NESTED_FIELDS: QUERY_NESTED_FIELDS
} = require('../indices/question');
const C = require("../../utils/Constants");

const query = {};

query.trendingA = (userId, options = {}) => {
  let mustArray = [], mustNotArray = [], shouldArray = [];
  
  _handleTimeRange(mustArray, 0, 1);
  // _handleCountRestriction(mustArray, 10, 5, 10, 2);
  _handleTimeWeigtage(shouldArray, "1h/h", "6h/h");
  _handleActive(mustArray);
  _handleExpiry(mustArray);
  _handleCategory(mustArray, options);
  _handleReportedPosts(mustArray, mustNotArray, userId);
  _handleBlockedUsers(mustNotArray, options.blockedUsers);
  _handlePublic(mustArray);
  
  return {
    "bool": {
      "should": shouldArray.length ? shouldArray : undefined,
      "must": mustArray.length ? mustArray : undefined,
      "must_not": mustNotArray.length ? mustNotArray : undefined,
    }
  }
}

query.trendingB = (userId, options = {}) => {
  let mustArray = [], mustNotArray = [], shouldArray = [];
  
  _handleTimeRange(mustArray, 1, 5);
  // _handleCountRestriction(mustArray, 10, 5, 10, 2);
  _handleTimeWeigtage(shouldArray, "2d/d", "4d/d");
  _handleActive(mustArray);
  _handleExpiry(mustArray);
  _handleCategory(mustArray, options);
  _handleReportedPosts(mustArray, mustNotArray, userId);
  _handleBlockedUsers(mustNotArray, options.blockedUsers);
  _handlePublic(mustArray);
  
  return {
    "bool": {
      "should": shouldArray.length ? shouldArray : undefined,
      "must": mustArray.length ? mustArray : undefined,
      "must_not": mustNotArray.length ? mustNotArray : undefined,
    }
  }
}

query.trendingC = (userId, options = {}) => {
  let mustArray = [], mustNotArray = [], shouldArray = [];
  
  _handleTimeRange(mustArray, 1, 5);
  // _handleCountRestriction(mustArray, 20, 10, 20, 5);
  _handleTimeWeigtage(shouldArray, "2d/d", "4d/d");
  _handleActive(mustArray);
  _handleExpiry(mustArray);
  _handleCategory(mustArray, options);
  _handleReportedPosts(mustArray, mustNotArray, userId);
  _handleBlockedUsers(mustNotArray, options.blockedUsers);
  _handlePublic(mustArray);
  
  return {
    "bool": {
      "should": shouldArray.length ? shouldArray : undefined,
      "must": mustArray.length ? mustArray : undefined,
      "must_not": mustNotArray.length ? mustNotArray : undefined,
    }
  }
}

query.trendingD = (userId, options = {}) => {
  let mustArray = [], mustNotArray = [], shouldArray = [];
  
  _handleTimeRange(mustArray, 5, 15);
  // _handleCountRestriction(mustArray, 20, 10, 20, 5);
  _handleTimeWeigtage(shouldArray, "10d/d", "15d/d");
  _handleActive(mustArray);
  _handleExpiry(mustArray);
  _handleCategory(mustArray, options);
  _handleReportedPosts(mustArray, mustNotArray, userId);
  _handleBlockedUsers(mustNotArray, options.blockedUsers);
  _handlePublic(mustArray);
  
  return {
    "bool": {
      "should": shouldArray.length ? shouldArray : undefined,
      "must": mustArray.length ? mustArray : undefined,
      "must_not": mustNotArray.length ? mustNotArray : undefined,
    }
  }
}

query.keywordSearch = (userId, options = {}) => {
  let mustArray = [], mustNotArray = [], shouldArray = [];
  
  _handleActive(mustArray);
  _titleKeywordSearch(mustArray, options.keyword);
  _skipSharedQuestions(mustNotArray);
  _handleReportedPosts(mustArray, mustNotArray, userId);
  _handleBlockedUsers(mustNotArray, options.blockedUsers);
  _handlePublic(mustArray);
  if(options.userId){
    mustArray.push({
      "term": {
        [QUERY_FIELDS.CREATED_BY]: options.userId
      }
    })
  }
  if(options.categoryId){
    mustArray.push({
      "term": {
        [QUERY_FIELDS.CATEGORY_ID]: options.categoryId
      }
    })
  }
  
  return {
    "bool": {
      "should": shouldArray.length ? shouldArray : undefined,
      "must": mustArray.length ? mustArray : undefined,
      "must_not": mustNotArray.length ? mustNotArray : undefined,
    }
  }
}

query.hastaggedQuestions = (userId, options = {}) => {
  let mustArray = [], mustNotArray = [], shouldArray = [];
  
  _handleActive(mustArray);
  _handleExpiry(mustArray);
  _handleReportedPosts(mustArray, mustNotArray, userId);
  _handleBlockedUsers(mustNotArray, options.blockedUsers);
  _handlePublic(mustArray);
  
  mustArray.push({
    "term": {
      [QUERY_FIELDS.HASH_TAGS]: options.hashtag
    }
  })
  
  return {
    "bool": {
      "should": shouldArray.length ? shouldArray : undefined,
      "must": mustArray.length ? mustArray : undefined,
      "must_not": mustNotArray.length ? mustNotArray : undefined,
    }
  }
}

query.myFeeds = (userIds, options = {}) => {
  let mustArray = [], mustNotArray = [], shouldArray = [];
  
  _handleActive(mustArray);
  _handleExpiry(mustArray);
  _handleReportedPosts(mustArray, mustNotArray, options.userId);
  
  mustArray.push({
    "bool": {
      "should": [{
        "terms": {
          [QUERY_FIELDS.CREATED_BY]: userIds
        }
      }, {
        "terms": {
          [QUERY_FIELDS.SHARED_BY]: userIds
        }
      }]
    }
  })
  
  return {
    "bool": {
      "should": shouldArray.length ? shouldArray : undefined,
      "must": mustArray.length ? mustArray : undefined,
      "must_not": mustNotArray.length ? mustNotArray : undefined,
    }
  }
}

query.userFeeds = (userId, options = {}) => {
  let mustArray = [], mustNotArray = [], shouldArray = [];
  
  mustArray.push({
    "bool": {
      "should": [{
        "bool": {
          "must": [{
            "term": {
              [QUERY_FIELDS.CREATED_BY]: userId
            }
          }],
          "must_not": [{
            "exists": {
              "field": QUERY_FIELDS.SHARED_BY
            }
          }]
        }
      }, options.repost ? {
        "term": {
          [QUERY_FIELDS.SHARED_BY]: userId
        }
      } : undefined].filter(Boolean)
    }
  });
  
  !options.repost && mustNotArray.push({
    "exists": {
      "field": QUERY_FIELDS.SHARED_BY
    }
  });
  
  _handleActive(mustArray);
  _handleReportedPosts(mustArray, mustNotArray, options.userId);
  _handleCategory(mustArray, options);
  options.keyword && _titleKeywordSearchExplict(mustArray, options.keyword);
  
  return {
    "bool": {
      "should": shouldArray.length ? shouldArray : undefined,
      "must": mustArray.length ? mustArray : undefined,
      "must_not": mustNotArray.length ? mustNotArray : undefined,
    }
  }
}

module.exports = query;

const _skipSharedQuestions = (array) => {
  array.push({
    "exists": {
      "field": QUERY_FIELDS.PARENT_QUESTION_ID
    }
  })
}

const _titleKeywordSearch = (array, keyword) => {
  array.push({
    "wildcard": {
      [`${QUERY_FIELDS.TITLE}.${QUERY_NESTED_FIELDS[QUERY_FIELDS.TITLE].KEYWORD}`]: {
        "value": `*${keyword}*`,
        "boost": 30,
        "rewrite": "constant_score",
      }
    }
  }
  )
}

const _titleKeywordSearchExplict = (array, keyword) => {
  array.push({
    "wildcard": {
      [`${QUERY_FIELDS.TITLE}.${QUERY_NESTED_FIELDS[QUERY_FIELDS.TITLE].KEYWORD}`]: {
        "value": `*${keyword}*`,
        "boost": 30,
        "rewrite": "constant_score",
      }
    }
  }
  )
}

const _handleActive = (array) => {
  array.push({
    "term": {
      [QUERY_FIELDS.IS_ACTIVE]: true
    }
  }, {
    "term": {
      [QUERY_FIELDS.IS_DELETED]: false
    }
  })
}

const _handleExpiry = (array) => {
  array.push({
    "range": {
      [QUERY_FIELDS.EXPIRY_AT]: {
        "gte": "now"
      }
    }
  })
}

const _handleCategory = (array, options = {}) => {
  if(!options.categoryId) return;
  array.push({
    "term": {
      [QUERY_FIELDS.CATEGORY_ID]: options.categoryId
    }
  })
}

const _handleTimeRange = (array, start, end) => {
  start = 0, end = 1000;
  array.push({
    "range": {
      [QUERY_FIELDS.CREATED_AT]: {
        "lte": start ? `now-${start}d/d` : "now",
        "gt": `now-${end}d/d`
      }
    }
  })
}

const _handleCountRestriction = (array, minimumLikes = 0, mimimumComments = 0, minimumVotes = 0, minimumShares = 0) => {
  array.push({
    "range": {
      [QUERY_FIELDS.LIKE_COUNT]: {
        "gte": minimumLikes
      }
    }
  },
  {
    "range": {
      [QUERY_FIELDS.COMMENT_COUNT]: {
        "gte": mimimumComments
      }
    }
  },
  {
    "range": {
      [QUERY_FIELDS.VOTE_COUNT]: {
        "gte": minimumVotes
      }
    }
  }, {
    "range": {
      [QUERY_FIELDS.SHARE_COUNT]: {
        "gte": minimumShares
      }
    }
  });
}

const _handleTimeWeigtage = (array, a, b) => {
  array.push({
    "range": {
      [QUERY_FIELDS.CREATED_AT]: {
        "gte": `now-${a}`,
        "lte": "now/d",
        "boost": 30
      }
    }
  },{
    "range": {
      [QUERY_FIELDS.CREATED_AT]: {
        "gte": `now-${b}`,
        "lte": `now-${a}`,
        "boost": 15
      }
    }
  }, {
    "range": {
      [QUERY_FIELDS.CREATED_AT]: {
        "lte": `now-${b}`,
        "boost": 2
      }
    }
  });
}

const _handleReportedPosts = (must, mustNot, userId) => {
  must.push({
    "bool": {
      "should": [{
        "range": {
          [QUERY_FIELDS.REPORT_COUNT]: {
            "lte": 5
          }
        }
      },
      {
        "bool": {
          "must_not": [
            {
              "exists": {
                "field": QUERY_FIELDS.REPORT_COUNT
              }
            }
          ]
        }
      }]
    }
  });
  
  mustNot.push({
    "term": {
      [QUERY_FIELDS.REPORTED_BY]: userId
    }
  })
}

const _handleBlockedUsers = (mustNotArray, blockedUsers) => {
  Array.isArray(blockedUsers) && blockedUsers.length && mustNotArray.push({
    "terms": {
      [QUERY_FIELDS.CREATED_BY]: blockedUsers
    }
  })
}

const _handlePublic = (mustArray) => {
  mustArray.push({
    "bool": {
      "should": [{
        "term": {
          [QUERY_FIELDS.PRIVACY]: C.ACCOUNT_TYPE.PUBLIC
        }
      }, {
        "bool": {
          "must_not": [
            {
              "exists": {
                "field": QUERY_FIELDS.PRIVACY
              }
            }
          ]
        }
      }]
    }
  })
}