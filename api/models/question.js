const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema(
  {
    text: {type: String, required: true},
    type: {type: String, enum: ['text', 'multiple_choice'], required: true},
    options: {type: [String], default: []},
  },
  {timestamps: true},
);

module.exports = mongoose.model('Question', questionSchema);
