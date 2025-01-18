const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  text: {type: String, required: true},
  type: {type: String, enum: ['text', 'multiple_choice'], required: true},
  options: {type: [String], default: []},
});

module.exports = mongoose.model('Question', questionSchema);
