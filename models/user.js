const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    photoURL: {
      type: String,
      required: true,
    },
    _id: {
      type: String,
      required: true,
    },
    categories: {
      type: Map,
      of: [
        {
          id: { type: String, required: true },
          url: { type: String, required: true },
        },
      ],
      default: new Map(),
    },
  },
  { _id: false }
);

module.exports = mongoose.model("User", userSchema);
