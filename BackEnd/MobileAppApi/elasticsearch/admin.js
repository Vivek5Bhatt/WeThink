const { ESClient } = require("./connection");

// NOTE: do NOT add this to index.js. Admin module is supposed to be used internally for admin operations.
let _admin = {};

/**
* Creates an index with given name.
* NOTE: mappings and settings are automatically applied from matching template (if any)
* @param indexName
*/
// _admin.createIndex = (indexName, cb) => ESClient.indices.create({index: indexName}, cb);
_admin.createIndex = (indexName, mapping, cb) => _createNewIndex(indexName, mapping, cb);

_admin.ping = (callback) => {
  ESClient.ping({
  }, function (error) {
    if (error)
      console.trace('elasticsearch cluster is down!', error);
    callback();
  });
}

_admin.addField = (indexName, field, type, options = {}, callback) => {
  ESClient.indices.putMapping({
    index: indexName,
    body: {
      "properties": {
        [field]: {
          "type": type,
          "format": options.format || undefined
        }
      }
    }
  }).then(result => {
    callback();
  }).catch(e => {
    console.trace('elasticsearch cluster is down!', e);
    callback();
  });
}

_admin.addCustomField = (indexName, properties, options = {}, callback) => {
  ESClient.indices.putMapping({
    index: indexName,
    body: {
      "properties": properties
    }
  }).then(result => {
    callback();
  }).catch(e => {
    console.trace('elasticsearch cluster is down!', e);
    callback();
  });
}

_admin.getMapping = (indexName, callback) => {
  ESClient.indices.getMapping({
    index: indexName
  }).then(result => {
    callback();
  }).catch(e => {
    console.trace('elasticsearch cluster is down!', e);
    callback();
  });
}

_admin.getCluster = (callback) => {
  ESClient.cluster.getSettings({
  }).then(result => {
    callback();
  }).catch(e => {
    console.trace('elasticsearch cluster is down!', e);
    callback();
  });
}

_admin.setClusterMaxCompilationsRate = (callback) => {
  ESClient.cluster.putSettings({
    "body": {
      "persistent": {
        "script.max_compilations_rate": "1000/1m"
      }
    }
  }).then(result => {
    callback();
  }).catch(e => {
    console.trace('elasticsearch cluster is down!', e);
    callback();
  });
}

_admin.deleteIndex = (indexName, callback) => {
  ESClient.indices.delete({
    index: indexName
  }).then(result => {
    callback();
  }).catch(e => {
    console.trace('elasticsearch cluster is down!', e);
    callback();
  });
}

_admin.catIndices = (callback) => {
  ESClient.indices.stats({
    index: "_all",
    level: "indices"
  }, function (err, res) {
    err && console.trace('elasticsearch cluster is down!', err);
    callback();
  });
}

module.exports = _admin;

const _createNewIndex = (indexName, mapping, callback) => {
  ESClient.indices.create({
    index: indexName,
    body: mapping
  }, (err, resp, status) => {
    if (err) {
      console.error(err, status);
    }
    else {
      console.log('Successfully Created Index', status, resp);
    }
    callback(err, resp)
  });
}
