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
const moment = require('moment');
const app = express();
const port = process.env.PORT || 8000;
const generateRoute = require('./routes/generateRoute');
const axios = require('axios');
const refreshTokens = [];
const path = require('path');
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/generate', generateRoute);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.log('Connection error:', error));

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided, unauthorized' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' }); 
      }
  
      req.user = user;
      next();
    });
};
  
app.post('/refresh', async (req, res) => {
  const {token} = req.body;
  if (!token) {
    return res.status(400).json({message: 'Refresh token is required'});
  }

  try {
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
      if (err) return res.status(403).json({message: 'Invalid refresh token'});

      const newAccessToken = jwt.sign(
        {userId: user.userId, role: user.role},
        process.env.JWT_SECRET_KEY,
        {expiresIn: '1h'},
      );

      res.status(200).json({token: newAccessToken});
    });
  } catch (error) {
    res.status(500).json({message: 'Internal Server Error'});
  }
});

app.post('/register', async (req, res) => {
  try {
    console.log('Incoming user data:', req.body);

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

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password : hashedPassword,
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
      } else {
        console.log('Community not found with provided ID');
      }
    }

    const token = jwt.sign(
      {userId: newUser._id, role: newUser.role},
      process.env.JWT_SECRET_KEY,
      {expiresIn: '1h'},
    );

    res.status(201).json({token, role: newUser.role});
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({message: 'Internal Server Error'});
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('Login successful:', email);
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY || 'default_secret_key',
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, userId: user._id, role: user.role });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).json({ message: 'Internal server error' });
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
      .populate('events')
      .populate('followers', 'firstName lastName username image')
      .populate('following', 'firstName lastName username image');

    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    res.status(200).json(user);
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

app.post('/generate', authenticateToken, async (req, res) => {
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

app.post('/createevent', authenticateToken, async (req, res) => {
  console.log('Received event data:', req.body);

  const {
    title,
    description,
    tags,
    location,
    date,
    time,
    eventType,
    totalParticipants,
    organizer,
    images,
    isPaid,
    price,
  } = req.body;

  if (!title || !location || !eventType || !totalParticipants || !organizer) {
    return res
      .status(400)
      .json({message: 'All fields are required except date.'});
  }

  try {
    const newEvent = new Event({
      title,
      description,
      tags,
      location,
      date,
      time,
      eventType,
      totalParticipants,
      organizer,
      images,
      isPaid,
      price: isPaid ? price : null,
    });

    await newEvent.save();
    res.status(200).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error.message);
    res.status(500).json({message: 'Failed to create event.'});
  }
});

app.get('/events', async (req, res) => {
  const {organizerId, role} = req.query;

  try {
    let filter = {};

    if (role === 'organizer' && organizerId) {
      filter = {organizer: mongoose.Types.ObjectId(organizerId)};
    }

    const events = await Event.find(filter).populate('organizer');
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({message: 'Failed to fetch events'});
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

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    await newMessage.save();

    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      console.log('emitting receiveMessage event to the receiver', receiverId);
      io.to(receiverSocketId).emit('newMessage', newMessage);
    } else {
      console.log('Receiver socket ID not found');
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log('ERROR', error);
  }
});

app.get('/messages', async (req, res) => {
  try {
    const {senderId, receiverId} = req.query;

    const messages = await Message.find({
      $or: [
        {senderId: senderId, receiverId: receiverId},
        {senderId: receiverId, receiverId: senderId},
      ],
    }).populate('senderId', '_id name');

    res.status(200).json(messages);
  } catch (error) {
    console.log('Error', error);
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
    const users = await User.find({}, 'firstName lastName image');
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
      select: 'title location date time',
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
    const venue = await Venue.findById(venueId).populate('eventsAvailable');
    if (!venue) return res.status(404).json({message: 'Venue not found'});

    const events = venue.eventsAvailable.map(event => ({
      _id: event._id,
      title: event.title,
      eventType: event.eventType,
      price: event.price,
      location: event.location,
      date: event.date,
      time: event.time,
    }));

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).json({message: 'Internal Server Error'});
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
  const { eventId } = req.params;
  const updateData = req.body;

  try {
    const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
    });

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error.message);
    res.status(500).json({ message: 'Failed to update event', error: error.message });
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
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    try {
      const {eventId} = req.params;
      const {userId, comment} = req.body;

      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({message: 'Event not found.'});
      }

      const newReview = {userId, review: comment, date: new Date()};
      event.reviews.push(newReview);
      await event.save();

      res
        .status(201)
        .json({message: 'Review added successfully', review: newReview});
    } catch (error) {
      console.error('Error adding review:', error.message);
      res
        .status(500)
        .json({message: 'Failed to add review.', error: error.message});
    }
  },
);

app.get('/events/:eventId/reviews', async (req, res) => {
  try {
    const eventId = mongoose.Types.ObjectId(req.params.eventId);

    // event'i reviews alanıyla beraber çekiyoruz
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({message: 'Event not found'});
    }

    res.json(event.reviews);
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
  const { fromUserId, toUserId } = req.body;

  try {
    const targetUser = await User.findById(toUserId);
    const followingUser = await User.findById(fromUserId);

    if (!targetUser || !followingUser) {
      return res.status(404).json({ message: 'User not found' });
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
      res.status(200).json({ message: 'Follow request sent successfully' });
    } else {
      if (!targetUser.followers.includes(fromUserId)) {
        targetUser.followers.push(fromUserId);
      }
      if (!followingUser.following.includes(toUserId)) {
        followingUser.following.push(toUserId);
      }

      await targetUser.save();
      await followingUser.save();
      res.status(200).json({ message: 'User followed successfully' });
    }
  } catch (error) {
    console.error('Error handling follow request:', error);
    res.status(500).json({
      message: 'Failed to handle follow request',
      error: error.message,
    });
  }
});

app.post('/communities', authenticateToken, async (req, res) => {
  const {name, description, tags, isPrivate, headerImage, profileImage, links} =
    req.body;
  const organizerId = req.user.userId;

  if (!name || !description) {
    return res
      .status(400)
      .json({message: 'Name and description are required.'});
  }

  try {
    const newCommunity = new Community({
      name,
      description,
      tags,
      isPrivate,
      headerImage,
      profileImage,
      links,
      organizer: organizerId,
    });

    const savedCommunity = await newCommunity.save();

    await User.findByIdAndUpdate(
      organizerId,
      {$push: {communities: savedCommunity._id}},
      {new: true},
    );

    res.status(201).json(savedCommunity);
  } catch (error) {
    console.error('Topluluk oluşturma hatası:', error);
    res.status(500).json({message: 'Topluluk oluşturulamadı.'});
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

app.post('/communities/:communityId/join', async (req, res) => {
  const { communityId } = req.params;
  const { answers, userId } = req.body;

  try {
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!community.isPrivate) {
      if (!community.members.includes(userId)) {
        community.members.push(userId);
        await community.save();
      }
      return res.status(200).json({ message: 'Joined community' });
    }

    community.joinRequests.push({ userId, answers, status: 'pending' });
    await community.save();
    return res.status(200).json({ message: 'Join request sent' });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get(
  '/communities/:communityId/requests',
  authenticateToken,
  async (req, res) => {
    const {communityId} = req.params;

    try {
      const community = await Community.findById(communityId).populate(
        'joinRequests.userId',
        'firstName lastName image'
      );

      if (!community) {
        return res.status(404).json({message: 'Community not found'});
      }

      if (req.user.userId !== community.organizer.toString()) {
        return res.status(403).json({message: 'Unauthorized access'});
      }

      const pendingRequests = community.joinRequests.filter(
        request => request.status === 'pending'
      );
      res.status(200).json(pendingRequests);
    } catch (error) {
      console.error('Error fetching join requests:', error);
      res.status(500).json({message: 'Internal server error'});
    }
  }
);
app.post(
  '/communities/:communityId/accept-request',
  authenticateToken,
  async (req, res) => {
    const { communityId } = req.params;
    const { requestId } = req.body;

    try {
      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }

      if (req.user.userId !== community.organizer.toString()) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      const request = community.joinRequests.id(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      request.status = 'approved';
      community.members.push(request.userId);
      await community.save();

      res.status(200).json({ message: 'Request approved successfully' });
    } catch (error) {
      console.error('Error approving request:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

app.post(
  '/communities/:communityId/reject-request',
  authenticateToken,
  async (req, res) => {
    const { communityId } = req.params;
    const { requestId } = req.body;

    try {
      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }

      if (req.user.userId !== community.organizer.toString()) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      const request = community.joinRequests.id(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      request.status = 'rejected';
      await community.save();

      res.status(200).json({ message: 'Request rejected successfully' });
    } catch (error) {
      console.error('Error rejecting request:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

app.get('/communities/:communityId', async (req, res) => {
  const { communityId } = req.params;
  try {
    const community = await Community.findById(communityId)
      .populate('members', 'firstName lastName image')
      .populate('joinRequests.userId', 'firstName lastName');
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    res.json(community);
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/communities/:communityId/name', authenticateToken, async (req, res) => {
  const { communityId } = req.params;
  const { name } = req.body;

  console.log('Update request for community name:', name);

  try {
    const community = await Community.findByIdAndUpdate(communityId, { name }, { new: true });
    if (!community) {
      console.error('Community not found for ID:', communityId);
      return res.status(404).json({ message: 'Community not found' });
    }

    res.status(200).json(community);
  } catch (error) {
    console.error('Error updating community name:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.put('/communities/:communityId/description', authenticateToken, async (req, res) => {
  const { communityId } = req.params;
  const { description } = req.body;

  console.log('Update request for community description:', description);

  try {
    const community = await Community.findByIdAndUpdate(communityId, { description }, { new: true });
    if (!community) {
      console.error('Community not found for ID:', communityId);
      return res.status(404).json({ message: 'Community not found' });
    }

    res.status(200).json(community);
  } catch (error) {
    console.error('Error updating community description:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/communities/:communityId/send-request', async (req, res) => {
  const { communityId } = req.params;
  const { answers, userId } = req.body;

  try {
    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const existingRequest = community.joinRequests.find(
      (request) => request.userId.toString() === userId
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Join request already exists' });
    }

    community.joinRequests.push({ userId, answers, status: 'pending' });
    await community.save();

    return res.status(200).json({ message: 'Join request sent' });
  } catch (error) {
    console.error('Error sending join request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/posts/create', authenticateToken, async (req, res) => {
  const { description, imageUrl, userId } = req.body;

  if (!description || !userId) {
    return res.status(400).json({ message: 'Description and user ID are required.' });
  }

  try {
    const newPost = new Post({
      description,
      imageUrl,
      user: userId,
    });

    await newPost.save();
    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Failed to create post.' });
  }
});

app.post('/posts/:postId/like', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isLiked = post.likes.some(like => like.user.toString() === userId);

    if (isLiked) {
      post.likes = post.likes.filter(like => like.user.toString() !== userId);
    } else {
      post.likes.push({ user: userId });
    }

    await post.save();
    res.status(200).json({ message: isLiked ? 'Post unliked' : 'Post liked', post });
  } catch (error) {
    console.error('Error updating like status:', error);
    res.status(500).json({ message: 'Failed to update like status' });
  }
});

app.post('/posts/:postId/comment', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { userId, text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ user: userId, text });
    await post.save();

    res.status(200).json({ message: 'Comment added', post });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

app.get('/posts', authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'firstName lastName image')
      .populate('comments.user', 'firstName lastName image');

    res.status(200).json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

app.get('/posts/:postId', authenticateToken, async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId)
      .populate('user', 'firstName lastName image')
      .populate('comments.user', 'firstName lastName image');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
});

app.put('/user/:userId/privacy', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { isPrivate } = req.body;

  if (req.user.userId !== userId) {
    return res.status(403).json({ message: 'You are not authorized to update this user' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isPrivate },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Privacy setting updated', isPrivate: user.isPrivate });
  } catch (error) {
    console.error('Error updating privacy setting:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
