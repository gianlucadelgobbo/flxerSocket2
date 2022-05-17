let mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const Data = new Schema({
  email: {
    required: "EMAIL_IS_REQUIRED",
    type: String, 
    trim: true, 
    index: true, 
    unique: "You have already booked an NFT",
    validate: [(email) => {
      //var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3,4})+$/;
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email)
    }, 'EMAIL_IS_NOT_VALID']
  },
  buy_id: Number,
  status: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Data', Data);