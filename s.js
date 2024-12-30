const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
require('dotenv').config();
const multer = require('multer');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all origins

const router = express.Router(); // Initialize the router

// Middleware

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setTimeout(60000, () => { // Increase to 60 seconds
    console.log('Request timed out');
  });
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Make email unique
  password: { type: String, required: true },
  
});

const User = mongoose.model('User', userSchema);

app.set('timeout', 60000); // Set timeout to 60 seconds


// Signup Route
app.post('/api/send-otp', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
  otpStore.set(email, otp); // Store OTP in memory

  // Send OTP via email
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Your OTP for Signup',
    text: `Your OTP is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error('Error sending OTP:', error);
      return res.status(500).json({ message: 'Failed to send OTP' });
    }
    console.log(`OTP sent to ${email}: ${otp}`);
    res.status(200).json({ message: 'OTP sent successfully' });
  });
});

// Endpoint to Verify OTP
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const storedOtp = otpStore.get(email);

  if (parseInt(otp) === storedOtp) {
    otpStore.delete(email); // Remove OTP after successful verification
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
});

// Endpoint to Finalize Signup

 
  app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
  
    try {
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      await user.save();
      console.log('User created:', user);
      res.status(201).send({ message: 'User created successfully' });
    } catch (error) {
      console.error('Error creating user:', error.message);
      if (error.code === 11000) {
        if (error.keyValue && error.keyValue.email) {
          return res.status(400).send({ message: 'Email already exists' });
        } else if (error.keyValue && error.keyValue.username) {
          return res.status(400).send({ message: 'Username already exists' });
        }
      } else {
        return res.status(500).send('Error creating user: ' + error.message);
      }
    }
  });
  

// Login Route
app.post('/api/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  
  console.log('Login Request:', req.body); // Log login request data

  try {
    // Check if user exists by username or email
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });

    if (!user) {
      console.warn('Login failed: User not found'); // Log warning
      return res.status(401).send('Invalid credentials: User not found');
    }

    // Compare the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.warn('Login failed: Incorrect password'); // Log warning
      return res.status(401).send('Invalid credentials: Incorrect password');
    }

    // Successful login
    console.log('Login successful for user:', user.username);
    return res.status(200).send({ message: 'Login successful', token: 'your_generated_token_here' }); // Send a token or user info if needed

  } catch (error) {
    
    console.error('Server error during login:', error.message); // Log server error
    res.status(500).send('Server error: ' + error.message);
  }
});
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS  // Your email password or app password
  }
});

// Forgot Password Endpoint
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiration time (e.g., 10 minutes)
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP and expiration time to the user's record
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    // Send the OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Password Reset OTP',
      html: `
        <h1>Password Reset OTP</h1>
        <p>Your One-Time Password (OTP) is:</p>
        <h2>${otp}</h2>
        <p>This OTP will expire in 10 minutes.</p>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Failed to send OTP' });
      }
      console.log('OTP email sent:', info.response);
      res.json({ message: 'OTP sent to your email' });
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify OTP Endpoint
app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if the OTP has expired
    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Clear the OTP after successful verification
    user.otp = null;
    user.otpExpiresAt = null;
    await User.save();

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.post('/api/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Find user in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Save updated user to the database
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    if (users.length === 0) {
      return res.status(404).send({ message: 'No users found' });
    }
    res.status(200).send({
      message: 'Users fetched successfully',
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
      })),
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send({ message: 'Error fetching users', error: err.message });
  }
});
// Get All Users Route
// Get All Users Route
// Delete User Route
app.delete('/api/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).send({ message: 'Failed to delete user', error: err.message });
  }
});
const API_KEY = process.env.IMGBB_API_KEY;

// Define the event schema with event_location
const eventSchema = new mongoose.Schema({
  event_name: String,
  description: String,
  event_time: Date,
  event_speaker:String,
  event_location: String, // Added event_location field
  image_url: String
});
const Event = mongoose.model('Event12', eventSchema);

// Multer setup for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Upload image to ImgBB
async function uploadImageToImgBB(imageBuffer) {
  const formData = new FormData();
  formData.append('image', imageBuffer.toString('base64'));

  try {
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${API_KEY}`, formData, {
          headers: formData.getHeaders(),
      });
      
      if (response.data && response.data.data && response.data.data.url) {
          console.log("Image uploaded successfully:", response.data.data.url);
          return response.data.data.url;
      } else {
          console.error("ImgBB response missing data:", response.data);
          return null;
      }
  } catch (error) {
      console.error("Error uploading image:", error);
      return null;
  }
}

// API route to handle uploads
app.post('/upload', upload.single('image'), async (req, res) => {
  const { event_name, description,event_speaker, event_time, event_location } = req.body;
  const image = req.file;

  try {
      // Check if image is provided
      if (!image) {
          console.error("No image file provided");
          return res.status(400).json({ error: "No image file provided" });
      }
      
      // Debugging log to ensure image buffer exists
      console.log("Image buffer received:", image.buffer);

      // Attempt to upload the image and get the URL
      const imageUrl = await uploadImageToImgBB(image.buffer);

      if (!imageUrl) {
          console.error("Image URL generation failed");
          return res.status(500).json({ error: "Failed to upload image to ImgBB" });
      }

      // Create and save new event with image URL and event_location
      const newEvent = new Event({
          event_name,
          description,
          event_speaker,
          event_time,
          event_location, // Add event_location to the new event
          image_url: imageUrl
      });

      await newEvent.save();
      console.log("Event uploaded successfully:", newEvent);
      res.status(201).json({ message: "Event uploaded successfully", event: newEvent, imageUrl });
  } catch (error) {
      console.error("Error saving event:", error);
      res.status(500).json({ error: "Failed to upload event" });
  }
});

// API route to get all events
app.get('/api/events', async (req, res) => {
  try {
      const events = await Event.find();
      if (events.length === 0) {
          return res.status(404).send({ message: 'No events found' });
      }
      res.status(200).send({ message: 'Events fetched successfully', events });
  } catch (err) {
      console.error('Error fetching events:', err);
      res.status(500).send({ message: 'Error fetching events', error: err.message });
  }
});

// API route to delete an event by ID
app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  console.log("Event ID to delete:", id);

  // Validate the ID format (assuming MongoDB's 24-character hexadecimal format)
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).send({ message: 'Invalid event ID format' });
  }

  try {
      // Attempt to find and delete the event by its ID
      const deletedEvent = await Event.findByIdAndDelete(id);

      if (!deletedEvent) {
          // If no event is found with the given ID, return a 404 status
          return res.status(404).send({ message: 'Event not found' });
      }

      // Return a success message and the deleted event data
      res.status(200).send({ message: 'Event deleted successfully', event: deletedEvent });
  } catch (err) {
      // Handle any unexpected errors during deletion
      console.error('Error deleting event:', err);
      res.status(500).send({ message: 'Error deleting event', error: err.message });
  }
});

async function uploadImageToImgBB(imageBuffer) {
  const formData = new FormData();
  formData.append('image', imageBuffer.toString('base64'));

  try {
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${API_KEY}`,
      formData,
      { headers: formData.getHeaders() }
    );

    if (response.data && response.data.data && response.data.data.url) {
      console.log('Image uploaded successfully:', response.data.data.url);
      return response.data.data.url;
    } else {
      console.error('ImgBB response missing data:', response.data);
      return null;
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}
const imageSchema = new mongoose.Schema({
  data: Buffer,
  contentType: String,
  url: String, // Store the ImgBB URL here
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
// API endpoint to handle image upload
app.post('/upload2', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload the image to ImgBB
    const imageUrl = await uploadImageToImgBB(req.file.buffer);
    
    if (!imageUrl) {
      return res.status(500).json({ error: 'Failed to upload image to ImgBB' });
    }

    // Save the image data (image URL) to MongoDB
    const newImage = new Image({
      data: req.file.buffer,
      contentType: req.file.mimetype,
      url: imageUrl, // Save ImgBB URL in the database
    });

    await newImage.save();
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});
// Express server example
app.get('/images', async (req, res) => {
  try {
    const images = await Image.find();  // Find all image documents
    const imageUrls = images.map(image => image.url);  // Extract URL from each document

    // Optional: Set cache headers to allow the browser to cache the images for faster loading
    res.setHeader('Cache-Control', 'public, max-age=31536000');  // Cache images for a year

    res.json(imageUrls);  // Send back an array of image URLs as JSON
    console.log("Images fetched");
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

app.use(express.json());

// Function to generate OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
}

app.post('/api/sendOtp', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
  const normalizedEmail = email.trim().toLowerCase();

  otpStore[normalizedEmail] = { otp, timestamp: Date.now() };
  console.log('OTP generated and stored:', otpStore[normalizedEmail]);

  // Simulate sending OTP (in real case, integrate an email/SMS service)
  res.status(200).json({ message: 'OTP sent successfully', otp }); // Remove OTP from response in production
});

otpStore={}
// API to send OTP to the user's email
app.post('/api/signup1', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const otp = generateOtp();
  otpStore[email] = otp; // Store OTP temporarily in memory

  // Setup Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other services (e.g., SendGrid, Mailgun)
    auth: {
      user: process.env.EMAIL_USER, // Use your email
      pass:process.env.EMAIL_PASS ,  // Use your email password or app password
    },
  });

  // Send OTP email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Signup',
    text: `Your OTP is ${otp}. Please use this OTP to verify your account.`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return res.status(500).json({ message: 'Error sending OTP', error: err });
    }
    console.log(`OTP sent to ${email}: ${otp}`);
    res.status(200).json({ message: 'OTP sent successfully' });
    console.log('OTP sent successfully');
  });
});

// API to verify the OTP
// Replace with a proper store like Redis in production

app.post('/api/verifyOtp', async (req, res) => {
  const { email, username, password, otp } = req.body;

  // Validate request fields
  if (!email || !otp || !username || !password) {
    return res.status(400).json({ message: 'Email, OTP, username, and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  console.log('Normalized email:', normalizedEmail);

  // Retrieve OTP data from otpStore
  const otpData = otpStore[normalizedEmail];
  console.log('Retrieved OTP data:', otpData);

  // Verify OTP
  if (!otpData || String(otpData) !== String(otp)) {
    return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
  }

  // Delete OTP after successful verification
  delete otpStore[normalizedEmail];

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const user = new User({ username: username.trim(), email: normalizedEmail, password: hashedPassword });

    // Save the user
    await user.save();

    console.log('User created:', user);
    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error.message);

    // Handle duplicate key error
    if (error.code === 11000) {
      if (error.keyValue && error.keyValue.email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      if (error.keyValue && error.keyValue.username) {
        return res.status(400).json({ message: 'Username already exists' });
      }
    }

    // Generic error response
    return res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});


app.put('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  console.log("Event update :", id);
  const updatedData = req.body;

  try {
    const event = await Event.findByIdAndUpdate(id, updatedData, { new: true });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});
app.get('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  console.log("Event :", id);
  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Add a createdAt field to the schema with a default value of the current date
const userRoleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  linkedinlink:{type: String, required: true },
  image_url: { type: String, required: true },
  createdAt: String, // String to match your data format
});

const UserRole = mongoose.model('UserRole1', userRoleSchema); // Ensure the collection name matches

// API to fetch distinct year ranges
app.get('/api/yearRanges', async (req, res) => {
  try {
    // Fetch distinct values of createdAt from the UserRole1 collection
    const yearRanges = await UserRole.distinct('createdAt');
    console.log('Year ranges fetched successfully:', yearRanges);
    res.status(200).json({ message: 'Year ranges fetched successfully', yearRanges });
  } catch (error) {
    console.error('Error fetching year ranges:', error);
    res.status(500).json({ message: 'Failed to fetch year ranges' });
  }
});
app.get('/api/userRoles1', async (req, res) => {
  try {
    const { createdAt } = req.query;

    if (!createdAt) {
      return res.status(400).json({ message: 'Year range is required' });
    }

    // Fetch users for the selected year range
    const users = await UserRole.find({ createdAt });

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found for the given year range' });
    }

    res.status(200).json({ message: 'Users fetched successfully', users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Upload image to ImgBB
async function uploadImageToImgBB(imageBuffer) {
  const formData = new FormData();
  formData.append('image', imageBuffer.toString('base64'));

  try {
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${API_KEY}`, formData, {
          headers: formData.getHeaders(),
      });

      if (response.data && response.data.data && response.data.data.url) {
          console.log("Image uploaded successfully:", response.data.data.url);
          return response.data.data.url;
      } else {
          console.error("ImgBB response missing data:", response.data);
          return null;
      }
  } catch (error) {
      console.error("Error uploading image:", error);
      return null;
  }
}

// API route to handle uploads
app.post('/upload1', upload.single('image'), async (req, res) => {
  const { name, email, role, department,linkedinlink, createdAt } = req.body; // Include createdAt input
  const image = req.file;

  // Validate required fields
  if (!name || !email || !role || !department || !linkedinlink || !createdAt) { // Check for createdAt
      return res.status(400).json({ error: "name, email, role, department, and createdAt are required." });
  }

  // Validate the academic year format (YYYY-YYYY)
  if (!name || !email || !role || !department || !linkedinlink || !createdAt) {
    return res.status(400).json({ error: "name, email, role, department, and createdAt are required." });
  }

  const academicYearPattern = /^\d{4}-\d{4}$/;
  if (!academicYearPattern.test(createdAt)) {
    return res.status(400).json({ error: "Invalid academic year format. Use 'YYYY-YYYY'." });
  }

  if (!image) {
      console.error("No image file provided");
      return res.status(400).json({ error: "No image file provided" });
  }

  try {
      // Attempt to upload the image and get the URL
      const imageUrl = await uploadImageToImgBB(image.buffer);

      if (!imageUrl) {
          console.error("Image URL generation failed");
          return res.status(500).json({ error: "Failed to upload image to ImgBB" });
      }

      // Create and save new UserRole with image URL
      const newUserRole = new UserRole({
          name,
          email,
          role,
          department,
          linkedinlink,
          image_url: imageUrl,
          createdAt // Save user-provided academic year
      });

      await newUserRole.save();
      console.log("UserRole uploaded successfully:", newUserRole);
      res.status(201).json({ message: "UserRole uploaded successfully", UserRole: newUserRole });
  } catch (error) {
      console.error("Error saving UserRole:", error);
      res.status(500).json({ error: "Failed to upload UserRole" });
  }
});

// Node.js Express route to filter users by a specified year range
app.get('/api/userRoles', async (req, res) => {
  const { startYear, endYear } = req.query;

  const filter = {};
  if (startYear && endYear) {
    filter.createdAt = {
      $gte: new Date(`${startYear}-01-01`),
      $lt: new Date(`${endYear}-12-31`),
    };
  }

  try {
    const userRoles = await UserRole.find(filter);
    res.status(200).json({ message: 'User roles fetched successfully', userRoles });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user roles', error: error.message });
  }
});

app.delete('/api/userRoles/:id', async (req, res) => {
  const { id } = req.params; // Get user ID from request parameters

  try {
    const deletedUserRole = await UserRole.findByIdAndDelete(id); // Delete user role from the database

    if (!deletedUserRole) {
      return res.status(404).send({ message: 'User role not found' }); // If not found, send a 404 error
    }

    console.log('User role deleted successfully');
    res.status(200).send({ message: 'User role deleted successfully', userRole: deletedUserRole });
  } catch (error) {
    console.error('Error deleting user role:', error.message); // Log the error for debugging
    res.status(500).send({ message: 'Error deleting user role', error: error.message });
  }
});
app.get('/api/userRoles/yearRange/:year', async (req, res) => {
  const { year } = req.params;

  // Validate year format
  const academicYearPattern = /^\d{4}-\d{4}$/;
  if (!academicYearPattern.test(year)) {
    return res.status(400).json({ error: "Invalid academic year format. Use 'YYYY-YYYY'." });
  }

  try {
    // Fetch users matching the academic year
    const users = await UserRole.find({ createdAt: year });
    res.status(200).json({ message: "Users fetched successfully", users });
  } catch (error) {
    console.error("Error fetching users by year range:", error);
    res.status(500).json({ error: "Failed to fetch users by year range" });
  }
});
const roleSchema = new mongoose.Schema({
  roleName: { type: String, required: true },
  rank: { type: Number, required: true }
});

const RoleModel = mongoose.model('Role', roleSchema);

// API Endpoint to add a new role with rank
app.post('/api/addNewRole', async (req, res) => {
  try {
    const { role, rank } = req.body;

    // Create a new role document
    const newRole = await RoleModel.create({
      roleName: role,
      rank: rank
    });
    console.log('Role added',newRole );
    res.status(200).json({ message: 'Role added successfully', role: newRole });

  } catch (err) {
    console.error('Failed to add new role:', err);
    res.status(500).json({ message: 'Failed to add role', error: err.message });
  }
});
// Endpoint to fetch unique year ranges
app.get('/api/getRoles', async (req, res) => {
  try {
    // Fetch all roles from the database
    const roles = await RoleModel.find({});
    console.log('Roles fetched:', roles);
    res.status(200).json({ message: 'Roles fetched successfully', roles });
  } catch (err) {
    console.error('Failed to fetch roles:', err);
    res.status(500).json({ message: 'Failed to fetch roles', error: err.message });
  }
});


const closeSchema = new mongoose.Schema({
  year: { type: String, required: true },           // Year range as a string, e.g., "2023-2022"
  hidden: { type: Boolean, required: true },         // Whether the delete button is hidden
  showToggleDelete: { type: Boolean, default: true }, // Controls visibility of the Toggle Delete button
  timestamp: { type: Date, default: Date.now },      // Timestamp for when the action was taken
});

const Close = mongoose.model('Close', closeSchema);


app.post('/api/userRoles/hideYear', async (req, res) => {
  const { year, hidden } = req.body;

  try {
    await Close.findOneAndUpdate(
      { year },
      { hidden, timestamp: new Date() },
      { upsert: true } // Insert if it doesn't exist
    );
    console.log('Closed successfully');
    res.json({ message: 'Year visibility saved successfully in Close collection' });
  } catch (error) {
    console.log('Failed to close');
    res.status(500).json({ message: 'Failed to save year visibility', error });
  }
});
app.post('/api/userRoles/hideToggleDelete', async (req, res) => {
  const { year } = req.body;

  try {
    // Update or insert a record for the year, setting `showToggleDelete` to false
    await Close.findOneAndUpdate(
      { year },
      { showToggleDelete: false, hidden: true },
      { upsert: true, new: true }
    );

    res.json({ message: 'Toggle Delete visibility updated successfully' });
  } catch (error) {
    console.error('Failed to update visibility:', error);
    res.status(500).json({ message: 'Failed to update visibility', error });
  }
});

app.get('/api/userRoles/hiddenYears', async (req, res) => {
  try {
    const hiddenYears = await Close.find({ hidden: true }, 'year hidden').exec();
    res.json(hiddenYears);
  } catch (error) {
    console.log('Failed to fetch hidden years');
    res.status(500).json({ message: 'Failed to retrieve hidden years', error });
  }
});

app.post('/send', (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Use environment variable
      pass: process.env.EMAIL_PASS  // Use environment variable
    },
  });

  const mailOptions = {
    from: email,
    to: 'v.gugan16@gmail.com',
    subject: `Message from ${name}`,
    text: `You have received a new message from your portfolio form.\n\nHere are the details:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ error: error.toString() }); // Send JSON response with error
    }
    res.status(200).json({ message: 'Email sent: ' + info.response }); // Send JSON response on success
  });
});
  


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
