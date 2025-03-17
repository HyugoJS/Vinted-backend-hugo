const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

const Offer = require("../Models/Offer");
const User = require("../Models/User");

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

const isAuthenticated = require("../middlewares/isAuthenticated");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const token = req.headers.authorization.replace("Bearer ", "");
      const user = await User.findOne({ token: token });
      //console.log(user);
      //console.log(req.body);
      const convertedPicture = convertToBase64(req.files.picture);

      const cloudinaryResponse = await cloudinary.uploader.upload(
        convertedPicture,
        { folder: "vinted/offers", public_id: user._id }
      );

      //console.log(cloudinaryResponse);
      if (
        req.body.title.length > 50 ||
        req.body.description.length > 500 ||
        req.body.price > 100000
      ) {
        return res.json("The offer doesn't respect the terms");
      }
      const newOffer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          {
            MARQUE: req.body.brand,
          },
          {
            TAILLE: req.body.size,
          },
          {
            ÉTAT: req.body.condition,
          },
          {
            COULEUR: req.body.color,
          },
          {
            EMPLACEMENT: req.body.city,
          },
        ],

        product_image: cloudinaryResponse,
        owner: user._id,
      });
      await newOffer.save();
      const checkOffer = await Offer.find().populate("owner", "account _id");

      res.json(checkOffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.put(
  "/offer/modify/:id",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      const token = req.headers.authorization.replace("Bearer ", "");
      const user = await User.findOne({ token: token });
      //console.log(user);
      //console.log(req.body);
      const convertedPicture = convertToBase64(req.files.picture);

      const cloudinaryResponse = await cloudinary.uploader.upload(
        convertedPicture
      );
      const offerToModify = await Offer.findById(req.params.id);

      offerToModify.product_name = req.body.title;
      (offerToModify.product_description = req.body.description),
        (offerToModify.product_price = req.body.price),
        (offerToModify.product_details = [
          {
            MARQUE: req.body.brand,
          },
          {
            TAILLE: req.body.size,
          },
          {
            ÉTAT: req.body.condition,
          },
          {
            COULEUR: req.body.color,
          },
          {
            EMPLACEMENT: req.body.city,
          },
        ]),
        (offerToModify.product_image = cloudinaryResponse.secure_url),
        res.json(offerToModify);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
router.delete("/offer/delete/:id", isAuthenticated, async (req, res) => {
  try {
    const offerToDelete = await Offer.findByIdAndDelete(req.params.id);
    res.json("The offer has been deleted");
    //console.log(user);
    //console.log(req.body);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    const regexp = new RegExp(req.query.title, "i");
    // console.log(regexp);

    const filter = {
      product_name: regexp,
    };
    //filtrer par prix
    if (req.query.priceMin || req.query.priceMax) {
      filter.product_price = {};
      if (req.query.priceMin) {
        filter.product_price.$gte = Number(req.query.priceMin);
      }
      if (req.query.priceMax) {
        filter.product_price.$lte = Number(req.query.priceMax);
      }
    }
    //console.log(filter);
    const totalOffers = await Offer.countDocuments(filter);

    // sort par prix croissant ou decroissant
    let sortFilter = {};
    if (req.query.sort === "price-asc") {
      sortFilter = { product_price: "asc" };
    } else if (req.query.sort === "price-desc") {
      sortFilter = { product_price: "desc" };
    }

    // Compter le nombre total d'offres selon le filtre

    const findOffers = await Offer.find(filter)
      .sort(sortFilter)
      .skip((req.query.page - 1) * 3)
      // .limit(3)
      .populate("owner");

    const finalResponse = {
      count: totalOffers, // Nombre total d'offres trouvées
      offers: findOffers, // Offres paginées
    };

    res.json(finalResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/offers/:id", async (req, res) => {
  try {
    showDetails = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );

    res.json(showDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
