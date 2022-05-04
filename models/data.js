let mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const Data = new Schema({
  email: String,
  buy_id: Number,
  status: Boolean
}, {
  timestamps: true
});

module.exports = mongoose.model('Data', Data);