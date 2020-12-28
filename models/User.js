const { Schema, model } = require('mongoose')

const schema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
      type: String,
      required: true
  },
  highscore: {
      type: Number,
      default: 0
  },
  token: {
    type: String
  }
})

module.exports = model('User', schema)


