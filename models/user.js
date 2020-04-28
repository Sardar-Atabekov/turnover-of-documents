const {Schema,model} = require('mongoose');

const UserScheme = new Schema({
  name: {
    type: String,
    minLength: 5,
    required: true,
  },
  faculty: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true
  }
});

UserScheme.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = model('user',UserScheme);
