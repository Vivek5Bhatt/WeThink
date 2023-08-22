const helper = {};

helper.pickHashtags = (text) => {
  if(typeof text !== 'string' || !text.length) return;
  
  const regexp = /\B\#\w\w+\b/g
  result = text.match(regexp);
  
  if(!result) return;
  result = result.map(el => el.replace("#", ""));
  return result;
}

module.exports = helper;