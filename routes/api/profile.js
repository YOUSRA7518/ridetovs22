const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route        GET api/profile/me
// @description  get current users profile
// @access       private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      "name"
    );

    if (!profile) {
      return res.status(400).json({ msg: "there is no profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route        POST api/profile/
// @description  create or update user profile
// @access       private

router.post(
  "/",
  [
    auth,
    [
      check("pseudo", "pseudo is required")
        .not()
        .isEmpty(),
      check("passions", "passions is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      pseudo,
      nom,
      prenom,
      naissance,
      genre,
      ville,
      statut,
      passions
    } = req.body;

    // build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (pseudo) profileFields.pseudo = pseudo;
    if (nom) profileFields.nom = nom;
    if (prenom) profileFields.prenom = prenom;
    if (naissance) profileFields.naissance = naissance;
    if (genre) profileFields.genre = genre;
    if (ville) profileFields.ville = ville;
    if (passions) {
      profileFields.passions = passions
        .split(", ")
        .map(passions => passions.trim());
    }
    console.log(profileFields.passions);

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        //update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      // create
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route        GET api/profile
// @description  get all profiles
// @access       private (dans le tuto c public)
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.statuts(500).send("servor error");
  }
});

// @route        GET api/profile/user/:user_id
// @description  get profile by user id
// @access       private (dans le tuto c public)

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name"]);

    if (!profile) return res.status(400).json({ msg: "profile not found" });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "profile not found" });
    }
    res.statuts(500).send("servor error");
  }
});

// @route        DELETE api/profile
// @description  delete profile, user & posts
// @access       private

router.delete("/", auth, async (req, res) => {
  try {
    // @todo - remove users posts

    // remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "user deleted" });
  } catch (err) {
    console.error(err.message);
    res.statuts(500).send("servor error");
  }
});

// @route        PUT api/profile/statut
// @description  add profile statut
// @access       private
router.put(
  "/statut",
  [
    auth,
    [
      check("statut2", "statut2 is required")
        .not()
        .isEmpty(),
      check("bio", "bio is required")
        .not()
        .isEmpty(),
      check("stade", "stade is required")
        .not()
        .isEmpty(),
      check("depressionType", "depressionType is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { statut2, bio, stade, depressionType } = req.body;

    const newStatut = {
      statut2,
      bio,
      stade,
      depressionType
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.statut.unshift(newStatut);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route        PUT api/profile/statut/traitement
// @description  add profile traitement
// @access       private
// router.put(
//   "/statut/traitement",
//   [
//     auth,
//     [
//       check("medicaments", "medicaments is required")
//         .not()
//         .isEmpty(),
//       check("therapies", "therapies is required")
//         .not()
//         .isEmpty(),
//       check("autre", "autre is required")
//         .not()
//         .isEmpty(),
//       check("noTraitement", "noTraitement is required")
//         .not()
//         .isEmpty(),
//       check("traitementAutre", "traitementAutre is required")
//         .not()
//         .isEmpty()
//     ]
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const {
//       medicaments,
//       therapies,
//       autre,
//       noTraitement,
//       traitementAutre
//     } = req.body;

//     const newTraitement = {
//       medicaments,
//       therapies,
//       autre,
//       noTraitement,
//       traitementAutre
//     };

//     try {
//       const profile = await Profile.findOne({ user: req.user.id });
//       profile.statut.traitement.unshift(newTraitement);
//       await profile.save();
//       res.json(profile);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send("Server Error");
//     }
//   }
// );



module.exports = router;
