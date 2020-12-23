const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

exports.signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    "Yossef_Social",
    {
      expiresIn: "30d",
    }
  );
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.cookies.jwt) {
      token = await jwt.verify(req.cookies.jwt, "Yossef_Social");
      if (!token) {
        throw "Not Authorized";
      }
      req.user = await User.findById(token.id)
        .populate({
          path: "posts",
          select: "topic date content title",
          options: { sort: { date: 1 } },
        })
        .sort("-date");
    } else {
      throw "error";
    }

    next();
  } catch (error) {
    res.status(404).send("Please Login !!");
  }
};
