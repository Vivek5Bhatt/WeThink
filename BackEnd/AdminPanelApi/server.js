const Express = require('express');
const App = Express()
const Cors = require("cors");
const BodyParser = require('body-parser')
const Helmet = require('helmet')
const SwaggerJsDocs = require("swagger-jsdoc")
const swagger = require("swagger-ui-express");
const Http = require('http')
const ErrorHandler = require('./helpers/ErrorHandler')
require("dotenv-safe").config();
const DbConnection = require('./config/connection')
const Logger = require('./helpers/Logger')
const fs = require('fs')

App.use(
    BodyParser.urlencoded({
        extended: false
    })
);

App.use(BodyParser.json());

let allowedOrigins = ["*"];

switch (process.env.ENV) {
    case 'development':
        allowedOrigins = ["https://dev.cloud.getwethink.com", "http://localhost:4200"];
        break;
    case 'production':
        allowedOrigins = ["https://api.cloud.getwethink.com", "https://api.getwethink.com", "https://cloud.console.getwethink.com"];
        break;
}

App.use(
    Cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                let msg = "Not Allowed By CORS";
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
        exposedHeaders: ["Content-Type", "Authorization"],
    })
);

App.use(Helmet())

App.use(Cors())

require('./routes')(App);

process.on('unhandledRejection', (reason, p) => {
    throw reason;
});

process.on('uncaughtException', (error) => {
    Logger.error(error);
    process.exit(1);
});

const SwaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "We think Application API",
            description: "We think Application API description",
            servers: ["http://localhost:3000", "https://dev.cloud.getwethink.com", "https://api.cloud.getwethink.com"],
        },
        basePath: "/we-think-admin/v1/api/",
        securityDefinitions: {
            JWT: { type: "apiKey", in: "header", name: "Authorization" },
        },
    },
    apis: ["./routes/*.js"],
};

const specs = SwaggerJsDocs(SwaggerOptions);

App.use("/we-think-admin/v1/api-docs", swagger.serve, swagger.setup(specs));

DbConnection.authenticate()
    .then(() => {
        console.log("DB connected successfully.");
    })
    .catch((error) => {
        Logger.error(error);
    });

// Error handling middleware, we delegate the handling to the centralized error handler
App.use(async (err, req, res, next) => {
    new ErrorHandler().unHandeledCustomError(res, err)
});

fs.writeFile('./error.log', '', { flag: 'wx' }, function (err) {
    if (err) {
        Logger.error(err)
    }
});

const Server = Http.createServer(App);

Server.listen(process.env.PORT, (err) => {
    if (err) {
        Logger.error(err);
    } else {
        console.log("Server running at:" + process.env.PORT);
        require("./elasticsearch/admin").ping(() => {})
    }
});

