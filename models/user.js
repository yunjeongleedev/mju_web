var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
  name: {type: String, required: true, trim: true},
  email: {type: String, required: true, index: true, unique: true, trim: true},
  password: {type: String},
  createdAt: {type: String, default: new Date()+9}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

var user = mongoose.model('user', schema);

module.exports = user;
