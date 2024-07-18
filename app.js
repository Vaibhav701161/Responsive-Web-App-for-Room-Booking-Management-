// app.js

const express = require('express');
const mongoose = require('mongoose');
const twilio = require('twilio');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
  
  
  


// Twilio client setup
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// MongoDB Schema and Model
const bookingSchema = new mongoose.Schema({
  room: String,
  checkIn: Date,
  checkOut: Date,
  guestName: String,
  roomType: String,
  checkInMeter: Number,
  checkOutMeter: Number,
  phoneNumber: String
});

const Booking = mongoose.model('Booking', bookingSchema);

// Routes
app.post('/api/bookings', async (req, res) => {
  console.log('Received booking request:', req.body);
  try {
    const booking = new Booking(req.body);
    await booking.save();
    console.log('Booking saved:', booking);

    // Generate and send WhatsApp message
    const message = generateBookingMessage(booking);
    await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${booking.phoneNumber}`
    });
    console.log('WhatsApp message sent');

    res.status(201).json({ message: 'Booking created and WhatsApp message sent', booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  console.log('Received request for bookings');
  try {
    const bookings = await Booking.find();
    console.log('Fetched bookings:', bookings);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
  }
});

// Helper function to generate booking message
function generateBookingMessage(booking) {
  const formattedCheckIn = new Date(booking.checkIn).toLocaleDateString();
  const formattedCheckOut = new Date(booking.checkOut).toLocaleDateString();

  return `Hello ${booking.guestName}, your booking details are as follows:
Room: ${booking.room}
Room Type: ${booking.roomType}
Check-In: ${formattedCheckIn}
Check-Out: ${formattedCheckOut}
`;
}

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
