const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema(
  {
    title: {type: String, required: true},
    eventType: {
      type: String,
      enum: ['concert', 'football', 'theater', 'dance', 'other'],
      required: true,
    },
    location: {type: String, required: true},
    date: {type: String, required: true},
    time: {type: String, required: true},
    totalParticipants: {type: Number, required: true},
    description: {type: String},
    tags: [String],
    images: [String],
    isPaid: {type: Boolean, default: false},
    price: {type: Number},
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    priority_score: {type: Number, default: 0},
    seat_map: [
      {
        row: {type: String},
        number: {type: Number},
        status: {
          type: String,
          enum: ['available', 'booked'],
          default: 'available',
        },
      },
    ],
    community: {type: mongoose.Schema.Types.ObjectId, ref: 'Community'},
    attendees: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    requests: [
      {
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        comment: {type: String},
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
      },
    ],
    reviews: [
      {
        eventId: {type: mongoose.Schema.Types.ObjectId, ref: 'Event'},
        review: String,
        rating: {type: Number, min: 1, max: 5},
        createdAt: {type: Date, default: Date.now},
      },
    ],
  },
  {timestamps: true},
);

module.exports = mongoose.model('Event', eventSchema);
