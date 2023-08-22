const { Client } = require("@elastic/elasticsearch");
const client = new Client({
  cloud: {
    id: process.env.CLOUD_ID,
  },
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD,
  },
});

const MAPPING = {
  "mappings": {
    "properties": {
      "business_account_name": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      },
      "created_at": {
        "type": "long"
      },
      "full_name": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      },
      "profile_picture": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      },
      "user_id": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      },
      "user_name": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      }
    }
  },
  "settings": {
    "number_of_shards": "5",
    "number_of_replicas": "2",
  }
}

client.indices.create({
  index: process.env.ELASTIC_USERS_INDEX,
  body: MAPPING
}).then(res => {
  client.indices.getMapping({
    index: process.env.ELASTIC_USERS_INDEX,
  }).then(res => console.log(JSON.stringify(res)));
}).catch(e => console.log(JSON.stringify(e, null, 2)));