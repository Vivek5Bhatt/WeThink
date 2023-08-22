const Express = require("express");
const Router = Express.Router();
const { HTTP_CODES, SUCCESS_MESSAGES } = require("../utils/Constants");
const ResponseHandler = require("../helpers/Response");

Router.get(
    "/admin/healthcheck",
    [],
    async (req, res) => {
        try {
            res.send({
                status: 200
            });
        } catch (e) {
            res.send({
                status: 400
            });
        }
    }
);

module.exports = Router;