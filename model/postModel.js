const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please Enter Title"],
  },

  like: [
    {
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
  images: {
    type: [String],
    trim: true,
  },
  content: {
    type: String,
    trim: true,
    required: [true, "Please Enter Description !"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  topic: {
    type: String,
    trim: true,
    enum: ["programming", "football", "reading", "courses"],
    required: [true, "Please Enter Description !"],
  },
  date: {
    type: Date,
    default: new Date(Date.now()),
  },
  comments: [
    {
      count: 0,
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      content: {
        type: String,
        minlength: [1, "Comment can't be empty !"],
      },
    },
  ],
});

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name image",
  }).populate({
    path: "comments.user",
    select: "image name",
  });
  next();
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
