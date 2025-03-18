require("dotenv").config();
const express = require("express"); // import du package express
const app = express(); // création du serveur
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
console.log(process.env.STRIPE_KEY);

const stripe = require("stripe")(process.env.STRIPE_KEY);

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

app.post("/payment", async (req, res) => {
  try {
    // On crée une intention de paiement
    const paymentIntent = await stripe.paymentIntents.create({
      // Montant de la transaction
      amount: req.body.amount,
      // Devise de la transaction
      currency: "usd",
      // Description du produit
      description: req.body.title,
    });
    // On renvoie les informations de l'intention de paiement au client
    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.all("*", (req, res) => {
  // route en GET dont le chemin est /hello
  res.status(404).json("Not found");
});

app.listen(process.env.PORT, () => {
  // Mon serveur va écouter le port 3000
  console.log("Server has started"); // Quand je vais lancer ce serveur, la callback va être appelée
});
