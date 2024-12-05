const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Conversation Schema
const ConversationSchema = new Schema(
  {
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      validate: {
        validator: function (val) {
          return val.length === 2; // Ensure only two participants
        },
        message: "A conversation must have exactly two participants.",
      },
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
