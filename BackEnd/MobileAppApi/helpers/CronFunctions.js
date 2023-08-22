const UserRepository = require('../components/User/UserRepository')
const Schedule = require('node-schedule');

// To run cron every 2 min
Schedule.scheduleJob('*/2 * * * *', async () => {
    try {
        new UserRepository().expireOldQuestions()
        new UserRepository().deleteDeletedAccounts();
    } catch (err) {
        console.error("Schedule job error: ", err)
    }
})
// To run cron every 30 min
Schedule.scheduleJob('*/2 * * * *', async () => {
    try {
        new UserRepository().expireTrendingQuestions();
    } catch (err) {
        console.error("Schedule job error: ", err)
    }
})