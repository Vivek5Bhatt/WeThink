// import routes...
const UserRoute = require('../routes/Users');
const QuestionRoute = require('../routes/Question');
const VerificationRoute = require('../routes/Verification');
const FeedsRoute = require('../routes/feeds');
const HealthCheckRoute = require('../routes/HealthCheck');
const DB = require('../routes/DB');

// =============== Routes Prefix ===============

const ROUTE_PREFIX = '/we-think/v1/api/'

// =============== Export The Function To Main App ===============

module.exports = function (app) {
    app.use(`${ROUTE_PREFIX}user`, UserRoute);
    app.use(`${ROUTE_PREFIX}question`, QuestionRoute);
    app.use(`${ROUTE_PREFIX}verification`, VerificationRoute);
    app.use(`${ROUTE_PREFIX}feeds`, FeedsRoute);
    app.use(`${ROUTE_PREFIX}`, HealthCheckRoute);
    process.env.ENV !== 'production' && app.use(`${ROUTE_PREFIX}DB`, DB);
};