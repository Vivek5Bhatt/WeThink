'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("question_expiration",
      {
        question_expiration_id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        question_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        expiry_time: {
          type: Sequelize.BIGINT,
          allowNull: false
        }
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "question_expiration" ADD constraint fk_question_expiration_id FOREIGN KEY (question_id) REFERENCES "questions" (question_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_expiry_question_id ON question_expiration(question_id)');
      })
  }
};
