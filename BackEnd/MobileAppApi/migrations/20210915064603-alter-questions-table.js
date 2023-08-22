"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize
      .query(
        `ALTER TABLE questions ADD COLUMN question_uuid UUID`
      ).then(() => {
        return queryInterface.sequelize.query(
          `CREATE INDEX question_uuid_index ON questions (question_uuid);`
        );
      })
  },
};
