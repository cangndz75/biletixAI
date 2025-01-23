const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const venueSchema = new Schema({
  name: {type: String, required: true},
  location: {type: String, required: true},
  address: {type: String, required: true},
  image: {type: String},
  avgRating: {type: Number, default: 0},
  ratingCount: {type: Number, default: 0},
  reviews: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      rating: {type: Number, min: 1, max: 5, required: true},
      comment: {type: String},
      reviewedAt: {type: Date, default: Date.now},
    },
  ],
  eventsAvailable: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
});

const Venue = mongoose.model('Venue', venueSchema);
module.exports = Venue;
