require("dotenv").config();
const express = require("express"); // import du package express
const app = express(); // création du serveur
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

app.use(express.json()); // param body
app.use(cors());

mongoose.connect(process.env.MONGODB_URI); // connecter a notre serveur

//connexion au compte cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const userRoute = require("./Routes/user");
const offerRoute = require("./Routes/offers");

app.use(userRoute);
app.use(offerRoute);

app.get("/", (req, res) => {
  res.json({ message: "Welcome on my vinted server" });
});
app.get("/keziah", (req, res) => {
  res.json({ message: "SALUT MON POTE JE SUIS EN RP MANSOUR" });
});

app.all("*", (req, res) => {
  // route en GET dont le chemin est /hello
  res.status(404).json("Not found");
});

app.listen(process.env.PORT, () => {
  // Mon serveur va écouter le port 3000
  console.log("Server has started"); // Quand je vais lancer ce serveur, la callback va être appelée
});
