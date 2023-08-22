// import routes...
const AdminRoute = require('./Admin');
const QuestionRoute = require('./Question')
const ReportRoute = require('./Report')
const HealthCheckRoute = require('../routes/HealthCheck');

// routes prefix..
const ROUTE_PREFIX = '/we-think-admin/v1/api/'

//export the function to main app..
module.exports = function (app) {
    app.use(`${ROUTE_PREFIX}admin`, AdminRoute);
    app.use(`${ROUTE_PREFIX}admin/questions/`, QuestionRoute);
    app.use(`${ROUTE_PREFIX}admin/report/`, ReportRoute);
    app.use(`${ROUTE_PREFIX}`, HealthCheckRoute);
};