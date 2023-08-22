//import node-modules..
const Express = require("express");
const Router = Express.Router();
const QuestionController = require('../components/Question/QuestionController')
const { HTTP_CODES, SUCCESS_MESSAGES } = require('../utils/Constants')
const Multer = require('../middilewares/Multer')
const ResponseHandler = require('../helpers/Response');
const JWT = require("../middilewares/Jwt");
const Logger = require("../helpers/Logger");
//import other modoules..



/**
 * @swagger
 * /admin/questions/state/count:
 *   get:
 *     tags:
 *       - Admin
 *     name: Get state and County count
 *     summary: Get state and County count
 *     security:
 *       - JWT: []
 *     consumes:
 *       - application/json
 * 
 *     responses:
 *       200:
 *         description: Request success.
 */
Router.get(
    "/state/count",
    [new JWT().verifyToken],
    async (req, res, next) => {
        try {
            const data = await new QuestionController().getCountyStateCountController()
            return ResponseHandler(res, HTTP_CODES.OK, SUCCESS_MESSAGES.GET_SUCCESS, data && data.length ? data[0] : { county_count: 0, state_count: 0 })
        }
        catch (e) {
            next(e)
        }

    }
);





module.exports = Router;
