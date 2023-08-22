///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
* Recency: very high
* Interaction: moderate
*/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const {question: questionES} = require("../../../elasticsearch");

const models = {};

models.IS_ACTIVE = true;

models.fetch = async(userId, options = {}) => {
  let {tag} = options;
  let searchResult = await questionES.trendingModelA(userId, options);
  searchResult = (searchResult && searchResult.hits.hits) || [];
  return searchResult.map(_obj => {
    _obj._source.tag = tag;
    return _obj._source
  });
}

module.exports = models;