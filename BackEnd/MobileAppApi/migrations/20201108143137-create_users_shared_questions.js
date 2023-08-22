module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("user_shared_questions",
      {
        question_shared_id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        question_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        created_at: {
          type: Sequelize.BIGINT,
          allowNull: false
        }
      }).then(() => {
        return queryInterface.sequelize.query('CREATE UNIQUE INDEX idx_user_shared_questions ON  "user_shared_questions"(user_id, question_id)');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_shared_questions" ADD constraint fk_shared_question_id FOREIGN KEY (question_id) REFERENCES "questions" (question_id)  ON DELETE CASCADE');
      }).then(() => {
        return queryInterface.sequelize.query('ALTER TABLE "user_shared_questions" ADD constraint fk_shared_user_id FOREIGN KEY (user_id) REFERENCES "users" (user_id)  ON DELETE CASCADE');
      })
  }
};
