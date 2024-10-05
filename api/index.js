const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const moment = require('moment');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const crypto = require('crypto');

const User = require('./models/user');
const Event = require('./models/event');
const Venue = require('./models/venue');

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to database');
  })
  .catch(error => {
    console.log('Connection failed', error);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post('/register', async (req, res) => {
  try {
    const userData = req.body;

    const newUser = new User(userData);

    await newUser.save();

    const secretKey = crypto.randomBytes(32).toString('hex');

    const token = jwt.sign({userId: newUser._id}, secretKey);

    res.status(200).json({token});
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;

    const user = await User.findOne({email});

    if (!user) {
      return res.status(404).send('User not found');
    }
    if (user.password !== password) {
      return res.status(401).send('Invalid password');
    }
    const secretKey = crypto.randomBytes(32).toString('hex');
    const token = jwt.sign({id: user._id}, secretKey);
    res.status(200).json({token});
  } catch (error) {
    console.log(error);
  }
});

app.get('/user/:userId', async (req, res) => {
  try {
    const {userId} = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(500).json({message: 'User not found'});
    }

    return res.status(200).json({user});
  } catch (error) {
    res.status(500).json({message: 'Error fetching the user details'});
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

app.post('/createevent', async (req, res) => {
  try {
    const { title, eventType, date, time, location, organizer, totalParticipants } = req.body;

    // if (!title || !eventType || !date || !time || !location ) {
    //   return res.status(400).json({ message: 'All fields are required.' });
    // }

    const newEvent = new Event({
      title,
      eventType,
      date,
      time,
      location,
      organizer,
      totalParticipants,
      attendees: [organizer],
    });

    const savedEvent = await newEvent.save();
    res.status(200).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).send('Internal Server Error');
  }
});
