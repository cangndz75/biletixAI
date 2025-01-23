const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    email: {type: String, required: true, unique: true},
    password: {type: String},
    firstName: {type: String, required: true},
    lastName: {type: String},
    image: {type: String, default: 'https://via.placeholder.com/150'},
    skill: {type: String},
    noOfEvents: {type: Number, default: 0},
    eventPals: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    events: [{type: mongoose.Schema.Types.ObjectId, ref: 'Event'}],
    badges: [{name: {type: String}, earnedAt: {type: Date, default: Date.now}}],
    level: {type: Number, default: 1},
    points: {type: Number, default: 0},
    role: {
      type: String,
      enum: ['user', 'organizer', 'staff', 'super_admin'],
      default: 'user',
    },
    subscriptionType: {
      type: String,
      enum: ['free', 'UserPlus', 'OrganizerPlus'],
      default: 'free',
    },
    vipBadge: {type: Boolean, default: false},
    favorites: [{type: mongoose.Schema.Types.ObjectId, ref: 'Event'}],
    interests: [{type: String}],
    aboutMe: {type: String, default: ''},
    isPrivate: {type: Boolean, default: false},
    followers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    following: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    community: [{type: mongoose.Schema.Types.ObjectId, ref: 'Community'}],
    likedPosts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
    stripeCustomerId: {type: String, default: null},
    stripeSubscriptionId: {type: String, default: null},
    organizerApplication: {
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: null,
      },
      reason: {type: String},
      appliedAt: {type: Date},
    },
    notifications: [
      {
        type: {
          type: String,
          enum: [
            'follow',
            'eventInvite',
            'message',
            'friendRequest',
            'newEvent',
          ],
          required: true,
        },
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        event: {type: mongoose.Schema.Types.ObjectId, ref: 'Event'},
        message: {type: String},
        createdAt: {type: Date, default: Date.now},
        seen: {type: Boolean, default: false},
      },
    ],
    eventLimitResetDate: {type: Date, default: null},
    remainingEventLimit: {type: Number, default: 2}, 
  },
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  },
);

userSchema.virtual('organizerEventLimit').get(function () {
  return this.vipBadge ? 10 : this.role === 'organizer' ? 2 : null;
});

userSchema.pre('save', function (next) {
  const now = new Date();
  if (
    !this.eventLimitResetDate ||
    now - this.eventLimitResetDate >= 30 * 24 * 60 * 60 * 1000
  ) {
    this.remainingEventLimit = this.vipBadge ? 10 : 2; 
    this.eventLimitResetDate = now;
  }
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
