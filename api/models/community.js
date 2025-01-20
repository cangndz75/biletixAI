const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const communitySchema = new Schema(
  {
    name: {type: String, required: true},
    description: {type: String, required: true},
    profileImage: {type: String},
    headerImage: {type: String},
    tags: {type: [String], default: []},
    isPrivate: {type: Boolean, default: false},
    links: {type: [String], default: []},
    members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    joinRequests: [
      {
        userId: {type: Schema.Types.ObjectId, ref: 'User'},
        answers: {type: Map, of: String},
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
        requestedAt: {type: Date, default: Date.now},
      },
    ],
    organizer: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    events: [{type: Schema.Types.ObjectId, ref: 'Event', default: []}],
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    questions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Question'}],
  },
  {timestamps: true},
);

communitySchema.pre('save', function (next) {
  this.joinRequests.forEach(request => {
    if (
      request.status === 'approved' &&
      !this.members.includes(request.userId)
    ) {
      this.members.push(request.userId);
    }
  });
  next();
});

module.exports = mongoose.model('Community', communitySchema);
