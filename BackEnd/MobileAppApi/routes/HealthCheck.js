const Express = require("express");
const Router = Express.Router();

Router.get(
    "/mobile/healthcheck",
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