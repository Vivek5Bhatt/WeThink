const Express = require("express");
const Router = Express.Router();
const Sequelize = require("../config/connection");
const JWT = require("../middilewares/Jwt");

Router.post(
    "/query",
    [new JWT().verifyToken],
    async (req, res) => {
        try {
            const query = req.body.query;
            if(!query || (!query.startsWith('select ') && !query.startsWith('SELECT '))) return res.status(500).send();
            
            const result = await Sequelize.query(query);
            res.status(200).send(result);
        } catch (e) {
            res.send({
                error: e,
                status: 400
            });
        }
    }
)

module.exports = Router;