const {ESClient} = require("./connection");

const TYPE_NAME = "_doc";

const CACHE_ADD_TOKEN_SCRIPT_SOURCE = new Map();
const CACHE_REMOVE_TOKEN_SCRIPT_SOURCE = new Map();
/**
* Abstract class with common elasticsearch operations
* Please extend this class for more use case specific operations
* NOTE: Do NOT create instances of this class directly. Please extend this class to serve a context and then use it.
*/
class AbstractElasticsearch {
  constructor(indexName) {
    this.indexName = indexName;
  }

  getIndexName() {
    return this.indexName;
  }

  getCommonErrors(){
    let ERROR_TYPES = {};
    ERROR_TYPES.DOCUMENT_MISSING = 'document_missing_exception'
    return ERROR_TYPES
  }

  /**
  * Indexes given document with given id
  * @param id
  * @param body
  * @param cb
  */
  indexDoc(id, body, cb) {
    if (!id || !body || !cb) {
      throw new Error('Invalid argument(s)');
    }
    const request = _buildRequest(this.indexName, body, id);
    request.refresh = true;
    ESClient.index(request, (err, response) => {
      if (err) {
        console.error({err}, `[Elasticsearch] [${this.indexName}] Failed to index doc id=${id}:`, body);
      }
      return cb(err, response && response.body);
    });
  }

  /**
  * perform bulk operations
  * @param {*} operations array of operations definition
  * @param {*} cb
  */
  bulk(operations, cb) {
    if (!operations || !Array.isArray(operations) || !cb) {
      throw new Error('Invalid argument(s)');
    }
    ESClient.bulk({
      body: operations
    }, (err, response) => {
      if (err) {
        console.error({err}, `[Elasticsearch] [${this.indexName}] Bulk request failed:`, operations);
      }
      return cb(err, response && response.body);
    });
  }

  /**
  * Get a document by id
  * @param {*} id
  * @param {*} cb
  */
  getById(id, options, cb) {
    if (!id || !cb) {
      throw new Error('Invalid argument(s)');
    }
    const request = _buildRequest(this.indexName, null, id);
    if(options && options._source) {
      request._source = options._source;
    }
    ESClient.get(request, (err, response) => {
      if (err) {
        console.error({err}, `[Elasticsearch] [${this.indexName}] Failed to get doc by id ${id}:`);
      }
      return cb(err, response && response.body);
    });
  }

  /**
  * Search by template
  * @param {*} body
  * @param {*} cb
  */
  searchTemplate(body, cb) {
    if (!body || !(body.id || body.source) || !body.params || !cb) {
      throw new Error('Invalid argument(s)');
    }
    ESClient.searchTemplate(_buildRequest(this.indexName, body), (err, response) => {
      if (err) {
        console.error({err}, `[Elasticsearch] [${this.indexName}] Failed to search by template:`, body);
      }
      return cb(err, response && response.body);
    });
  }

  /**
  * Search by query
  * @param {*} body search query body
  * @param {*} cb
  */
  search(body, cb) {
    if (!body || !cb) {
      throw new Error('Invalid argument(s)');
    }
    ESClient.search(_buildRequest(this.indexName, body), (err, response) => {
      if (err) {
        console.error({err}, `[Elasticsearch] [${this.indexName}] Failed to search:`, body);
      }
      return cb(err, response && response.body);
    });
  }

  /**
  * performs multi search in same index
  * @param searchRequests
  * @param cb
  */
  msearch(requestBodies, cb) {
    if (!requestBodies || !cb) {
      throw new Error('Invalid argument(s)');
    }
    let _header = _buildRequest(this.indexName);
    let arr = [];
    requestBodies.forEach((body) => {
      arr.push(_header);
      arr.push(body);
    });
    ESClient.msearch({
      body: arr
    }, (err, response) => {
      if (err) {
        console.error({err}, `[Elasticsearch] [${this.indexName}] Failed to msearch:`, arr);
      }
      return cb(err, response && response.body);
    });
  }

  /**
  * Updates a doc with given id using the script
  * @param {*} id id of doc
  * @param {*} script script containing source to update the doc
  * @param {*} cb
  */
  update(id, script, cb) {
    if (!id || !script || !cb) {
      throw new Error('Invalid argument(s)');
    }
    const requestBody = _buildRequest(this.indexName, {
      "script": script
    }, id);
    requestBody.refresh = true;

    _update(requestBody, (err, response) => {
      if (err) {
        console.error({err: JSON.stringify(err, null, 2)}, `[Elasticsearch] [${this.indexName}] Failed to update (using script) doc ${id}:`, script);
      }
      return cb(err, response && response.body);
    });
  }

  /**
  * updates a doc with given partial doc
  * @param {*} id document id
  * @param {*} partialDoc partial doc object
  * @param {*} cb
  */
  updateWithPartialDoc(id, partialDoc, cb) {
    if (!id || !partialDoc || !cb) {
      throw new Error('Invalid argument(s)');
    }
    const requestBody = _buildRequest(this.indexName, {
      "doc": partialDoc
    }, id);

    _update(requestBody, (err, response) => {
      if (err) {
        console.error({err}, `[Elasticsearch] [${this.indexName}] Failed to update (with partial doc) doc ${id}:`, partialDoc);
      }
      return cb(err, response && response.body);
    });
  }

  /**
  * Updates by query
  * @param {*} query
  * @param {*} script
  * @param {*} cb
  */
  updateByQuery(query, script, cb) {
    if (!query || !script || !cb) {
      throw new Error('Invalid argument(s)');
    }
    const requestBody = _buildRequest(this.indexName, {
      "query": query,
      "script": script,
      "conflicts": "proceed"
    });
    ESClient.updateByQuery(requestBody, (err, response) => {
      if (err) {
        console.error({err: JSON.stringify(err, null, 2)}, `[Elasticsearch] [${this.indexName}] Failed to update by query:`, query, script);
      }
      return cb(err, response && response.body);
    });
  }

  /**
  * Adds a new token to array type field.
  * Note : make sure the field type is array before invoking this function
  * @param id
  * @param fieldName
  * @param token
  * @param cb
  */
  addToken(id, fieldName, token, cb) {
    if (!id || !fieldName || !token || !cb) {
      throw new Error('Invalid argument(s)');
    }

    if(!CACHE_ADD_TOKEN_SCRIPT_SOURCE.has(fieldName)) {
      CACHE_ADD_TOKEN_SCRIPT_SOURCE.set(fieldName, `
      if(ctx._source.${fieldName} == null) {
        List tmp = new ArrayList();
        tmp.add(params.token);
        ctx._source.${fieldName} = tmp;
      } else if(!ctx._source.${fieldName}.contains(params.token)) {
        ctx._source.${fieldName}.add(params.token);
      } else {
        ctx.op = "none";
      }`);
    }

    const requestBody = _buildRequest(this.indexName, {
      "script": {
        "source": CACHE_ADD_TOKEN_SCRIPT_SOURCE.get(fieldName),
        "params": {
          "token": token
        }
      }
    }, id);
    requestBody.refresh = true;

    _update(requestBody, (err, response) => {
      if (err) {
        console.error({err}, `[Elasticsearch] [${this.indexName}] Failed to add token ${token} to field ${fieldName} of doc ${id}:`);
      }
      return cb(err, response && response.body);
    });
  }

  /**
  * Deletes the given token from array type field.
  * Note : make sure the field type is array before invoking this function
  * @param id
  * @param fieldName
  * @param token
  * @param cb
  */
  deleteToken(id, fieldName, token, cb) {
    if (!id || !fieldName || !token || !cb) {
      throw new Error('Invalid argument(s)');
    }

    if(!CACHE_REMOVE_TOKEN_SCRIPT_SOURCE.has(fieldName)) {
      CACHE_REMOVE_TOKEN_SCRIPT_SOURCE.set(fieldName, `
      if (ctx._source.${fieldName} != null && ctx._source.${fieldName}.contains(params.token)) {
        ctx._source.${fieldName}.removeAll(Collections.singleton(params.token))
      } else {
        ctx.op = "none";
      }`);
    }

    const requestBody = _buildRequest(this.indexName, {
      "script": {
        "source": CACHE_REMOVE_TOKEN_SCRIPT_SOURCE.get(fieldName),
        "params": {
          token
        }
      }
    }, id);
    requestBody.refresh = true;

    _update(requestBody, (err, response) => {
      if (err) {
        console.error({err}, `[Elasticsearch] [${this.indexName}] Failed to delete token ${token} from field ${fieldName} of doc ${id}:`);
      }
      return cb(err, response && response.body);
    });
  }

  /**
  * deletes a document from index with given id
  * @param id
  * @param cb
  */
  deleteDoc(id, cb) {
    if (!id || !cb) {
      throw new Error('Invalid argument(s)');
    }
    const request = _buildRequest(this.indexName, null, id);
    request.refresh = true;
    ESClient.delete(request, (err, response) => {
      if (err) {
        console.error({err}, `[Elasticsearch] [${this.indexName}] Failed to delete doc ${id}:`);
      }
      return cb(err, response && response.body);
    });
  }

  /**
  * delete by query
  * @param {*} query
  * @param {*} cb
  */
  deleteByQuery(query, cb) {
    if (!query || !cb) {
      throw new Error('Invalid argument(s)');
    }
    const requestBody = _buildRequest(this.indexName, {
      "query": query,
      "conflicts": "proceed"
    });
    requestBody.refresh = true;
    ESClient.deleteByQuery(requestBody, (err, response) => {
      if (err) {
        console.error({err}, `[Elasticsearch] [${this.indexName}] Failed to delete by query:`, query);
      }
      return cb(err, response && response.body);
    });
  }

  static deleteByQueryWithIndex(index, body, callback){
    if(!index || !body) return callback();
    ESClient.deleteByQuery({
      index: index,
      body: body,
      refresh: true
    }, (error, result) => callback(error, result && result.body));
  }

  /**
  * Search by index and query
  * @param {*} body search query body
  * @param {*} cb
  */
  indexSearch(index, body, cb) {
    if (!body || !cb) {
      throw new Error('Invalid argument(s)');
    }
    ESClient.search(_buildRequest(index, body), (err, response) => {
      if (err) {
        console.error({err}, `[Elasticsearch] [${index}] Failed to search:`, body);
      }
      return cb(err, response && response.body);
    });
  }

  increment(id, fieldName, incrementBy = 1, callback){
    if(!id || !fieldName){
      throw new Error('Invalid argument(s)');
    }
    let script = {
      'inline': `if(ctx._source.${fieldName} == null) {
        ctx._source.${fieldName} = ${incrementBy}
      }else {
        ctx._source.${fieldName}+= ${incrementBy}
      }`
    }
    this.update(id, script, callback);
  }

  /**
  * updates a doc with given partial doc
  * @param {*} id document id
  * @param {*} script script obj for ES update call
  * @param {*} cb
  */
  updateWithPartialDocWithScript(id, script, refreshDb, cb) {
    if (!id || !script || !cb) {
      throw new Error('Invalid argument(s)');
    }
    const requestBody = _buildRequest(this.indexName, {
      "script": script
    }, id);
    requestBody.refresh = refreshDb || false;

    _update(requestBody, (err, response) => {
      if (err) {
        console.error({err}, `[Elasticsearch] [${this.indexName}] Failed to update (with partial doc) doc ${id}:`, script);
      }
      return cb(err, response && response.body);
    });
  }
}

function _update(params, cb) {
  params.retryOnConflict = 10;
  ESClient.update(params, cb);
}

/**
* builds an elasticsearch request json body
* @param indexName
* @param body (optional)
* @param id (optional)
* @returns elasticsearch request body
* @private
*/
function _buildRequest(indexName, body, id) {
  let _request = {
    "index": indexName,
    "type": TYPE_NAME
  };
  if (body) {
    _request.body = body;
  }
  if (id) {
    _request.id = id;
  }
  return _request;
}

module.exports = AbstractElasticsearch;
