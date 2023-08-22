'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`CREATE OR REPLACE FUNCTION update_avg_star_rating()
    RETURNS TRIGGER 
    LANGUAGE PLPGSQL
    AS
    $$
    declare
  question_type INTEGER;
    begin
  SELECT questions.question_type into question_type from user_answers
    inner join questions 
    on
    user_answers.question_id = questions.question_id 
    where questions.question_id = new.question_id limit 1;
    case
     when (question_type = 2)
      then 
      UPDATE questions SET average_rating = (select AVG(option_number) from question_options 
        inner join questions 
        on question_options.question_id = questions.question_id
        inner join user_answers 
        on user_answers.answer_id = question_options.question_option_id
        where questions.question_type = 2 
        and questions.question_id = new.question_id) WHERE questions.question_id = NEW.question_id;
      else
        question_type = question_type; 
    END case;
    RETURN NEW;
    END;
    $$;`).then(() => {
      return queryInterface.sequelize.query(`CREATE TRIGGER update_question_rating
    after INSERT  ON "user_answers" 
    FOR EACH ROW
    EXECUTE PROCEDURE update_avg_star_rating();`)
    })
  }
};