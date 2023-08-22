const express = require('express');
const router = express.Router();

const trending = require("./trending");
const search = require("./search");
const user = require("./user");
const myFeeds = require("./myFeeds");
const deletePost = require("./delete");
const getById = require("./getById");
const JWT = require("../../middilewares/Jwt");
const pagination = require("../common/pagination");

/**
* API supports:
* 1) Trending feeds
* 2) Category filter
*/

/**
* @swagger
* /feeds/trending:
*   get:
*     tags:
*       - Feeds
*     name: Get Trending feeds
*     summary: Get Trending feeds
*     security:
*       - JWT: []
*     consumes:
*       - application/json
*     parameters:
*       - name: categoryId
*         type: string
*         in: query
*         description: category filter
*       - name: cursor
*         type: string
*         in: headers
*         description: next page cursor
*     responses:
*       200:
*         description: Trending feeds fetched successfully.
*/
router.get("/trending",
new JWT().verifyToken,
trending.validate,
trending.build,
trending.fetchData,
trending.dataWrappers,
trending.buildResponse,
)

/**
* API supports:
* 1) questions from user's friends including the user themself
*/
/**
* @swagger
* /feeds/myFeeds:
*   get:
*     tags:
*       - Feeds
*     name: Get My Feeds
*     summary: Get My Feeds
*     security:
*       - JWT: []
*     consumes:
*       - application/json
*     parameters:
*       - name: page
*         type: string
*         in: query
*         description: number of a page
*       - name: limit
*         type: string
*         in: query
*         description: size of a page
*     responses:
*       200:
*         description: My Feeds feeds fetched successfully.
*/
router.get("/myFeeds",
new JWT().verifyToken,
myFeeds.validate,
pagination.setValues,
myFeeds.fetchFriends,
myFeeds.build,
trending.fetchData,
trending.dataWrappers,
pagination.getMeta,
search.buildResponse,
)

/**
* API supports:
* 1) keyword search
* 2) hashtag question list
*/
/**
* @swagger
* /feeds/search:
*   get:
*     tags:
*       - Feeds
*     name: Search questions or get hastags list
*     summary: Search questions or get hastags list
*     security:
*       - JWT: []
*     consumes:
*       - application/json
*     parameters:
*       - name: keyword
*         type: string
*         in: query
*         description: keyword to search
*       - name: hastags
*         type: string
*         in: query
*         description: hastags to search
*       - name: page
*         type: string
*         in: query
*         description: number of a page
*       - name: limit
*         type: string
*         in: query
*         description: size of a page
*     responses:
*       200:
*         description: Search feeds fetched successfully.
*/
router.get("/search",
new JWT().verifyToken,
search.validate,
pagination.setValues,
search.build,
trending.fetchData,
trending.dataWrappers,
pagination.getMeta,
search.buildResponse,
)

router.post("/id",
new JWT().verifyToken,
getById.validate,
getById.fetch,
getById.buildResponse,
)

/**
* API supports:
* 1) keyword search
* 2) category wise filtering
* 3) user feed
*/
/**
* @swagger
* /feeds/user:
*   get:
*     tags:
*       - Feeds
*     name: Fetch user questions feeds
*     summary: Has category and search filter
*     security:
*       - JWT: []
*     consumes:
*       - application/json
*     parameters:
*       - name: keyword
*         type: string
*         in: query
*         description: keyword to search
*       - name: categoryId
*         type: string
*         in: query
*         description: category filter
*       - name: page
*         type: string
*         in: query
*         description: number of a page
*       - name: limit
*         type: string
*         in: query
*         description: size of a page
*     responses:
*       200:
*         description: Search feeds fetched successfully.
*/
router.get("/user",
new JWT().verifyToken,
user.validate,
pagination.setValues,
user.build,
trending.fetchData,
trending.dataWrappers,
pagination.getMeta,
search.buildResponse,
)

/**
* API supports:
* 1) keyword search
* 2) category wise filtering
* 3) user feed
*/
/**
* @swagger
* /feeds/question:
*   delete:
*     tags:
*       - Feeds
*     name: Delete question/post
*     summary: Delete question/post
*     security:
*       - JWT: []
*     consumes:
*       - application/json
*     parameters:
*       - name: question_id
*         type: string
*         in: query
*         description: question to delete
*       - name: shared_question_id
*         type: string
*         in: query
*         description: shared question to delete
*     responses:
*       200:
*         description: Search feeds fetched successfully.
*/
router.delete("/question",
new JWT().verifyToken,
deletePost.validate,
deletePost.fetch,
deletePost.validateOwnership,
deletePost.delete,
deletePost.buildResponse,
)

module.exports = router;