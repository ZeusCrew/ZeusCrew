var mongoose = require('mongoose');

var JourneySchema = new mongoose.Schema({
  startPoint: {
    type: String,
    required: true
  },
  endPoint: {
    type: String,
    required: true
  },
  hash: {
    type: String
  }
});

module.exports = mongoose.model('Journey', JourneySchema);
