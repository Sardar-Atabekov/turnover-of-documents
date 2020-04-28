const {Schema,model} = require('mongoose');

const FolderScheme = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 3
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  accessIsAllowed: [{
      type: Schema.Types.ObjectId,
      ref: "User"
  }],
  innerFiles: [{
      type: Schema.Types.ObjectId,
      ref: "File"
  }]
});

module.exports = model('folder',FolderScheme);
