const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const Post = require("./postModel");
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name !"],
      trim: true,
    },

    friends: {
      number: {
        type: Number,
        default: 0,
      },
      list: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
      },
    },

    image: {
      type: String,
      default: "none.jpg",
    },
    gender: {
      type: String,
      required: [true, "Please enter your gender !! "],
      lowercase: true,
      enum: ["male", "female", "other"],
    },
    dateOfBirth: {
      type: Date,
      required: true,
      trim: true,
    },
    age: {
      type: String,
    },
    // id : mongoose.Schema.Types.ObjectId

    email: {
      type: String,
      required: [true, "Please Enter Your Email !"],
      lowercase: true,
      validate: [validator.isEmail, "Enter A True Email !!"],
    },
    // posts : String
    // ,
    password: {
      type: String,
      required: [true, "Please enter your password !"],
      minlength: 8,
      select: false,
    },
    passwordChangedAt: { type: Date, select: true },
    active: {
      type: Boolean,
      default: true,
    },
    passwordConfirm: {
      type: String,
      required: [true, "PLease confirm your password !"],
      validate: {
        validator: function (el) {
          return this.password === el;
        },
        message: "The password and passwordConfirm aren't equal",
      },
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: { virtuals: true },
  }
);
userSchema.virtual("posts", {
  ref: "Post",
  foreignField: "user",
  localField: "_id",
});

userSchema.virtual("comments", {
  ref: "Post",
  foreignField: "comments.user",
  localField: "_id",
});

// userSchema.virtual("posts", {
//   ref: "Post",
//   foreignField: "user",
//   localField: "_id",
// });
// userSchema.virtual("bingo").get( function(){
//  return "YossefBa4a"
// })
// userSchema.virtual("comments",{
//   ref : "Post",
//   foreignField: "comment.user",
//   localField : "id",
// })
userSchema.pre(/^find/, function (next) {
  this.populate({
    path: "friends.list",
    select: { friends: 0, dateOfBirth: 0, email: 0 },
  });
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 8);
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre("save", function (next) {
  this.age = new Date().getFullYear() - this.dateOfBirth.getFullYear();
  next();
});
userSchema.methods.correctPassword = async function (
  reqPassword,
  userPassword
) {
  return await bcrypt.compare(reqPassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
