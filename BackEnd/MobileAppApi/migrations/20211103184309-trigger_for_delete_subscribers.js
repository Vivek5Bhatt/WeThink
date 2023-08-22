'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(`CREATE OR REPLACE FUNCTION delete_subscribers()
    RETURNS TRIGGER 
    LANGUAGE PLPGSQL
    AS
    $$
    begin
    DELETE from user_subscribers WHERE (subscribed_by = NEW.reported_by AND subscribed_to = NEW.reported_to) OR (subscribed_by = NEW.reported_to AND subscribed_to = NEW.reported_by);
    RETURN NEW;
    END;
    $$;`).then(() => {
      return queryInterface.sequelize.query(`CREATE TRIGGER delete_user_subscribers
    after INSERT  ON "reported_users" 
    FOR EACH ROW
    EXECUTE PROCEDURE delete_subscribers();`)
    }).then(() => {
      return queryInterface.sequelize.query(`CREATE OR REPLACE FUNCTION check_user_report_threshold()
    RETURNS TRIGGER 
    LANGUAGE PLPGSQL
    AS
    $$
    begin
    SELECT COUNT(id) as reported_count from reported_users
    where created_at <= TG_ARGV[1] and created_at >= TG_ARGV[2] and reported_to = TG_ARGV3;
    case
     when (reported_count > TG_ARGV[0])
      then 
        UPDATE users SET is_active = false where user_id = userId;
    END case;
    RETURN NEW;
    END;
    $$;`)
    });
  }
};