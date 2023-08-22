const Moment = require('moment')

const getStartOfDay = () => Number(Moment().utc().startOf('day'))

module.exports = {
    getStartOfDay
}