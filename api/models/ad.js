const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adSchema = new Schema(
  {
    organizer: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    title: {type: String, required: true, trim: true},
    description: {type: String, required: true, trim: true},
    imageUrl: {type: String, required: true},
    redirectUrl: {type: String, default: null}, 
  },
  {timestamps: true}, 
);

module.exports = mongoose.model('Ad', adSchema);
