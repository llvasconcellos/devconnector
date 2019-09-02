const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Create Schema
const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  text: {
    type: String,
    required: true,
    max: 300,
    min: 10
  },
  name: {
    type: String,
    required: false
  },
  avatar: {
    type: String,
    required: false
  },
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users"
      }
    }
  ],
  comments: [
    {
      text: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: false
      },
      avatar: {
        type: String,
        required: false
      },
      date: {
        type: Date,
        required: Date.now
      },
      likes: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: "users"
          }
        }
      ]
    }
  ],
  date: {
    type: Date,
    deafult: Date.now
  }
});

module.exports = Post = mongoose.model("posts", PostSchema);
