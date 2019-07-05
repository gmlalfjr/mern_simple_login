const express = require("express");
const router = express.Router();
const User = require("../../model/User");
const bcyrpt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");

router.post("/", (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  //   validation
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ msg: "pls enter all field" });
  }

  User.findOne({ email }).then(user => {
    if (user) return res.status(400).json({ msg: "User Already Exists" });

    const newUser = new User({
      first_name,
      last_name,
      email,
      password
    });

    bcyrpt.genSalt(10, (err, salt) => {
      bcyrpt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save().then(user => {
          jwt.sign(
            { id: user.id },
            config.get("jwtSecret"),
            {
              expiresIn: 3600
            },
            (err, token) => {
              if (err) throw err;

              res.json({
                token,
                user: {
                  id: user.id,
                  first_name: user.first_name,
                  last_name: user.last_name,
                  email: user.email
                }
              });
            }
          );
        });
      });
    });
  });
});

router.get("/all", (req, res) => {
  User.find().then(users => res.json(users));
});

module.exports = router;
