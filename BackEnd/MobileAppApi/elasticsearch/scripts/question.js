const {FIELDS: QUESTION_FIELDS} = require("../indices/question");
const moment = require('moment');

const script = {};

script.incrementLikeCount = (incrementBy) => {
  return {
    inline: `if(ctx._source.${QUESTION_FIELDS.LIKE_COUNT} == null){
      ctx._source.${QUESTION_FIELDS.LIKE_COUNT} = ${incrementBy};
      ctx._source.${QUESTION_FIELDS.UPDATED_AT} = ${moment().unix()};
    }else{
      ctx._source.${QUESTION_FIELDS.LIKE_COUNT} += ${incrementBy};
      ctx._source.${QUESTION_FIELDS.UPDATED_AT} = ${moment().unix()};
    }`
  }
}

script.decrementLikeCount = (decrementBy) => {
  return {
    inline: `if(ctx._source.${QUESTION_FIELDS.LIKE_COUNT} >= ${decrementBy}){
      ctx._source.${QUESTION_FIELDS.LIKE_COUNT} -= ${decrementBy};
    }else{
      ctx._source.${QUESTION_FIELDS.LIKE_COUNT} = 0;
    }`
  }
}

script.incrementCommentCount = (incrementBy) => {
  return {
    inline: `if(ctx._source.${QUESTION_FIELDS.COMMENT_COUNT} == null){
      ctx._source.${QUESTION_FIELDS.COMMENT_COUNT} = ${incrementBy};
      ctx._source.${QUESTION_FIELDS.UPDATED_AT} = ${moment().unix()};
    }else{
      ctx._source.${QUESTION_FIELDS.COMMENT_COUNT} += ${incrementBy};
      ctx._source.${QUESTION_FIELDS.UPDATED_AT} = ${moment().unix()};
    }`
  }
}

script.decrementCommentCount = (decrementBy) => {
  return {
    inline: `if(ctx._source.${QUESTION_FIELDS.COMMENT_COUNT} >= ${decrementBy}){
      ctx._source.${QUESTION_FIELDS.COMMENT_COUNT} -= ${decrementBy};
    }else{
      ctx._source.${QUESTION_FIELDS.COMMENT_COUNT} = 0;
    }`
  }
}

script.incrementShareCount = (incrementBy) => {
  return {
    inline: `if(ctx._source.${QUESTION_FIELDS.SHARE_COUNT} == null){
      ctx._source.${QUESTION_FIELDS.SHARE_COUNT} = ${incrementBy};
      ctx._source.${QUESTION_FIELDS.UPDATED_AT} = ${moment().unix()};
    }else{
      ctx._source.${QUESTION_FIELDS.SHARE_COUNT} += ${incrementBy};
      ctx._source.${QUESTION_FIELDS.UPDATED_AT} = ${moment().unix()};
    }`
  }
}

script.decrementShareCount = (decrementBy) => {
  return {
    inline: `if(ctx._source.${QUESTION_FIELDS.SHARE_COUNT} >= ${decrementBy}){
      ctx._source.${QUESTION_FIELDS.SHARE_COUNT} -= ${decrementBy};
    }else{
      ctx._source.${QUESTION_FIELDS.SHARE_COUNT} = 0;
    }`
  }
}

script.incrementVoteCount = (incrementBy) => {
  return {
    inline: `if(ctx._source.${QUESTION_FIELDS.VOTE_COUNT} == null){
      ctx._source.${QUESTION_FIELDS.VOTE_COUNT} = ${incrementBy};
      ctx._source.${QUESTION_FIELDS.UPDATED_AT} = ${moment().unix()};
    }else{
      ctx._source.${QUESTION_FIELDS.VOTE_COUNT} += ${incrementBy};
      ctx._source.${QUESTION_FIELDS.UPDATED_AT} = ${moment().unix()};
    }`
  }
}

script.decrementVoteCount = (decrementBy) => {
  return {
    inline: `if(ctx._source.${QUESTION_FIELDS.VOTE_COUNT} >= ${decrementBy}){
      ctx._source.${QUESTION_FIELDS.VOTE_COUNT} -= ${decrementBy};
    }else{
      ctx._source.${QUESTION_FIELDS.VOTE_COUNT} = 0;
    }`
  }
}

script.report = (userId) => {
  return {
    inline: `if(ctx._source.${QUESTION_FIELDS.REPORT_COUNT} == null){
      ctx._source.${QUESTION_FIELDS.REPORT_COUNT} = 1;
      ctx._source.${QUESTION_FIELDS.UPDATED_AT} = ${moment().unix()};
    }else{
      ctx._source.${QUESTION_FIELDS.REPORT_COUNT} += 1;
      ctx._source.${QUESTION_FIELDS.UPDATED_AT} = ${moment().unix()};
    }
    if(ctx._source.${QUESTION_FIELDS.REPORTED_BY} == null) {
      List tmp = new ArrayList();
      tmp.add("${userId}");
      ctx._source.${QUESTION_FIELDS.REPORTED_BY} = tmp;
    } else if(!ctx._source.${QUESTION_FIELDS.REPORTED_BY}.contains("${userId}")){
      ctx._source.${QUESTION_FIELDS.REPORTED_BY}.add("${userId}");
    } else {
      ctx.op = "none";
    }`
  }
}

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

script.updateDelete = () => {
  return {
    inline: `
    ctx._source.${QUESTION_FIELDS.IS_DELETED} = true;
    ctx._source.${QUESTION_FIELDS.IS_ACTIVE} = false;
    ctx._source.${QUESTION_FIELDS.UPDATED_AT} = ${moment().unix()};
    `
  }
}

script.updatePrivacy = (privacy) => {
  return {
    inline: `
    ctx._source.${QUESTION_FIELDS.PRIVACY} = ${privacy};
    ctx._source.${QUESTION_FIELDS.UPDATED_AT} = ${moment().unix()};
    `
  }
}

script.expire = () => {
  return {
    inline: `
    ctx._source.${QUESTION_FIELDS.IS_EXPIRED} = true;
    ctx._source.${QUESTION_FIELDS.EXPIRY_AT} = ${moment().unix()};
    ctx._source.${QUESTION_FIELDS.UPDATED_AT} = ${moment().unix()};
    `
  }
}

module.exports = script;