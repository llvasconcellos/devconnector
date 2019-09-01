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
    required: true
  },
  name: {
    type: String,
    required: true
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
        required: true
      },
      avatar: {
        type: String,
        required: false
      },
      date: {
        type: Date,
        required: true
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
