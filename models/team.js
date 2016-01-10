var mongoose = require('mongoose');

var teamSchema = new mongoose.Schema({
  name: {
    type: String
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Number
  },
  updatedAt: {
    type: Number
  }
});

teamSchema.pre('save', function(cb) {
  this.createdAt = this.createdAt ? this.createdAt : Date.now();
  this.updatedAt = Date.now();
  cb();
});

module.exports = mongoose.model('Team', teamSchema);
