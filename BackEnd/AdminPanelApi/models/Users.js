const Sequelize = require("sequelize");
const sequelize = require("../config/connection");

// export the model
const Users = sequelize.define(
  "users",
  {
    user_id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    },
    first_name: {
      type: Sequelize.STRING(50)
    },
    last_name: {
      type: Sequelize.STRING(50)
    },
    password: {
      type: Sequelize.STRING
    },
    phone_number: {
      type: Sequelize.STRING(30),
      unique: true
    },
    country_code: {
      type: Sequelize.STRING(5)
    },
    temp_email: {
      type: Sequelize.STRING,
    },
    profile_picture: {
      type: Sequelize.STRING,
    },
    is_email_verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    is_phone_verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    email_verification_token: {
      type: Sequelize.TEXT,
    },
    is_active: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    notifications_enabled: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    otp: {
      type: Sequelize.INTEGER,
      unique: true,
      allowNull: true
    },
    date_of_birth: {
      type: Sequelize.DATEONLY
    },
    county: {
      type: Sequelize.STRING(70)
    },
    state: {
      type: Sequelize.STRING(70)
    },
    city: {
      type: Sequelize.STRING(100)
    },
    otp_expiry_time: {
      type: Sequelize.BIGINT,
    },
    apple_id: {
      type: Sequelize.STRING,
    },
    google_id: {
      type: Sequelize.STRING
    },
    temp_phone_number: {
      type: Sequelize.STRING(30)
    },
    temp_otp_expiry_time: {
      type: Sequelize.BIGINT,
    },
    temp_otp: {
      type: Sequelize.INTEGER,
      unique: true,
      allowNull: true
    },
    user_name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: true
    },
    gender: {
      type: Sequelize.STRING(15)
    },
    account_type: {
      type: Sequelize.INTEGER
    },
    bio: {
      type: Sequelize.TEXT
    },
    website: {
      type: Sequelize.STRING
    },
    role: {
      type: Sequelize.JSONB,
      allowNull: false
    },
    created_at: {
      type: Sequelize.BIGINT,
    },
    updated_at: {
      type: Sequelize.BIGINT,
    },
    temp_country_code: {
      type: Sequelize.STRING(5)
    },
    is_profile_completed: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    address: {
      type: Sequelize.TEXT
    },
    reset_password_token: {
      type: Sequelize.TEXT
    },
    title: {
      type: Sequelize.STRING(100)
    },
    deleted_at: {
      type: Sequelize.BIGINT,
    }, 
    is_deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    state_symbol: {
      type: Sequelize.STRING(20)
    },
    parent_id: {
      type: Sequelize.UUID,
      allowNull: true
    },
    is_business_account: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    is_suggestion_skipped: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    is_officially_verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    business_account_name: {
      type: Sequelize.STRING
    },
    business_account_category: {
      type: Sequelize.UUID
    },
		business_longitude: {
      type: Sequelize.NUMERIC(10,4)
    },
		business_latitude: {
      type: Sequelize.NUMERIC(10,4)
    }
  },
  {
    onDelete: "cascade",
    timestamps: false,
  }
);


module.exports = Users;
