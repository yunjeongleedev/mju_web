const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

var schema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  title: {type: String, trim: true, required: true},
  content: {type: String, trim: true, required: true},
  imgURL: {type: String, trim: true, required: true},
  organizer: {type: String, trim: true, required: true},
  applicant: {type: String, trim: true, required: true},
  manager: {type: String, trim: true, required: true},
  tags: [String],
  numLikes: {type: Number, default: 0},
  numAnswers: {type: Number, default: 0},
  numReads: {type: Number, default: 0},
  phoneNum: {type: String, trim: true, required: true},
  createdAt: {type: Date, default: Date.now},
  startDate: {type: Date, trim: true, required: true},
  endDate: {type: Date, trim: true, required: true}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Question = mongoose.model('Question', schema);

module.exports = Question;
