var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'user' },
  question: { type: Schema.Types.ObjectId, ref: 'question' },
  content: {type: String, trim: true, required: true},
  numLikes: {type: Number, default: 0},
  createdAt: {type: String, default: new Date()+9}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var answer = mongoose.model('answer', schema);

module.exports = answer;