require('dotenv-safe').config()

const { Client } = require("@elastic/elasticsearch");

const ESClient = new Client({
  node: process.env["OS_CONNECTION_STRING"],
  auth: {
    username: "",
    password: ""
  },
  headers: {
    "Content-type": "application/json"
  }
});

module.exports = {ESClient};
