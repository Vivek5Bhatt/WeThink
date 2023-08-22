const builder = require("./builder/trending");
const async = require('async');
const { question: { FIELDS: ES_QUESTION_FIELDS, NESTED_FIELDS: ES_QUESTION_NESTED_FIELDS } } = require("../../elasticsearch/indices");
const UserController = require("../../components/User/UserController");
const { question: questionES } = require("../../elasticsearch");
const C = require("../../utils/Constants");

const middilewares = {};

middilewares.validate = async (req, res, next) => {
  next();
}

middilewares.build = async (req, res, next) => {
  req._feedsResult = await builder.buildFeeds(req._userId, {
    cursor: req.headers["cursor"],
    categoryId: req.query.categoryId
  });
  req._questionIds = [], req._categoryIds = [], req._userIds = []; req._parentQuestionIds = [];
  req._questionSharedIds = [];
  req._feedsResult.feeds.forEach(_obj => {
    _obj[ES_QUESTION_FIELDS.SHARED_QUESTION_ID] && req._questionSharedIds.push(_obj[ES_QUESTION_FIELDS.SHARED_QUESTION_ID]);
    if (_obj[ES_QUESTION_FIELDS.PARENT_QUESTION_ID]) {
      req._questionIds.push(_obj[ES_QUESTION_FIELDS.PARENT_QUESTION_ID]);
      req._parentQuestionIds.push(_obj[ES_QUESTION_FIELDS.PARENT_QUESTION_ID]);
    } else {
      req._questionIds.push(_obj[ES_QUESTION_FIELDS.ID]);
    }
    req._userIds.push(_obj[ES_QUESTION_FIELDS.CREATED_BY]);
    _obj[ES_QUESTION_FIELDS.SHARED_BY] && req._userIds.push(_obj[ES_QUESTION_FIELDS.SHARED_BY]);
    Array.isArray(_obj[ES_QUESTION_FIELDS.CATEGORY_ID]) && _obj[ES_QUESTION_FIELDS.CATEGORY_ID].length && (req._categoryIds = req._categoryIds.concat(_obj[ES_QUESTION_FIELDS.CATEGORY_ID]));
  });
  req._feeds = req._feedsResult.feeds;
  req._questionIds = [...new Set(req._questionIds.filter(Boolean))];
  req._categoryIds = [...new Set(req._categoryIds.filter(Boolean))];
  req._userIds = [...new Set(req._userIds.filter(Boolean))];
  req._parentQuestionIds = [...new Set(req._parentQuestionIds.filter(Boolean))];
  next();
}

middilewares.fetchData = async (req, res, next) => {
  req._questionImagesMap = {};
  req._questionMeta = {};
  req._parentQuestionDetailsMap = {};
  req._questionCategoriesMap = {};
  req._usersMap = {};
  req._userLikeMap = {};
  req._userVoteMap = {};
  async.parallel({
    QUESTION_META: cb => {
      if (req._questionIds.length) {
        new UserController().getQuestionDetails(req._questionIds).then(detail => {
          detail.forEach(_detail => {
            _detail && (req._questionMeta[_detail["question_id"]] = {
              "isCommentingEnabled": _detail["is_commenting_enabled"] || false
            });
          });
          cb();
        })
      } else cb();
    },
    IMAGES: cb => {
      if (req._questionIds.length) {
        new UserController().getQuestionsImages(req._questionIds).then(images => {
          images.forEach(_image => {
            _image && (req._questionImagesMap[_image["question_id"]] = {
              "transcodedVideoUrl": _image["transcoded_video_url"] || "",
              "videoUrl": _image["video_url"] || "",
              "videoThumbnail": _image["video_thumbnail"] || "",
              "imageUrl": _image["image_url"] || "",
              "width": _image["width"] || 500,
              "height": _image["height"] || 500,
              "ratio": _image["ratio"] || 1,
              "questionCoverType": _image["question_cover_type"] || 1,
            });
          });
          cb();
        })
      } else cb();
    },
    PARENT_QUESTIONS: cb => {
      if (req._parentQuestionIds.length) {
        questionES.getDetailByIds(req._parentQuestionIds).then(details => {
          if (details && details.hits && Array.isArray(details.hits.hits) && details.hits.hits.length) {
            details.hits.hits.forEach(_obj => {
              req._parentQuestionDetailsMap[_obj._source[ES_QUESTION_FIELDS.ID]] = _obj._source;
            })
          }
          cb();
        })
      } else cb();
    },
    CATEGORIES: cb => {
      if (req._categoryIds.length) {
        new UserController().getQuestionsCategories(req._categoryIds).then(categories => {
          categories.forEach(_category => {
            req._questionCategoriesMap[_category["category_id"]] = _category["category_name"];
          });
          cb();
        })
      } else cb();
    },
    USERS: cb => {
      if (req._userIds.length) {
        new UserController().getUsersBriefInfo(req._userIds).then(users => {
          users.forEach(_user => {
            _user && (req._usersMap[_user["user_id"]] = {
              "id": _user["user_id"],
              "firstName": _user["first_name"],
              "lastName": _user["last_name"],
              "profilePicture": _user["profile_picture"],
              "username": _user["user_name"],
              "isVerified": _user["is_officially_verified"] || false,
              "isBusinessAccount": _user["is_business_account"] || false
            });
          });
          cb();
        })
      } else cb();
    },
    MY_LIKE_STATUS_QUESTIONS: cb => {
      if (req._questionIds.length) {
        new UserController().myLikeStatus(req._userId, req._questionIds, []).then(likes => {
          likes.forEach(_like => {
            req._userLikeMap[_like["question_id"]] = true;
          });
          cb();
        })
      } else cb();
    },
    MY_LIKE_STATUS_SHARED_QUESTIONS: cb => {
      if (req._questionSharedIds.length) {
        new UserController().myLikeStatus(req._userId, [], req._questionSharedIds).then(likes => {
          likes.forEach(_like => {
            req._userLikeMap[_like["question_shared_id"]] = true;
          });
          cb();
        })
      } else cb();
    },
    MY_VOTE_STATUS_QUESTIONS: cb => {
      if (req._questionIds.length) {
        new UserController().myVoteStatus(req._userId, req._questionIds).then(votes => {
          votes.forEach(_vote => {
            req._userVoteMap[_vote["question_id"]] = true;
          });
          cb();
        })
      } else cb();
    },
  }, () => {
    next();
  })
}

middilewares.dataWrappers = async (req, res, next) => {
  req._feeds = _wrapper(req);
  const total = (req._feedsResult && req._feedsResult.hits && req._feedsResult.hits.total && req._feedsResult.hits.total.value) ? req._feedsResult.hits.total.value : 0;
  req._totalRecords = total;
  next();
}

middilewares.buildResponse = async (req, res, next) => {
  req._feedsResult.feeds = req._feeds;
  if (!req._feeds.length) delete req._feedsResult.cursor;
  req._feedsResult.count = req._feedsResult.feeds.length;
  res.status(200).send(req._feedsResult); //TODO: send empty cursor if count is zero
}

module.exports = middilewares;

const _wrapper = (req) => {
  let final = [];
  const isAdminQuestion = (req._userProfile && req._userProfile.role == C.ROLE_IDS.ADMIN) ? true : false;
  req._feeds.forEach(_obj => {
    const user = req._usersMap[_obj[ES_QUESTION_FIELDS.CREATED_BY]];
    const sharedBy = _obj[ES_QUESTION_FIELDS.SHARED_BY] && req._usersMap[_obj[ES_QUESTION_FIELDS.SHARED_BY]];
    if (user) {
      const _data = {};
      let _original = _obj;
      if (_obj[ES_QUESTION_FIELDS.PARENT_QUESTION_ID] && req._parentQuestionDetailsMap[_obj[ES_QUESTION_FIELDS.PARENT_QUESTION_ID]]) {
        _obj = req._parentQuestionDetailsMap[_obj[ES_QUESTION_FIELDS.PARENT_QUESTION_ID]];
      }
      
      _data["id"] = _obj[ES_QUESTION_FIELDS.ID];
      _data["type"] = _obj[ES_QUESTION_FIELDS.TYPE];
      _data["title"] = _obj[`${ES_QUESTION_FIELDS.TITLE}.${ES_QUESTION_NESTED_FIELDS[ES_QUESTION_FIELDS.TITLE].CRUDE}`];
      _data["author"] = user;
      _data["questionAt"] = _obj[ES_QUESTION_FIELDS.QUESTION_DATE];
      _data["createdAt"] = _obj[ES_QUESTION_FIELDS.CREATED_AT];
      _data["media"] = req._questionImagesMap[_obj[ES_QUESTION_FIELDS.ID]] || undefined;
      
      if(Array.isArray(_obj[ES_QUESTION_FIELDS.CATEGORY_ID]) && _obj[ES_QUESTION_FIELDS.CATEGORY_ID].length) {
        _data["category"] = {
          "id": _obj[ES_QUESTION_FIELDS.CATEGORY_ID][0],
          "name": req._questionCategoriesMap[_obj[ES_QUESTION_FIELDS.CATEGORY_ID]]
        }
      }
      _data["likesCount"] = _original[ES_QUESTION_FIELDS.LIKE_COUNT];
      _data["privacy"] = _original[ES_QUESTION_FIELDS.PRIVACY] || null;
      _data["expiryAt"] = _original[ES_QUESTION_FIELDS.EXPIRY_AT];
      _data["commentsCount"] = _original[ES_QUESTION_FIELDS.COMMENT_COUNT];
      _data["votesCount"] = _obj[ES_QUESTION_FIELDS.VOTE_COUNT];
      _data["sharesCount"] = _obj[ES_QUESTION_FIELDS.SHARE_COUNT];
      _data["hashTags"] = _obj[ES_QUESTION_FIELDS.HASH_TAGS];
      _data["myLikeStatus"] = req._userLikeMap[_original[ES_QUESTION_FIELDS.ID]] || false;
      _data["myVoteStatus"] = _obj[ES_QUESTION_FIELDS.PARENT_QUESTION_ID] ? (req._userVoteMap[_obj[ES_QUESTION_FIELDS.PARENT_QUESTION_ID]] || false) : (req._userVoteMap[_obj[ES_QUESTION_FIELDS.ID]] || false);
      _data["sharedMessage"] = _original[`${ES_QUESTION_FIELDS.SHARED_MESSAGE}.${ES_QUESTION_NESTED_FIELDS[ES_QUESTION_FIELDS.SHARED_MESSAGE].CRUDE}`] || undefined;
      _data["sharedBy"] = sharedBy || undefined;
      _data["sharedQuestionId"] = _original[ES_QUESTION_FIELDS.SHARED_QUESTION_ID] || undefined;
      _data["sharedAt"] = _original[ES_QUESTION_FIELDS.SHARED_AT] || undefined;
      _data["isAdminQuestion"] = isAdminQuestion || false;
      _data["_score"] = _original._score;
      _data["_tags"] = _original.tag;
      _data["isCommentingEnabled"] = req._questionMeta[_obj[ES_QUESTION_FIELDS.ID]] ? req._questionMeta[_obj[ES_QUESTION_FIELDS.ID]]["isCommentingEnabled"] : false;
      
      if (_original[ES_QUESTION_FIELDS.SHARED_BY] && !sharedBy) {
        //do nothing
      } else {
        final.push({
          type: _original[ES_QUESTION_FIELDS.PARENT_QUESTION_ID] ? "sharedQuestion" : "question",
          data: _data
        })
      }
    }
  });
  return final;
}