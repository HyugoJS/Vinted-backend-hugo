const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};
const User = require("../Models/User");

router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    //console.log(req.body.password);
    const salt = uid2(16);
    //console.log(salt);
    const token = uid2(64);
    //console.log(token);
    const passwordSalt = req.body.password + salt;
    //console.log(passwordSalt);
    const hash = SHA256(passwordSalt).toString(encBase64);
    //console.log(hash);
    if (req.files) {
      const convertedPicture = convertToBase64(req.files.picture); // pour ajouter une photo

      const cloudinaryResponse = await cloudinary.uploader.upload(
        convertedPicture
      );
    } else {
      cloudinaryResponse = null;
    }

    const existEmail = await User.findOne({ email: req.body.email });
    if (existEmail) {
      return res.json(token);
    } else if (req.body.username === "") {
      return res.json("You have to choose a username");
    }

    const newUser = new User({
      email: req.body.email,
      account: {
        username: req.body.username,
        // avatar: cloudinaryResponse.secure_url,
      },
      newsletter: req.body.newsletter,
      token: token,
      hash: hash,
      salt: salt,
    });
    const response = {
      _id: newUser._id,
      token: token,
      account: { username: req.body.username },
    };

    await newUser.save();
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const existEmail = await User.findOne({ email: req.body.email });
    //console.log(existEmail);
    //console.log(existEmail.salt);
    const hash2 = SHA256(req.body.password + existEmail.salt).toString(
      encBase64
    );

    console.log(hash2);

    if (!existEmail) {
      return res.json("No account has been created whith this email");
    } else {
      if (hash2 === existEmail.hash) {
        return res.json(existEmail.token);
      } else {
        return res.json("The email / password combination is wrong");
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
