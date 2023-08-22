'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('CREATE INDEX first_name_trgm_gin ON users USING GIN(first_name gin_trgm_ops);').then(() => {
      return queryInterface.sequelize.query('CREATE INDEX last_name_trgm_gin ON users USING GIN(last_name gin_trgm_ops);')
    }).then(() => {
      return queryInterface.sequelize.query('CREATE INDEX title_name_trgm_gin ON questions USING GIN(question_title gin_trgm_ops);')
    })
  }
};