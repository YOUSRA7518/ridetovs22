const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  pseudo: {
    type: String,
    required: true
  },
  nom: {
    type: String
  },
  prenom: {
    type: String
  },
  naissance: {
    type: String
  },
  genre: {
    type: String
  },
  ville: {
    type: String
  },
  passions: {
    type: [String],
    required: true
  },
  statut: [
    {
      statut2: {
        type: String
      },
      bio: {
        type: String
      },
      stade: {
        type: String
      },
      depressionType: {
        type: String
      },
      traitement: [
        {
          medicaments: Boolean,
          therapies: Boolean,
          autre: Boolean,
          noTraitement: Boolean,
          traitementAutre: String
        }
      ]
    }
  ]
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);
