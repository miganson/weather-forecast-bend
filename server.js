require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

// Define a User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

// Create a User model
const User = mongoose.model("User", userSchema);

app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  // Check if the username already exists
  User.findOne({ username }).then((existingUser) => {
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Hash the password and create a new user
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }

      const newUser = new User({ username, password: hashedPassword });
      return newUser
        .save()
        .then((savedUser) => {
          return res
            .status(201)
            .json({ message: "Signup successful", user: savedUser });
        })
        .catch((err) => {
          return res.status(500).json({ message: "Internal server error" });
        });
    });
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare the provided password with the stored hashed password
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Internal server error" });
        }

        if (result) {
          return res.json({ message: "Login successful", user });
        } else {
          return res.status(401).json({ message: "Invalid credentials" });
        }
      });
    })
    .catch((err) => {
      return res.status(500).json({ message: "Internal server error" });
    });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
