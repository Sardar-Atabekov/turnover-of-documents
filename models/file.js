const { Schema, model } = require("mongoose");

const FileScheme = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  senderName: {
    type: String,
  },
  versions: [
    {
      filename: {
        type: String,
        minLength: 5,
        required: true,
      },
      src: {
        type: String,
        required: true,
      },
      dateOfCreation: {
        type: Date,
        required: true,
      },
      description: {
        type: String,
      },
    },
  ],
  allowToEdit: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      opened: {
        type: Boolean,
        default: false,
      },
    },
  ],
  allowToRead: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      opened: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = model("file", FileScheme);
