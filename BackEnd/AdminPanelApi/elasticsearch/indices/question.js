require('dotenv-safe').config()

const FIELDS = {
  ID: "id",
  CREATED_BY: "createdBy",
  TITLE: "title",
  QUESTION_DATE: "questionDate",
  CREATED_AT: "createdAt",
  IS_DELETED: "isDeleted",
  IS_ACTIVE: "isActive",
  IS_EXPIRED: "isExpired",
  EXPIRY_AT: "expiryAt",
  TYPE: "type",
  DELETED_AT: "deletedAt",
  UPDATED_AT: "updatedAt",
  LIKE_COUNT: "likeCount",
  COMMENT_COUNT: "commentCount",
  SHARE_COUNT: "shareCount",
  VOTE_COUNT: "voteCount",
  HASH_TAGS: "hashTags",
  CATEGORY_ID: "categoryId",
  PARENT_QUESTION_ID: "parentQuestionId",
  SHARED_MESSAGE: "sharedMessage",
  SHARED_BY: "sharedBy",
  SHARED_QUESTION_ID: "sharedQuestionId",
  SHARED_AT: "sharedAt",
  REPORTED_BY: "reportedBy",
  REPORT_COUNT: "reportCount",
  PRIVACY: "privacy"
}

const NESTED_FIELDS = {
  [FIELDS.TITLE]: {
    CRUDE: 'crude',
    SEARCHABLE: 'searchable',
    KEYWORD: 'keyword',
    SUGGESTION: 'suggestion',
  },
  [FIELDS.SHARED_MESSAGE]: {
    CRUDE: 'crude',
    SEARCHABLE: 'searchable',
    KEYWORD: 'keyword',
    SUGGESTION: 'suggestion',
  },
}

const MAPPING = {
  "mappings": {
    "properties": {
      [FIELDS.ID]: {
        "type": "keyword"
      },
      [FIELDS.PARENT_QUESTION_ID]: {
        "type": "keyword"
      },
      [FIELDS.CREATED_BY]: {
        "type": "keyword"
      },
      [FIELDS.TITLE]: {
        "dynamic": "false",
        "properties": {
          [NESTED_FIELDS[FIELDS.TITLE].CRUDE]: {
            "type": "text",
            "index": false,
            "copy_to": [
              `${FIELDS.TITLE}.${NESTED_FIELDS[FIELDS.TITLE].SEARCHABLE}`, `${FIELDS.TITLE}.${NESTED_FIELDS[FIELDS.TITLE].KEYWORD}`, `${FIELDS.TITLE}.${NESTED_FIELDS[FIELDS.TITLE].SUGGESTION}`
            ]
          },
          [NESTED_FIELDS[FIELDS.TITLE].SEARCHABLE]: {
            "type": "text",
            "analyzer": "cus_analyzer",
            "search_analyzer": "cus_analyzer_search"
          },
          [NESTED_FIELDS[FIELDS.TITLE].KEYWORD]: {
            "type": "keyword",
            "normalizer": "case_insensitive_normalizer"
          },
          [NESTED_FIELDS[FIELDS.TITLE].SUGGESTION]: {
            "type": "search_as_you_type"
          }
        }
      },
      [FIELDS.QUESTION_DATE]: {
        "type": "date",
        "format": "epoch_second"
      },
      [FIELDS.CREATED_AT]: {
        "type": "date",
        "format": "epoch_second"
      },
      [FIELDS.DELETED_AT]: {
        "type": "date",
        "format": "epoch_second"
      },
      [FIELDS.UPDATED_AT]: {
        "type": "date",
        "format": "epoch_second"
      },
      [FIELDS.EXPIRY_AT]: {
        "type": "date",
        "format": "epoch_second"
      },
      [FIELDS.IS_DELETED]: {
        "type": "boolean"
      },
      [FIELDS.IS_ACTIVE]: {
        "type": "boolean"
      },
      [FIELDS.IS_EXPIRED]: {
        "type": "boolean"
      },
      [FIELDS.TYPE]: {
        "type": "integer"
      },
      [FIELDS.LIKE_COUNT]: {
        "type": "integer"
      },
      [FIELDS.COMMENT_COUNT]: {
        "type": "integer"
      },
      [FIELDS.SHARE_COUNT]: {
        "type": "integer"
      },
      [FIELDS.VOTE_COUNT]: {
        "type": "integer"
      },
      [FIELDS.HASH_TAGS]: {
        "type": "keyword",
        "normalizer": "case_insensitive_normalizer"
      },
      [FIELDS.CATEGORY_ID]: {
        "type": "keyword",
        "normalizer": "case_insensitive_normalizer"
      },
      [FIELDS.SHARED_MESSAGE]: {
        "dynamic": "false",
        "properties": {
          [NESTED_FIELDS[FIELDS.SHARED_MESSAGE].CRUDE]: {
            "type": "text",
            "index": false,
            "copy_to": [
              `${FIELDS.SHARED_MESSAGE}.${NESTED_FIELDS[FIELDS.SHARED_MESSAGE].SEARCHABLE}`, `${FIELDS.SHARED_MESSAGE}.${NESTED_FIELDS[FIELDS.SHARED_MESSAGE].KEYWORD}`, `${FIELDS.SHARED_MESSAGE}.${NESTED_FIELDS[FIELDS.SHARED_MESSAGE].SUGGESTION}`
            ]
          },
          [NESTED_FIELDS[FIELDS.SHARED_MESSAGE].SEARCHABLE]: {
            "type": "text",
            "analyzer": "cus_analyzer",
            "search_analyzer": "cus_analyzer_search"
          },
          [NESTED_FIELDS[FIELDS.SHARED_MESSAGE].KEYWORD]: {
            "type": "keyword",
            "normalizer": "case_insensitive_normalizer"
          },
          [NESTED_FIELDS[FIELDS.SHARED_MESSAGE].SUGGESTION]: {
            "type": "search_as_you_type"
          }
        },
      },
      [FIELDS.SHARED_BY]: {
        "type": "keyword"
      },
      [FIELDS.SHARED_QUESTION_ID]: {
        "type": "keyword"
      },
      [FIELDS.SHARED_AT]: {
        "type": "date",
        "format": "epoch_second"
      },
      [FIELDS.REPORTED_BY]: {
        "type": "keyword"
      },
      [FIELDS.REPORT_COUNT]: {
        "type": "integer"
      },
      [FIELDS.PRIVACY]: {
        "type": "integer"
      },
    }
  },
  "settings": {
    "number_of_shards": "5",
    "number_of_replicas": process.env.ENV === "production" ? "2" : "1",
    "analysis": {
      "analyzer": {
        "cus_analyzer_search": {
          "tokenizer": "whitespace",
          "filter": ["lowercase"]
        },
        "cus_analyzer": {
          "filter": [
            "lowercase"
          ],
          "tokenizer": "cus_analyzer"
        }
      },
      "tokenizer": {
        "cus_analyzer": {
          "token_chars": [
            "letter",
            "digit"
          ],
          "min_gram": "2",
          "type": "edge_ngram",
          "max_gram": "15"
        }
      },
      "normalizer": {
        "case_insensitive_normalizer": {
          "type": "custom",
          "char_filter": [],
          "filter": "lowercase"
        }
      }
    }
  }
}

module.exports = {
  MAPPING,
  FIELDS,
  NESTED_FIELDS
}