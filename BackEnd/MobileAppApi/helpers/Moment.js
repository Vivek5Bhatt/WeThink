require('dotenv-safe').config()
const Moment = require('moment')

const getStartOfDay = () => Number(Moment().utc().startOf('day'))

const getPreviousYearDate = (difference = 1) => {
    return Number(Moment().subtract(difference, 'year').utc().startOf('day'))
}

const getFutureDate = (difference = process.env.DELETE_INTERVAL) => {
    return Number(Moment().add(difference, 'day').utc().startOf('day'))
}

module.exports = {
    getStartOfDay,
    getPreviousYearDate,
    getFutureDate
}