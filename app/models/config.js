const express = require('express');
const app = express();
if (app.get('env') === 'production') {
  module.exports = {
    port: Number(process.env.PORT),
    apiUrl: process.env.API_URL,
    indexTitle: process.env.INDEX_TITLE,
    registerTitle: process.env.REGISTER_TITLE,
    loginTitle: process.env.LOGIN_TITLE,
    notesTitle: process.env.NOTES_TITLE,
    createTitle: process.env.CREATE_TITLE,
    // updateTitle: process.env.UPDATE_TITLE
  }
} else {
  var config = require('./config_dev.js');
  console.log(config);
  module.exports = config;
}