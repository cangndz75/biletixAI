const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  description: {type: String, required: true},
  imageUrl: {type: String, default: ''},
  user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  community: {type: Schema.Types.ObjectId, ref: 'Community', required: true},
  likes: [{user: {type: Schema.Types.ObjectId, ref: 'User'}}],
  comments: [
    {
      user: {type: Schema.Types.ObjectId, ref: 'User'},
      text: {type: String, required: true},
      createdAt: {type: Date, default: Date.now},
    },
  ],
  createdAt: {type: Date, default: Date.now},
});

module.exports = mongoose.model('Post', postSchema);
