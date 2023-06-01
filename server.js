const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect('mongodb+srv://miganson2:oSfIivO2ioli5Sm9@cluster0.ewmbdwr.mongodb.net/mydatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.log(err));

// Define a User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

// Create a User model
const User = mongoose.model('User', userSchema);

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Find the user with the provided username and password
  User.findOne({ username, password }, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({ message: 'Login successful', user });
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});