'use strict';

const mongoose = require('../libs/mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  message: {},

  messageId: String, // from transport

  // lastSqsNotification: {  },

  transportResponse: {
    messageId: String,
    envelope: {},
    accepted: {},
    rejected: {},
    pending: {},
    response: String
  }

}, {
  timestamps: true
});


schema.index({ 'message.to.address': 1 });
schema.index({ 'messageId': 1 });

module.exports = mongoose.model('Letter', schema);
