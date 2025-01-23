const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('./models/user');
const Event = require('./models/event');
const Message = require('./models/message');
const Venue = require('./models/venue');
const Community = require('./models/community');
const Post = require('./models/post');
const {QUESTIONS} = require('../shared/questions');
const Question = require('./models/question');
const moment = require('moment');
const app = express();
const port = process.env.PORT || 8000;
const generateRoute = require('./routes/generateRoute');
const axios = require('axios');
const refreshTokens = [];
const path = require('path');
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
console.log('Stripe API Key:', process.env.STRIPE_SECRET_KEY);
console.log('Environment:', process.env.NODE_ENV);
console.log('Webhook Secret:', process.env.STRIPE_WEBHOOK_SECRET);

app.use('/webhook', express.raw({type: 'application/json'}));

app.post(
  '/webhook',
  express.raw({type: 'application/json'}),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      console.log('✅ Webhook received:', event.type);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata ? session.metadata.userId : null;

      console.log(`✅ Payment successful for User ID: ${userId}`);

      if (userId) {
        try {
          const user = await User.findById(userId);
          if (!user) {
            console.error('❌ User not found');
            return res.status(404).json({error: 'User not found'});
          }

          let newSubscriptionType;
          if (user.role === 'organizer') {
            newSubscriptionType = 'OrganizerPlus';
          } else {
            newSubscriptionType = 'UserPlus';
          }

          const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
              subscriptionType: newSubscriptionType,
              vipBadge: true,
              stripeSubscriptionId: session.subscription,
            },
            {new: true},
          );

          console.log(
            `✅ ${newSubscriptionType} subscription updated for User ID: ${userId}`,
          );
          console.log('✅ Updated User:', updatedUser);
        } catch (error) {
          console.error('❌ Error updating user:', error.message);
        }
      } else {
        console.error('❌ User ID is missing from metadata');
      }
    }

    res.json({received: true});
  },
);

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/generate', generateRoute);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/webhook', express.raw({type: 'application/json'}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.log('Connection error:', error));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({message: 'No token provided, unauthorized'});
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({message: 'Invalid token'});
    }

    req.user = user;
    next();
  });
};

app.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      image,
      aboutMe,
      interests,
      communityId,
    } = req.body;

    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      image,
      aboutMe,
      interests,
      community: communityId || null,
    });

    await newUser.save();

    if (communityId) {
      const community = await Community.findById(communityId);
      if (community) {
        community.members.push(newUser._id);
        await community.save();
      }
    }

    res
      .status(201)
      .json({message: 'User registered successfully', userId: newUser._id});
  } catch (error) {
    res.status(500).json({message: 'Internal Server Error'});
  }
});

app.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;
    const user = await User.findOne({email});

    if (!user || user.password !== password) {
      return res.status(401).json({message: 'Invalid credentials'});
    }

    res.status(200).json({
      userId: user._id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      image: user.image,
      aboutMe: user.aboutMe,
      interests: user.interests,
      followers: user.followers,
      following: user.following,
    });
  } catch (error) {
    res.status(500).json({message: 'Internal Server Error'});
  }
});

app.get('/recent-participants', async (req, res) => {
  try {
    const participants = await User.find({}, 'image firstName')
      .sort({createdAt: -1})
      .limit(5);
    res.status(200).json(participants);
  } catch (error) {
    console.error('Error fetching recent participants1:', error);
    res.status(500).json({message: 'Internal Server Error'});
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/user/:userId', async (req, res) => {
  try {
    const {userId} = req.params;

    const user = await User.findById(userId)
      .populate('followers', 'firstName lastName username image')
      .populate('following', 'firstName lastName username image')
      .select(
        'firstName lastName username email image subscriptionType aboutMe role events vipBadge followers stripeSubscriptionId following isPrivate remainingEventLimit',
      );

    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    const vipBadge =
      user.subscriptionType === 'UserPlus' ||
      user.subscriptionType === 'OrganizerPlus';

    res.status(200).json({
      ...user.toObject(),
      vipBadge,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res
      .status(500)
      .json({message: 'Error fetching user data', error: error.message});
  }
});

app.put('/user/:userId', async (req, res) => {
  const {userId} = req.params;
  const {firstName, lastName, email, password, phone, country} = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {firstName, lastName, email, password, phone, country},
      {new: true},
    );

    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    res.status(200).json({message: 'Profile updated successfully', user});
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({message: 'Failed to update profile'});
  }
});

const venues = [
  {
    name: 'Bostancı Gösteri Merkezi',
    rating: 4.5,
    deferLink: 'https://www.biletix.com/mekan/BG/TURKIYE/tr',
    fullLink: 'https://www.biletix.com/mekan/BG/TURKIYE/tr',
    avgRating: 4.5,
    ratingCount: 150,
    lat: 40.963218,
    lng: 29.096045,
    icon: 'https://maps.google.com/mapfiles/kml/paddle/4-lv.png',
    filter_by: ['Concert', 'Theatre'],
    eventsAvailable: [
      {
        id: '1',
        name: 'Concert',
        icon: 'concert',
        price: 150,
        courts: [
          {
            id: '1',
            name: 'Main Hall',
            number: 1,
          },
        ],
      },
      {
        id: '2',
        name: 'Theatre',
        icon: 'theatre',
        price: 100,
        courts: [
          {
            id: '1',
            name: 'Theatre Stage',
            number: 1,
          },
        ],
      },
    ],
    image:
      'https://i.ytimg.com/vi/vWEDP3RxOIs/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLC8xcHcti2J4pAB76sCUkD5_hKyDQ',
    location: 'Bostancı, İstanbul',
    address: 'Bostancı, Mehmet Şevki Paşa Cad. No:24, Kadıköy/İstanbul',
    bookings: [],
  },
  {
    name: 'Moda Sahnesi',
    rating: 4.7,
    deferLink: 'https://www.biletix.com/mekan/MODD/TURKIYE/tr',
    fullLink: 'https://www.biletix.com/mekan/MODD/TURKIYE/tr',
    avgRating: 4.7,
    ratingCount: 120,
    lat: 40.987213,
    lng: 29.034174,
    icon: 'https://maps.google.com/mapfiles/kml/paddle/4-lv.png',
    filter_by: ['Theatre', 'Concert'],
    eventsAvailable: [
      {
        id: '1',
        name: 'Concert',
        icon: 'concert',
        price: 200,
        courts: [
          {
            id: '1',
            name: 'Main Hall',
            number: 1,
          },
        ],
      },
      {
        id: '2',
        name: 'Theatre',
        icon: 'theatre',
        price: 120,
        courts: [
          {
            id: '1',
            name: 'Theatre Stage',
            number: 1,
          },
        ],
      },
    ],
    image:
      'https://galeri3.arkitera.com/var/albums/Haber/2014/04/16/halukar-tiyatro-806537870/BOU%20DD%20halukar%2001.jpg',
    location: 'Kadıköy, İstanbul',
    address: 'Caferağa, Moda Cd. No: 10A, 34710 Kadıköy/İstanbul',
    bookings: [],
  },
  {
    name: 'RAMS Park',
    rating: 4.8,
    deferLink: 'https://www.passo.com.tr/tr/mekan/8715/8715',
    fullLink: 'https://www.passo.com.tr/tr/mekan/8715/8715',
    avgRating: 4.8,
    ratingCount: 90,
    lat: 41.076623,
    lng: 28.833333,
    icon: 'https://maps.google.com/mapfiles/kml/paddle/4-lv.png',
    filter_by: ['Football', 'Concert'],
    eventsAvailable: [
      {
        id: '1',
        name: 'Football',
        icon: 'football',
        price: 300,
        courts: [
          {
            id: '1',
            name: 'Main Field',
            number: 1,
          },
        ],
      },
      {
        id: '2',
        name: 'Concert',
        icon: 'concert',
        price: 250,
        courts: [
          {
            id: '1',
            name: 'Concert Stage',
            number: 1,
          },
        ],
      },
    ],
    image:
      'https://media-cdn.tripadvisor.com/media/photo-s/2b/95/cf/fd/rams-park-istanbul.jpg',
    location: 'Başakşehir, İstanbul',
    address: 'Başakşehir, İstanbul',
    bookings: [],
  },
  {
    name: 'Dans Akademi',
    rating: 4.6,
    deferLink: 'https://dansakademi.com.tr/dans-akademi-bakirkoy',
    fullLink: 'https://dansakademi.com.tr/dans-akademi-bakirkoy',
    avgRating: 4.6,
    ratingCount: 80,
    lat: 41.008237,
    lng: 28.978358,
    icon: 'https://maps.google.com/mapfiles/kml/paddle/4-lv.png',
    filter_by: ['Dance'],
    eventsAvailable: [
      {
        id: '1',
        name: 'Dance',
        icon: 'dance',
        price: 100,
        courts: [
          {
            id: '1',
            name: 'Main Dance Floor',
            number: 1,
          },
        ],
      },
    ],
    image:
      'https://dansakademi.com.tr/uploads/2024/08/dans-kurslari-bakirkoy.jpg',
    location: 'Kartaltepe Mah. Alpay İzer Sok. No: 4/B Bakırköy/İstanbul',
    address: 'Kartaltepe Mah. Alpay İzer Sok. No: 4/B Bakırköy/İstanbul',
    bookings: [],
  },
];

async function addVenues() {
  for (const venueData of venues) {
    const existingVenue = await Venue.findOne({name: venueData?.name});

    if (existingVenue) {
      console.log('Venue already exists:', venueData?.name);
    } else {
      const newVenue = new Venue(venueData);
      await newVenue.save();
      console.log('Venue added:', venueData?.name);
    }
  }
}

addVenues().catch(err => {
  console.log('Error adding venues:', err);
});

app.get('/venues', async (req, res) => {
  try {
    const venues = await Venue.find();
    res.status(200).json(venues);
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/generate', async (req, res) => {
  const {eventName, location} = req.body;

  if (!eventName || !location) {
    return res
      .status(400)
      .json({message: 'Event name and location are required'});
  }

  const prompt = `Generate a detailed description for the event: ${eventName} happening at ${location}.`;

  try {
    const response = await generateText(prompt);
    res.status(200).json({response});
  } catch (error) {
    console.error('Error generating content:', error.message);
    res.status(500).json({message: 'Failed to generate content'});
  }
});

app.post('/createevent', async (req, res) => {
  console.log('📥 Received event data:', JSON.stringify(req.body, null, 2));

  const {
    title,
    description,
    tags = [],
    location,
    date,
    time,
    eventType,
    totalParticipants,
    organizer,
    images = [],
    isPaid,
    price,
  } = req.body;

  if (!title || !location || !eventType || !totalParticipants || !organizer) {
    console.log('🚨 Missing required fields:', {
      title,
      location,
      eventType,
      totalParticipants,
      organizer,
    });
    return res
      .status(400)
      .json({message: 'All required fields must be provided.'});
  }

  try {
    const user = await User.findById(organizer);
    if (!user) {
      return res.status(404).json({message: 'Organizer not found'});
    }

    if (user.remainingEventLimit === 0) {
      return res
        .status(403)
        .json({
          message:
            'You have reached your event limit. Upgrade to OrganizerPlus.',
        });
    }

    const newEvent = new Event({
      title,
      description,
      tags: Array.isArray(tags) ? tags : [],
      location,
      date,
      time,
      eventType,
      totalParticipants: Number(totalParticipants),
      organizer,
      images: Array.isArray(images) ? images : [], 
      isPaid: Boolean(isPaid),
      price: isPaid ? Number(price) || 0 : 0,
    });

    await newEvent.save();

    user.remainingEventLimit -= 1;
    await user.save();

    console.log('✅ Event created successfully:', newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('🚨 ERROR CREATING EVENT:', error.stack);
    res
      .status(500)
      .json({message: 'Failed to create event.', error: error.message});
  }
});

app.get('/events', async (req, res) => {
  const {organizerId, role, userId} = req.query;

  try {
    let filter = {};

    if (role === 'organizer' && organizerId) {
      filter = {organizer: new mongoose.Types.ObjectId(organizerId)};
    } else if (userId) {
      filter = {attendees: new mongoose.Types.ObjectId(userId)};
    }

    console.log('📌 Etkinlikler getiriliyor. Filtre:', filter);

    const events = await Event.find(filter).populate('organizer');

    if (!events || events.length === 0) {
      console.warn('⚠️ Etkinlik bulunamadı. Filtre:', filter);
      return res.status(404).json({message: 'No events found'});
    }

    console.log('✅ Etkinlikler başarıyla getirildi:', events.length);
    res.status(200).json(events);
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    res.status(500).json({message: 'Failed to fetch events'});
  }
});

app.get('/events/user/:userId', async (req, res) => {
  try {
    const {userId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('❌ Geçersiz User ID:', userId);
      return res.status(400).json({message: 'Invalid User ID'});
    }

    console.log('📌 Kullanıcı ID ile etkinlikler getiriliyor:', userId);

    const events = await Event.find({attendees: userId}).populate('organizer');

    if (!events || events.length === 0) {
      console.warn('⚠️ Kullanıcı için etkinlik bulunamadı:', userId);
      return res.status(404).json({message: 'No events found for this user'});
    }

    console.log('✅ Kullanıcının etkinlikleri bulundu:', events.length);
    res.status(200).json(events);
  } catch (error) {
    console.error('❌ Kullanıcı etkinliklerini çekerken hata:', error.message);
    res.status(500).json({message: 'Failed to fetch user events'});
  }
});

app.get('/upcoming', async (req, res) => {
  try {
    const events = await Event.find({})
      .populate('organizer')
      .populate('attendees', 'image firstName lastName');
    const currentDate = moment();
    const filteredEvents = events?.filter(event => {
      const eventData = moment(event.date, 'Do MMMM');
      const eventTime = event.time.split(' - ')[0];
      const eventDateTime = moment(
        `${event.date} ${eventTime}`,
        'Do MMMM HH:mm',
      );
      return eventDateTime.isAfter(currentDate);
    });
    const formattedEvents = filteredEvents.map(event => ({
      _id: event._id,
      title: event.title,
      eventType: event.eventType,
      location: event.location,
      date: event.date,
      time: event.time,
      attendees: event.attendees.map(attendee => ({
        _id: attendee._id,
        imageUrl: attendee.image,
        name: `${attendee.firstName} ${attendee.lastName}`,
      })),
      totalParticipants: event.totalParticipants,
      queries: event.queries,
      request: event.request,
      isBooked: event.isBooked,
      organizerId: event.organizer._id,
      organizerName: `${event.organizer.firstName} ${event.organizer.lastName}`,
      organizerUrl: event.organizer.image,
      isFull: event.isFull,
    }));
    res.json(formattedEvents);
  } catch (error) {
    console.log('Error:', error);
    res.status(500).send('Error fetching events');
  }
});

app.post('/events/:eventId/request', async (req, res) => {
  try {
    const {userId, comment} = req.body;
    const {eventId} = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({message: 'Event not found'});
    }

    const existingRequest = event.requests.find(
      request => request.userId.toString() === userId,
    );

    if (existingRequest) {
      return res.status(400).json({message: 'Request already sent'});
    }

    event.requests.push({userId, comment, status: 'pending'});
    await event.save();

    res.status(200).json({message: 'Request sent successfully'});
  } catch (err) {
    console.error('Error processing join request:', err);
    res.status(500).json({message: 'Failed to send request'});
  }
});

app.post('/events/:eventId/cancel-request', async (req, res) => {
  try {
    const {userId} = req.body;
    const {eventId} = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({message: 'Event not found'});
    }

    event.requests = event.requests.filter(
      request => request.userId.toString() !== userId,
    );
    await event.save();

    res.status(200).json({message: 'Request cancelled successfully'});
  } catch (err) {
    console.error('Error cancelling request:', err);
    res.status(500).json({message: 'Failed to cancel request'});
  }
});

// app.get('/events/:eventId/requests', async (req, res) => {
//   try {
//     const {eventId} = req.params;
//     const event = await Event.findById(eventId).populate({
//       path: 'requests.userId',
//       select:
//         'email firstName lastName image image skill noOfEvents eventPals events badges level points',
//     });
//     if (!event) {
//       return res.status(404).send('Event not found');
//     }
//     const requestsWithUserInfo = event?.requests?.map(request => ({
//       userId: request.userId._id,
//       email: request.userId.email,
//       firstName: request.userId.firstName || '',
//       lastName: request.userId.lastName || '',
//       image: request.userId.image || '',
//       skill: request.userId.skill || '',
//       noOfEvents: request.userId.noOfEvents || 0,
//       eventPals: request.userId.eventPals || [],
//       events: request.userId.events || [],
//       badges: request.userId.badges || [],
//       level: request.userId.level || 0,
//       points: request.userId.points || 0,
//       comment: request.comment || '',
//     }));
//     res.json(requestsWithUserInfo);
//   } catch (error) {
//     console.log('Error:', error);
//     res.status(500).send('Error fetching events');
//   }
// });

app.get('/events/:eventId/requests', async (req, res) => {
  try {
    const {eventId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({message: 'Invalid event ID'});
    }

    const event = await Event.findById(eventId).populate({
      path: 'requests.userId',
      select: 'firstName lastName image email',
    });

    if (!event) {
      return res.status(404).json({message: 'Event not found'});
    }

    const requestsWithUserInfo = event.requests.map(request => ({
      requestId: request._id,
      userId: request.userId?._id,
      firstName: request.userId?.firstName || 'Unknown',
      lastName: request.userId?.lastName || 'Unknown',
      image: request.userId?.image || 'https://via.placeholder.com/150',
      email: request.userId?.email || 'N/A',
      comment: request.comment || '',
      status: request.status || 'pending',
    }));

    res.status(200).json(requestsWithUserInfo);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({message: 'Internal Server Error'});
  }
});

app.get('/event/:eventId/attendees', async (req, res) => {
  try {
    const {eventId} = req.params;
    const event = await Event.findById(eventId).populate('attendees');

    if (!event) {
      return res.status(404).json({message: 'Event not found'});
    }

    res.status(200).json(event.attendees);
    console.log('Attendees:', event.attendees);
  } catch (err) {
    console.error(err);
    res.status(500).json({message: 'Failed to fetch attendees'});
  }
});

app.put('/user/:userId/makeOrganizer', async (req, res) => {
  try {
    const {userId} = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    user.isOrganizer = true;
    await user.save();

    res.status(200).send('User updated as organizer');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Error updating user');
  }
});

app.put('/updateAllUsersToAddOrganizer', async (req, res) => {
  try {
    const updatedUsers = await User.updateMany(
      {},
      {$set: {isOrganizer: false}},
    );
    res.status(200).send('All users updated with isOrganizer field');
  } catch (error) {
    console.error('Error updating all users:', error);
    res.status(500).send('Error updating users');
  }
});

app.post('/accept', async (req, res) => {
  const {eventId, userId} = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(eventId).session(session);
    if (!event) throw new Error(`Event not found with ID: ${eventId}`);

    const user = await User.findById(userId).session(session);
    if (!user) throw new Error(`User not found with ID: ${userId}`);

    if (!event.attendees.includes(userId)) {
      event.attendees.push(userId);
    }

    event.requests = event.requests.filter(
      req => req.userId.toString() !== userId,
    );
    user.events.push(eventId);

    await event.save({session});
    await user.save({session});
    await session.commitTransaction();

    res.status(200).json({message: 'Request accepted', event});
  } catch (error) {
    await session.abortTransaction();
    console.error('Error accepting request:', error);
    res.status(500).json({message: 'Server error'});
  } finally {
    session.endSession();
  }
});

app.post('/reject', async (req, res) => {
  try {
    const {requestId, eventId} = req.body;

    const event = await Event.findOneAndUpdate(
      {_id: eventId, 'requests._id': requestId},
      {$set: {'requests.$.status': 'rejected'}},
      {new: true},
    );

    if (!event) {
      return res.status(404).json({message: 'Request or Event not found'});
    }

    console.log(`Request rejected: ${requestId}`);
    res.status(200).json({message: 'Request rejected'});
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({message: 'Server Error'});
  }
});

app.post('/sendrequest', async (req, res) => {
  const {senderId, receiverId, message} = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({message: 'Sender or Receiver ID is missing'});
  }

  console.log(
    `Sender: ${senderId}, Receiver: ${receiverId}, Message: ${message}`,
  );

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return res.status(404).json({message: 'Receiver not found'});
  }

  receiver.requests.push({from: senderId, message});
  await receiver.save();

  console.log(`Request sent from ${senderId} to ${receiverId}`);
  res.status(200).json({message: 'Request sent successfully'});
});

app.get('/getrequests/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({message: 'Invalid user ID'});
    }
    console.log(`Fetching requests for userId: ${userId}`);
    const user = await User.findById(userId).populate(
      'requests.from', // Populate request sender details
      'firstName lastName email image',
    );

    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    console.log(`Found requests for user ${userId}:`, user.requests);
    res.json(user.requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({message: 'Server error'});
  }
});
app.post('/acceptrequest', async (req, res) => {
  try {
    const {userId, requestId} = req.body;
    console.log(
      `Accepting request for userId: ${userId}, requestId: ${requestId}`,
    );

    const user = await User.findById(userId);
    const friend = await User.findById(requestId);

    if (!user || !friend) {
      return res.status(404).json({message: 'User or Friend not found'});
    }

    await User.findByIdAndUpdate(userId, {
      $push: {friends: requestId},
      $pull: {requests: {from: requestId}},
    });

    await User.findByIdAndUpdate(requestId, {
      $push: {friends: userId},
    });

    console.log(`Request accepted: ${requestId} is now a friend of ${userId}`);
    res.status(200).json({message: 'Request accepted'});
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({message: 'Server Error'});
  }
});

const http = require('http').createServer(app);

const io = require('socket.io')(http);

//{"userId" : "socket ID"}

const userSocketMap = {};

io.on('connection', socket => {
  console.log('a user is connected', socket.id);

  const userId = socket.handshake.query.userId;

  console.log('userid', userId);

  if (userId !== 'undefined') {
    userSocketMap[userId] = socket.id;
  }

  console.log('user socket data', userSocketMap);

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
    delete userSocketMap[userId];
  });

  socket.on('sendMessage', ({senderId, receiverId, message}) => {
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', {senderId, message});
    }
  });
});

http.listen(3000, () => {
  console.log('Socket.IO running on port 8000');
});
app.post('/sendMessage', async (req, res) => {
  try {
    const {senderId, receiverId, message} = req.body;

    if (!senderId || !receiverId || !message) {
      return res
        .status(400)
        .json({message: 'senderId, receiverId ve message gerekli!'});
    }

    const newMessage = new Message({
      senderId: new mongoose.Types.ObjectId(senderId),
      receiverId: new mongoose.Types.ObjectId(receiverId),
      message,
    });

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', '_id firstName lastName image')
      .populate('receiverId', '_id firstName lastName image');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({message: 'Error sending message'});
  }
});

app.get('/messages', async (req, res) => {
  try {
    const {senderId, receiverId} = req.query;

    if (!senderId || !receiverId) {
      return res.status(400).json({message: 'senderId ve receiverId gerekli!'});
    }

    console.log('Messages requested for:', {senderId, receiverId});

    const messages = await Message.find({
      $or: [
        {
          senderId: new mongoose.Types.ObjectId(senderId),
          receiverId: new mongoose.Types.ObjectId(receiverId),
        },
        {
          senderId: new mongoose.Types.ObjectId(receiverId),
          receiverId: new mongoose.Types.ObjectId(senderId),
        },
      ],
    })
      .populate('senderId', '_id firstName lastName image')
      .populate('receiverId', '_id firstName lastName image')
      .sort({timeStamp: 1});

    console.log('Messages fetched from DB:', messages);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({message: 'Error fetching messages'});
  }
});

app.get('/friends/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`Fetching friends for userId: ${userId}`);

    const user = await User.findById(userId).populate(
      'friends', // Populate friends array
      'firstName lastName image',
    );

    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    console.log(`Found friends for user ${userId}:`, user.friends);
    return res.status(200).json(user.friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    return res.status(500).json({message: 'Server error'});
  }
});

app.delete('/messages/:messageId', async (req, res) => {
  try {
    const {messageId} = req.params;
    await Message.findByIdAndDelete(messageId);
    res.status(200).json({message: 'Message deleted'});
  } catch (error) {
    console.log('Error deleting message:', error);
    res.status(500).json({message: 'Error deleting message'});
  }
});

app.get('/users', async (req, res) => {
  console.log('Fetching users...');
  try {
    const {role} = req.query;

    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query, 'firstName lastName image role');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/rejectrequest', async (req, res) => {
  try {
    const {userId, requestId} = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {requests: {from: requestId}},
      },
      {new: true},
    );

    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    res.status(200).json({message: 'Request rejected and removed'});
  } catch (error) {
    console.log('Error rejecting request:', error);
    res.status(500).json({message: 'Server error'});
  }
});

app.post('/favorites', async (req, res) => {
  try {
    const {userId, eventId} = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(eventId)
    ) {
      return res.status(400).json({message: 'Invalid user or event ID'});
    }

    const [user, event] = await Promise.all([
      User.findById(userId),
      Event.findById(eventId),
    ]);

    if (!user) return res.status(404).json({message: 'User not found'});
    if (!event) return res.status(404).json({message: 'Event not found'});

    const isFavorited = user.favorites.includes(eventId);

    if (isFavorited) {
      user.favorites.pull(eventId);
      await user.save();
      return res
        .status(200)
        .json({message: 'Event removed from favorites', isFavorited: false});
    } else {
      user.favorites.addToSet(eventId);
      await user.save();
      return res
        .status(200)
        .json({message: 'Event added to favorites', isFavorited: true});
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({message: 'Internal Server Error'});
  }
});

app.get('/favorites/:userId', async (req, res) => {
  try {
    const {userId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({message: 'Invalid user ID'});
    }

    const user = await User.findById(userId).populate({
      path: 'favorites',
      model: 'Event',
      select: 'title location date time images',
    });

    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    res.status(200).json(user.favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({message: 'Internal Server Error'});
  }
});

app.get('/venues/:venueId', async (req, res) => {
  const {venueId} = req.params;

  if (!mongoose.Types.ObjectId.isValid(venueId)) {
    return res.status(400).json({message: 'Invalid Venue ID'});
  }

  try {
    const venue = await Venue.findById(venueId).populate({
      path: 'eventsAvailable',
      model: 'Event',
      select: 'title eventType location date time price',
    });

    if (!venue) {
      return res.status(404).json({message: 'Venue not found'});
    }

    res.status(200).json(venue);
  } catch (error) {
    console.error('Error fetching venue:', error.message);
    res.status(500).json({message: 'Internal Server Error'});
  }
});

app.get('/venues/:venueId/events', async (req, res) => {
  const {venueId} = req.params;

  if (!mongoose.Types.ObjectId.isValid(venueId)) {
    return res.status(400).json({message: 'Invalid Venue ID'});
  }

  try {
    const venue = await Venue.findById(venueId).populate({
      path: 'eventsAvailable',
      select: 'title eventType price location date time image',
    });

    if (!venue) return res.status(404).json({message: 'Venue not found'});

    const events = venue.eventsAvailable.map(event => ({
      _id: event._id,
      title: event.title,
      eventType: event.eventType,
      price: event.price,
      location: event.location,
      date: event.date,
      time: event.time,
      image: event.image || 'https://via.placeholder.com/150',
    }));

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).json({message: `Error fetching events: ${error.message}`});
  }
});

app.get('/event/:eventId/organizer', async (req, res) => {
  try {
    const {eventId} = req.params;

    const event = await Event.findById(eventId).populate(
      'organizer',
      'firstName lastName image',
    );
    if (!event) {
      return res.status(404).json({message: 'Event not found'});
    }

    const organizer = event.organizer;
    res.status(200).json(organizer);
  } catch (error) {
    console.error('Error fetching organizer:', error);
    res.status(500).json({message: 'Internal Server Error'});
  }
});

app.get('/events/:eventId', async (req, res) => {
  const {eventId} = req.params;

  console.log('Fetching event with ID:', eventId);

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({message: 'Invalid event ID'});
  }

  try {
    const event = await Event.findById(eventId)
      .populate('organizer')
      .populate('attendees');

    if (!event) {
      console.warn('Event not found.');
      return res.status(404).json({message: 'Event not found'});
    }

    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
});

app.post('/venues/:venueId/comments', async (req, res) => {
  const {venueId} = req.params;
  const {text, rating} = req.body;

  if (!text || !rating) {
    return res.status(400).json({message: 'Text and rating are required'});
  }

  try {
    const venue = await Venue.findById(venueId);

    if (!venue) {
      return res.status(404).json({message: 'Venue not found'});
    }

    if (!venue.comments) {
      venue.comments = [];
    }

    const newComment = {text, rating, date: new Date()};
    venue.comments.push(newComment);
    await venue.save();

    res
      .status(201)
      .json({message: 'Comment added successfully', comment: newComment});
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({message: 'Internal Server Error'});
  }
});

app.put('/event/:eventId', async (req, res) => {
  const {eventId} = req.params;
  const updateData = req.body;

  try {
    const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
    });

    if (!updatedEvent) {
      return res.status(404).json({message: 'Event not found'});
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error.message);
    res
      .status(500)
      .json({message: 'Failed to update event', error: error.message});
  }
});

app.post('/venues', async (req, res) => {
  try {
    const newVenue = new Venue(req.body);
    await newVenue.save();
    res
      .status(201)
      .json({message: 'Venue created successfully', venue: newVenue});
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({message: 'Failed to create venue'});
  }
});

app.post('/user/:userId/interests', async (req, res) => {
  try {
    const {userId} = req.params;
    const {interests} = req.body;

    const user = await User.findByIdAndUpdate(userId, {interests}, {new: true});

    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    res.status(200).json({message: 'Interests saved successfully', user});
  } catch (error) {
    res.status(500).json({message: 'Failed to save interests', error});
  }
});

app.get('/user/:userId/interests', async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({message: 'Invalid user ID format'});
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }
    res.status(200).json({interests: user.interests});
  } catch (error) {
    console.error('Error fetching interests:', error);
    res.status(500).json({message: 'Internal Server Error'});
  }
});

app.post(
  '/events/:eventId/reviews',
  [
    body('userId')
      .notEmpty()
      .withMessage('User ID is required.')
      .isMongoId()
      .withMessage('Invalid User ID format.'),
    body('comment')
      .notEmpty()
      .withMessage('Comment is required.')
      .isString()
      .withMessage('Comment must be a string.'),
    body('rating')
      .optional()
      .isNumeric()
      .withMessage('Rating must be a number.')
      .default(5),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    try {
      const {eventId} = req.params;
      const {userId, comment, rating} = req.body;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({message: 'Event not found.'});
      }

      const newReview = {
        review: comment,
        rating: rating || 5,
        createdAt: new Date(),
        user: userId,
      };
      event.reviews.push(newReview);
      await event.save();

      res
        .status(201)
        .json({message: 'Review added successfully', review: newReview});
    } catch (error) {
      res
        .status(500)
        .json({message: 'Failed to add review.', error: error.message});
    }
  },
);

app.get('/events/:eventId/reviews', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId).populate({
      path: 'reviews.user',
      select: 'firstName lastName image',
    });

    if (!event) {
      return res.status(404).json({message: 'Event not found'});
    }

    console.log('Raw Event Data:', event);

    const formattedReviews = event.reviews.map(r => ({
      review: r.review,
      rating: r.rating,
      createdAt: r.createdAt,
      userName: r.user
        ? `${r.user.firstName} ${r.user.lastName || ''}`.trim()
        : 'Unknown User',
      userImage: r.user ? r.user.image : '',
    }));

    res.json(formattedReviews);
  } catch (error) {
    console.error('Error fetching event reviews:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

app.put('/user/:userId/about', async (req, res) => {
  try {
    const {userId} = req.params;
    const {aboutMe} = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {aboutMe},
      {new: true},
    );

    if (!updatedUser) {
      return res.status(404).json({message: 'User not found'});
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({message: 'Failed to update about me', error});
  }
});

app.post('/user/followRequest', async (req, res) => {
  const {fromUserId, toUserId} = req.body;

  try {
    const targetUser = await User.findById(toUserId);
    const followingUser = await User.findById(fromUserId);

    if (!targetUser || !followingUser) {
      return res.status(404).json({message: 'User not found'});
    }

    if (targetUser.isPrivate) {
      targetUser.friendRequests.push({
        from: fromUserId,
        status: 'pending',
        requestedAt: Date.now(),
      });

      const notification = {
        type: 'friendRequest',
        from: fromUserId,
        message: `${followingUser.firstName} ${followingUser.lastName} has sent you a follow request`,
        createdAt: Date.now(),
      };
      targetUser.notifications.push(notification);

      await targetUser.save();
      return res
        .status(200)
        .json({message: 'Follow request sent successfully'});
    } else {
      if (!targetUser.followers.includes(fromUserId)) {
        targetUser.followers.push(fromUserId);
      }
      if (!followingUser.following.includes(toUserId)) {
        followingUser.following.push(toUserId);
      }

      await targetUser.save();
      await followingUser.save();
      return res.status(200).json({message: 'User followed successfully'});
    }
  } catch (error) {
    console.error('Error handling follow request:', error);
    res
      .status(500)
      .json({message: 'Failed to handle follow request', error: error.message});
  }
});

app.post('/user/follow', async (req, res) => {
  const {fromUserId, toUserId} = req.body;

  try {
    const targetUser = await User.findById(toUserId);
    const followingUser = await User.findById(fromUserId);

    if (!targetUser || !followingUser) {
      return res.status(404).json({message: 'User not found'});
    }

    if (!targetUser.followers.includes(fromUserId)) {
      targetUser.followers.push(fromUserId);
    }
    if (!followingUser.following.includes(toUserId)) {
      followingUser.following.push(toUserId);
    }

    await targetUser.save();
    await followingUser.save();
    res.status(200).json({message: 'User followed successfully'});
  } catch (error) {
    console.error('Error following user:', error);
    res
      .status(500)
      .json({message: 'Failed to follow user', error: error.message});
  }
});

app.post('/user/unfollow', async (req, res) => {
  const {fromUserId, toUserId} = req.body;

  try {
    const targetUser = await User.findById(toUserId);
    const followingUser = await User.findById(fromUserId);

    if (!targetUser || !followingUser) {
      return res.status(404).json({message: 'User not found'});
    }

    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== fromUserId,
    );
    followingUser.following = followingUser.following.filter(
      id => id.toString() !== toUserId,
    );

    await targetUser.save();
    await followingUser.save();
    res.status(200).json({message: 'User unfollowed successfully'});
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res
      .status(500)
      .json({message: 'Failed to unfollow user', error: error.message});
  }
});

app.post('/communities', async (req, res) => {
  const {
    name,
    description,
    tags,
    isPrivate,
    headerImage,
    profileImage,
    links,
    userId,
    questions,
  } = req.body;

  if (!userId) {
    return res.status(401).json({message: 'Unauthorized: userId is required'});
  }

  if (!name || !description) {
    return res
      .status(400)
      .json({message: 'Name and description are required.'});
  }

  try {
    console.log('📩 Gelen Questions:', questions);

    let questionIds = [];

    if (questions && questions.length > 0) {
      for (const question of questions) {
        let existingQuestion = await Question.findOne({text: question.text});

        if (!existingQuestion) {
          existingQuestion = await new Question(question).save();
        }

        questionIds.push(existingQuestion._id);
      }
    }

    console.log('✅ İşlenen Question IDs:', questionIds);

    const newCommunity = new Community({
      name,
      description,
      tags: tags || [],
      isPrivate: isPrivate || false,
      headerImage: headerImage || null,
      profileImage: profileImage || null,
      links: links || [],
      organizer: userId,
      questions: isPrivate ? questionIds : [],
    });

    const savedCommunity = await newCommunity.save();
    res.status(201).json(savedCommunity);
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({message: 'Failed to create community.'});
  }
});

app.get('/communities', async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('members', 'firstName lastName')
      .populate('organizer', 'firstName lastName');
    res.status(200).json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({message: 'Failed to retrieve communities.'});
  }
});

app.post('/communities/:id/join', async (req, res) => {
  const {id} = req.params;
  const {userId, answers} = req.body;

  try {
    const community = await Community.findById(id);

    if (!community) {
      return res.status(404).json({message: 'Community not found'});
    }

    if (!community.isPrivate) {
      if (!community.members.includes(userId)) {
        community.members.push(userId);
        await community.save();
      }
      return res.status(200).json({message: 'Successfully joined community'});
    }

    community.joinRequests.push({userId, answers, status: 'pending'});
    await community.save();
    return res.status(200).json({message: 'Join request sent'});
  } catch (error) {
    res.status(500).json({message: 'Internal server error'});
  }
});

app.post('/communities/:communityId/join', async (req, res) => {
  const {communityId} = req.params;
  const {userId, answers} = req.body;

  try {
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({message: 'Community not found'});
    }

    const formattedAnswers = new Map(
      Object.entries(answers).map(([questionId, answer]) => [
        questionId.toString(),
        answer,
      ]),
    );

    community.joinRequests.push({
      userId,
      answers: formattedAnswers,
      status: 'pending',
    });

    await community.save();
    res.status(201).json({message: 'Join request submitted successfully'});
  } catch (error) {
    console.error('Error submitting join request:', error);
    res.status(500).json({message: 'Failed to submit join request'});
  }
});

app.get('/communities/:communityId/requests', async (req, res) => {
  const {communityId} = req.params;

  try {
    const community = await Community.findById(communityId)
      .populate('joinRequests.userId', 'firstName lastName image')
      .populate('questions');

    if (!community) {
      return res.status(404).json({message: 'Community not found'});
    }

    const pendingRequests = community.joinRequests
      .filter(req => req.status === 'pending')
      .map(request => {
        const answersObject = request.answers || {};

        const userAnswers = community.questions.map(q => ({
          questionId: q._id.toString(),
          questionText: q.text,
          answer: answersObject.get(q._id.toString()) || 'Cevap verilmedi',
        }));

        console.log(
          `📌 Kullanıcı: ${request.userId.firstName} ${request.userId.lastName}`,
        );
        userAnswers.forEach((ans, index) => {
          console.log(`🔹 Soru ${index + 1}: ${ans.questionText}`);
          console.log(`   ✅ Cevap: ${ans.answer}`);
        });

        return {
          _id: request._id,
          userId: request.userId,
          status: request.status,
          requestedAt: request.requestedAt,
          answers: userAnswers,
        };
      });

    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error(
      '❌ Hata: Kullanıcı başvuru istekleri çekilirken hata oluştu:',
      error,
    );
    res.status(500).json({message: 'Internal server error'});
  }
});

app.post('/communities/:communityId/accept-request', async (req, res) => {
  const {communityId} = req.params;
  const {requestId} = req.body;

  try {
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({message: 'Community not found'});
    }

    const request = community.joinRequests.id(requestId);
    if (!request) {
      return res.status(404).json({message: 'Request not found'});
    }

    community.members.push(request.userId);
    community.joinRequests = community.joinRequests.filter(
      req => req._id.toString() !== requestId,
    );
    await community.save();

    res
      .status(200)
      .json({message: 'Request approved and user added to community'});
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

app.post('/communities/:communityId/reject-request', async (req, res) => {
  const {communityId} = req.params;
  const {requestId} = req.body;

  try {
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({message: 'Community not found'});
    }

    community.joinRequests = community.joinRequests.filter(
      req => req._id.toString() !== requestId,
    );
    await community.save();

    res.status(200).json({message: 'Request rejected successfully'});
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

app.get('/communities/:communityId', async (req, res) => {
  const {communityId} = req.params;
  try {
    const community = await Community.findById(communityId)
      .populate('members', 'firstName lastName image')
      .populate('organizer', 'firstName lastName')
      .populate({
        path: 'questions',
        select: 'text type options',
      });

    console.log('Sorular:', community.questions);
    if (!community) {
      return res.status(404).json({message: 'Community not found'});
    }

    res.json(community);
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

app.put(
  '/communities/:communityId/name',
  authenticateToken,
  async (req, res) => {
    const {communityId} = req.params;
    const {name} = req.body;

    console.log('Update request for community name:', name);

    try {
      const community = await Community.findByIdAndUpdate(
        communityId,
        {name},
        {new: true},
      );
      if (!community) {
        console.error('Community not found for ID:', communityId);
        return res.status(404).json({message: 'Community not found'});
      }

      res.status(200).json(community);
    } catch (error) {
      console.error('Error updating community name:', error);
      res.status(500).json({message: 'Internal Server Error'});
    }
  },
);

app.put(
  '/communities/:communityId/description',
  authenticateToken,
  async (req, res) => {
    const {communityId} = req.params;
    const {description} = req.body;

    console.log('Update request for community description:', description);

    try {
      const community = await Community.findByIdAndUpdate(
        communityId,
        {description},
        {new: true},
      );
      if (!community) {
        console.error('Community not found for ID:', communityId);
        return res.status(404).json({message: 'Community not found'});
      }

      res.status(200).json(community);
    } catch (error) {
      console.error('Error updating community description:', error);
      res.status(500).json({message: 'Internal Server Error'});
    }
  },
);

app.post('/communities/:communityId/send-request', async (req, res) => {
  const {communityId} = req.params;
  const {answers, userId} = req.body;

  try {
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({message: 'Community not found'});
    }

    const existingRequest = community.joinRequests.find(
      request => request.userId.toString() === userId,
    );

    if (existingRequest) {
      return res.status(400).json({message: 'Join request already exists'});
    }

    community.joinRequests.push({userId, answers, status: 'pending'});
    await community.save();

    res.status(200).json({message: 'Join request sent successfully'});
  } catch (error) {
    console.error('Error sending join request:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

app.post('/posts/create', async (req, res) => {
  console.log('🟢 Request received:', req.body);

  const {description, userId, communityId, imageUrl} = req.body;

  if (!description || !userId || !communityId) {
    console.log('❌ Missing fields:', {description, userId, communityId});
    return res.status(400).json({
      message: '❗ Description, user ID, and community ID are required.',
    });
  }

  try {
    const newPost = new Post({
      description,
      imageUrl: imageUrl || 'https://via.placeholder.com/400',
      user: userId,
      community: communityId,
    });

    await newPost.save();
    await Community.findByIdAndUpdate(communityId, {
      $push: {posts: newPost._id},
    });

    console.log('✅ Post created:', newPost);
    res.status(201).json({message: 'Post created successfully', post: newPost});
  } catch (error) {
    console.error('❌ Error creating post:', error);
    res.status(500).json({message: 'Failed to create post.'});
  }
});

app.post('/posts/:postId/like', async (req, res) => {
  const {postId} = req.params;
  const {userId} = req.body;

  try {
    const post = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!post || !user)
      return res.status(404).json({message: 'Post or User not found'});

    const isLiked = post.likes.some(like => like.user.toString() === userId);

    if (isLiked) {
      post.likes = post.likes.filter(like => like.user.toString() !== userId);
      user.likedPosts = user.likedPosts.filter(id => id.toString() !== postId);
    } else {
      post.likes.push({user: userId});
      user.likedPosts.push(postId);
    }

    await post.save();
    await user.save();

    res.status(200).json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      likes: post.likes.length,
      post,
    });
  } catch (error) {
    console.error('Error updating like status:', error);
    res.status(500).json({message: 'Failed to update like status'});
  }
});

app.get('/users/:userId/liked-posts', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('likedPosts');
    if (!user) return res.status(404).json({message: 'User not found'});

    res.status(200).json({likedPosts: user.likedPosts});
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    res.status(500).json({message: 'Failed to fetch liked posts'});
  }
});

app.post('/posts/:postId/comment', async (req, res) => {
  const {postId} = req.params;
  const {userId, text} = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({message: '❌ Post not found.'});

    const comment = {user: userId, text, createdAt: new Date()};
    post.comments.push(comment);
    await post.save();

    res.status(200).json({message: '✅ Comment added.', comment});
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    res.status(500).json({message: 'Failed to add comment.'});
  }
});

app.get('/posts/:postId/comments', async (req, res) => {
  const {postId} = req.params;

  try {
    const post = await Post.findById(postId).populate(
      'comments.user',
      'firstName lastName image',
    );
    if (!post) return res.status(404).json({message: 'Post not found'});

    res.status(200).json({comments: post.comments});
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
    res.status(500).json({message: 'Failed to fetch comments'});
  }
});

app.get('/posts', authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'firstName lastName image')
      .populate('comments.user', 'firstName lastName image');

    res.status(200).json({posts});
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({message: 'Failed to fetch posts'});
  }
});

app.get('/posts/:postId', authenticateToken, async (req, res) => {
  const {postId} = req.params;

  try {
    const post = await Post.findById(postId)
      .populate('user', 'firstName lastName image')
      .populate('comments.user', 'firstName lastName image');

    if (!post) {
      return res.status(404).json({message: 'Post not found'});
    }

    res.status(200).json({post});
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({message: 'Failed to fetch post'});
  }
});

app.put('/user/:userId/privacy', async (req, res) => {
  const {userId} = req.params;
  const {isPrivate} = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, {isPrivate}, {new: true});

    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    res
      .status(200)
      .json({message: 'Privacy setting updated', isPrivate: user.isPrivate});
  } catch (error) {
    console.error('Error updating privacy setting:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

app.post('/beorganizator', async (req, res) => {
  console.log('Request received:', req.body);

  const {firstName, email, reason} = req.body;

  if (!firstName || !email || !reason) {
    return res
      .status(400)
      .json({message: 'Please fill out all required fields.'});
  }

  try {
    const user = await User.findOne({email});

    if (!user) {
      return res.status(404).json({message: 'User not found.'});
    }

    if (user.role === 'organizer') {
      return res.status(400).json({message: 'User is already an organizer.'});
    }

    user.organizerApplication = {
      status: 'pending',
      reason,
      appliedAt: new Date(),
    };

    await user.save();
    return res
      .status(200)
      .json({message: 'Your application has been submitted for review.'});
  } catch (error) {
    console.error('Error submitting organizer application:', error);
    return res
      .status(500)
      .json({message: 'An unexpected error occurred. Please try again later.'});
  }
});

app.get('/pending-organizers', async (req, res) => {
  try {
    const pendingUsers = await User.find(
      {'organizerApplication.status': 'pending'},
      'firstName lastName image organizerApplication reason appliedAt',
    );
    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending organizers:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

app.post('/review-organizer', async (req, res) => {
  const {userId, decision} = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({message: 'User not found.'});
    }

    if (decision === 'approved') {
      user.role = 'organizer';
      user.organizerApplication.status = 'approved';
    } else if (decision === 'rejected') {
      user.organizerApplication.status = 'rejected';
    }

    await user.save();
    res.json({message: `Organizer application ${decision}`});
  } catch (error) {
    console.error('Error reviewing organizer application:', error);
    res.status(500).json({message: 'An error occurred.'});
  }
});

app.post('/communities/:communityId/add-questions', async (req, res) => {
  const {communityId} = req.params;
  const {questions} = req.body;

  try {
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({message: 'Community not found'});
    }

    community.joinQuestions = questions;
    await community.save();

    res.status(200).json({message: 'Questions added successfully', questions});
  } catch (error) {
    console.error('Error adding questions:', error);
    res.status(500).json({message: 'Internal server error'});
  }
});

app.post('/user/acceptFriendRequest', async (req, res) => {
  const {fromUserId, toUserId} = req.body;

  try {
    const targetUser = await User.findById(toUserId);
    const fromUser = await User.findById(fromUserId);

    if (!targetUser || !fromUser) {
      return res.status(404).json({message: 'User not found'});
    }

    targetUser.followers.push(fromUserId);
    fromUser.following.push(toUserId);

    targetUser.friendRequests = targetUser.friendRequests.filter(
      req => req.from.toString() !== fromUserId,
    );

    await targetUser.save();
    await fromUser.save();

    res.status(200).json({message: 'Friend request accepted'});
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({message: 'Error accepting friend request'});
  }
});

app.post('/user/rejectFriendRequest', async (req, res) => {
  const {fromUserId, toUserId} = req.body;

  try {
    const targetUser = await User.findById(toUserId);

    if (!targetUser) {
      return res.status(404).json({message: 'User not found'});
    }

    targetUser.friendRequests = targetUser.friendRequests.filter(
      req => req.from.toString() !== fromUserId,
    );

    await targetUser.save();

    res.status(200).json({message: 'Friend request rejected'});
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({message: 'Error rejecting friend request'});
  }
});

app.get('/organizers', async (req, res) => {
  try {
    const organizers = await User.find({role: 'organizer'}).sort({
      createdAt: -1,
    });
    res.status(200).json(organizers);
  } catch (error) {
    console.error('Error fetching organizers:', error);
    res.status(500).json({message: 'Internal Server Error'});
  }
});

app.post('/users/add-staff', async (req, res) => {
  try {
    const {firstName, email, image} = req.body;

    if (!firstName || !email) {
      return res
        .status(400)
        .json({message: 'Full Name and Email are required'});
    }

    let user = await User.findOne({email});

    if (user) {
      if (user.role === 'staff') {
        return res
          .status(400)
          .json({message: 'User is already a staff member'});
      }
      user.role = 'staff';
    } else {
      user = new User({
        firstName,
        email,
        password: '',
        image: image || 'https://via.placeholder.com/100',
        role: 'staff',
      });
    }

    await user.save();
    res.status(201).json({message: 'Staff added successfully', user});
  } catch (error) {
    console.error('Error adding staff:', error);
    res.status(500).json({message: 'Internal Server Error'});
  }
});

app.get('/staffs', async (req, res) => {
  try {
    console.log('GET /staffs request received');

    const staffs = await User.find({role: 'staff'}).select(
      'firstName email createdAt',
    );

    console.log(`Staffs fetched: ${staffs.length} records`);
    res.status(200).json(staffs);
  } catch (error) {
    console.error('Error fetching staff list:', error);
    res
      .status(500)
      .json({message: 'Internal Server Error', error: error.message});
  }
});

app.delete('/staffs/remove', async (req, res) => {
  try {
    console.log('📌 DELETE /staffs/remove request received:', req.body);

    const {id} = req.body;

    if (!id) {
      console.log('Missing Staff ID');
      return res.status(400).json({message: 'Staff ID is required'});
    }

    const user = await User.findById(id);
    if (!user) {
      console.log('Staff not found');
      return res.status(404).json({message: 'Staff not found'});
    }

    if (user.role !== 'staff') {
      console.log('User is not a staff member');
      return res.status(400).json({message: 'User is not a staff member'});
    }

    user.role = 'user';
    await user.save();

    console.log(`✅ Staff role removed: ${user._id}`);
    res.status(200).json({message: 'Staff role removed successfully'});
  } catch (error) {
    console.error('❌ Error removing staff:', error);
    res
      .status(500)
      .json({message: 'Internal Server Error', error: error.message});
  }
});

app.get('/chats/:userId', async (req, res) => {
  try {
    const {userId} = req.params;

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            {senderId: new mongoose.Types.ObjectId(userId)},
            {receiverId: new mongoose.Types.ObjectId(userId)},
          ],
        },
      },
      {$sort: {timeStamp: -1}},
      {
        $group: {
          _id: {
            user1: {
              $cond: [
                {$eq: ['$senderId', new mongoose.Types.ObjectId(userId)]},
                '$receiverId',
                '$senderId',
              ],
            },
          },
          lastMessage: {$first: '$message'},
          timeStamp: {$first: '$timeStamp'},
          senderId: {$first: '$senderId'},
          receiverId: {$first: '$receiverId'},
        },
      },
    ]);

    const populatedChats = await Promise.all(
      messages.map(async chat => {
        const user = await User.findById(chat._id.user1).select(
          'firstName lastName image',
        );
        if (!user) return null;
        return {...chat, user};
      }),
    );

    res.status(200).json(populatedChats.filter(Boolean));
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({message: 'Server error'});
  }
});

app.get('/communities/:communityId/posts', async (req, res) => {
  const {communityId} = req.params;

  try {
    const posts = await Post.find({community: communityId})
      .populate('user', 'firstName lastName image')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName image',
      });

    res.status(200).json({posts});
  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    res.status(500).json({message: 'Failed to fetch posts.'});
  }
});

app.post('/posts/create', async (req, res) => {
  console.log('Request received:', req.body);
  const {description, userId, communityId, imageUrl} = req.body;

  if (!description || !userId || !communityId) {
    return res.status(400).json({message: 'Eksik alanlar var!'});
  }

  try {
    const newPost = new Post({
      description,
      imageUrl: imageUrl || null,
      user: userId,
      community: communityId,
    });

    await newPost.save();
    res
      .status(201)
      .json({message: 'Post başarıyla oluşturuldu!', post: newPost});
  } catch (error) {
    res.status(500).json({message: 'Post oluşturulamadı!'});
  }
});

app.post('/posts/:postId/like', async (req, res) => {
  const {postId} = req.params;
  const {userId} = req.body;

  try {
    const post = await Post.findById(postId);
    const user = await User.findById(userId);
    if (!post || !user)
      return res.status(404).json({message: '❌ Post or user not found.'});

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
      user.likedPosts = user.likedPosts.filter(id => id.toString() !== postId);
    } else {
      post.likes.push(userId);
      user.likedPosts.push(postId);
    }

    await post.save();
    await user.save();

    res.status(200).json({
      message: '✅ Like status updated.',
      post,
      likedPosts: user.likedPosts,
    });
  } catch (error) {
    console.error('❌ Error liking post:', error);
    res.status(500).json({message: 'Failed to like post.'});
  }
});

app.put('/posts/:postId/comments/:commentId', async (req, res) => {
  const {postId, commentId} = req.params;
  const {text} = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({message: '❌ Post not found.'});

    const comment = post.comments.id(commentId);
    if (!comment)
      return res.status(404).json({message: '❌ Comment not found.'});

    comment.text = text;
    await post.save();

    res.status(200).json({message: '✅ Comment updated.', comment});
  } catch (error) {
    console.error('❌ Error updating comment:', error);
    res.status(500).json({message: 'Failed to update comment.'});
  }
});

app.delete('/posts/:postId/comments/:commentId', async (req, res) => {
  const {postId, commentId} = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({message: '❌ Post not found.'});

    post.comments = post.comments.filter(c => c._id.toString() !== commentId);
    await post.save();

    res.status(200).json({message: '✅ Comment deleted.'});
  } catch (error) {
    console.error('❌ Error deleting comment:', error);
    res.status(500).json({message: 'Failed to delete comment.'});
  }
});

app.put('/posts/:postId', async (req, res) => {
  const {postId} = req.params;
  const {description, imageUrl} = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({message: '❌ Post not found.'});

    post.description = description || post.description;
    if (imageUrl) post.imageUrl = imageUrl;

    await post.save();
    res.status(200).json({message: '✅ Post updated.', post});
  } catch (error) {
    console.error('❌ Error updating post:', error);
    res.status(500).json({message: 'Failed to update post.'});
  }
});

app.delete('/posts/:postId', async (req, res) => {
  const {postId} = req.params;

  try {
    const post = await Post.findByIdAndDelete(postId);
    if (!post) return res.status(404).json({message: '❌ Post not found.'});

    res.status(200).json({message: '✅ Post deleted.'});
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    res.status(500).json({message: 'Failed to delete post.'});
  }
});

app.post('/create-checkout-session/organizer', async (req, res) => {
  const {priceId, userId} = req.body;

  if (!priceId || !userId) {
    return res.status(400).json({error: 'Price ID and User ID are required'});
  }

  console.log(
    `🚀 Creating OrganizerPlus Checkout Session for User ID: ${userId} with Price ID: ${priceId}`,
  );

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{price: priceId, quantity: 1}],
      metadata: {userId, subscriptionType: 'OrganizerPlus'},
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    console.log('✅ OrganizerPlus Checkout session created:', session.id);
    res.json({url: session.url});
  } catch (error) {
    console.error('🚨 Stripe Error:', error);
    res.status(500).json({error: 'Stripe session creation failed'});
  }
});

app.post('/create-checkout-session/user', async (req, res) => {
  try {
    const {priceId, userId} = req.body;

    if (!priceId || !userId) {
      return res.status(400).json({error: 'Price ID and User ID are required'});
    }

    console.log(
      `Creating checkout session for user: ${userId} with priceId: ${priceId}`,
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{price: priceId, quantity: 1}],
      metadata: {userId: userId},
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    console.log('✅ Checkout session created:', session.id);
    res.json({url: session.url});
  } catch (error) {
    console.error('🚨 Stripe Checkout Session Error:', error);
    res.status(500).json({error: error.message});
  }
});

app.post('/cancel-subscription', async (req, res) => {
  try {
    const {subscriptionId, userId} = req.body;

    console.log('🔎 Received subscriptionId:', subscriptionId);
    console.log('🔎 Received userId:', userId);

    if (!subscriptionId || !userId) {
      return res
        .status(400)
        .json({error: 'Subscription ID and User ID are required'});
    }

    await stripe.subscriptions.del(subscriptionId);

    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ User not found');
      return res.status(404).json({error: 'User not found'});
    }

    await User.findByIdAndUpdate(userId, {
      subscriptionType: 'free',
      vipBadge: false,
      stripeSubscriptionId: null,
    });

    res.json({message: 'Subscription canceled successfully.'});
    console.log(`✅ Subscription canceled for User ID: ${userId}`);
  } catch (error) {
    console.error('❌ Cancel Subscription Error:', error);
    res.status(500).json({error: error.message});
  }
});

app.get('/user/:userId/subscription', async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({error: 'User not found'});
    }

    if (!user.stripeCustomerId) {
      return res.json({isSubscribed: false, subscriptionType: null});
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
    });

    let subscriptionType = null;
    let stripeSubscriptionId = null;

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      subscriptionType = subscription.metadata?.subscriptionType || null;
      stripeSubscriptionId = subscription.id;
    }

    return res.json({
      isSubscribed: Boolean(subscriptionType),
      subscriptionType,
      stripeSubscriptionId,
    });
  } catch (error) {
    console.error('❌ Error fetching subscription status:', error.message);
    res.status(500).json({error: 'Internal Server Error'});
  }
});

app.get('/success', (req, res) => {
  res.send('<h1>Payment Successful! 🎉</h1>');
});

app.get('/cancel', (req, res) => {
  res.send('<h1>Payment Canceled ❌</h1>');
});

app.put('/posts/:id/update', async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {description: req.body.description},
      {new: true},
    );
    res
      .status(200)
      .json({message: '✅ Post updated successfully', post: updatedPost});
  } catch (error) {
    res.status(500).json({message: '❌ Failed to update post.'});
  }
});

app.delete('/posts/:id/delete', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({message: '✅ Post deleted successfully'});
  } catch (error) {
    res.status(500).json({message: '❌ Failed to delete post.'});
  }
});
