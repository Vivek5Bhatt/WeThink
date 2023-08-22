require("dotenv-safe").config();

module.exports = {
  creatAndMigrate: () => {
    const indexName = process.env.ENV === "local" ? 'pre-dev-wt-feeds' : 'wt-feeds';
    require("./admin").createIndex(indexName, require("./indices/question").MAPPING, (error, result) => {
      if (!error) {
        require("./esQuestions")(() => {
          require("./esQuestionsShared")(() => { })
        })
      }
    })
  }
}