const User = require("../model/userModel");
const auth = require("./authController");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

exports.upload = multer({
  fileFilter: (req, file, cd) => {
    if (file.mimetype.startsWith("image")) {
      cd(null, true);
    } else {
      cd("upload a image !");
    }
  },
});

exports.addUser = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    const token = auth.signToken(newUser._id);
    res.cookie("jwt", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      newUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error: error.message,
    });
  }
};
exports.updateUser = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) throw "Not Found User";
    res.status(200).json({
      status: "ok",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    res.status(404).json({
      error: error.message,
    });
  }
};

exports.getme = async (req, res, next) => {
  try {
    if (!req.user) throw "Please Login !";
    res.status(200).json({
      status: "ok",
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ error });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    console.log(user);
    if (!user || !(await user.correctPassword(password, user.password))) {
      res.status(404).send("Email or Password aren't correct !");
    }
    const token = auth.signToken(user._id);
    res.cookie("jwt", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const id = req.user._id;
    const user = await User.findByIdAndDelete(id);
    if (!user) throw "Anta 3abit Yasta ??";
    res.cookie("jwt", "random", {
      httpOnly: true,
      expires: new Date(Date.now() + 1),
    });
    fs.rmdir(`public/images/user-${req.user._id}`, { recursive: true }, (e) =>
      console.log("done")
    );
    res.status(200).json(user);
  } catch (e) {
    console.log(e);
    res.status(404).json({ e });
  }
};
exports.logout = async (req, res, next) => {
  try {
    const { user } = req;
    res.cookie("jwt", "random", {
      httpOnly: true,
      expires: new Date(Date.now() + 1),
    });
    res.status(400).json({
      status: "ok",
    });
  } catch (error) {
    res.status(404).json({
      error: error.message,
    });
  }
};

exports.addFriend = async (req, res) => {
  try {
    const id = req.params.userId;
    req.user.friends.list.forEach((element) => {
      if (element.equals(id)) {
        throw new Error("Already in your Friends !");
      }
    });
    // if(req.user.friends.list.includes(id)) throw new Error("Already in your Friends !")
    const addedUser = await User.findByIdAndUpdate(id, {
      $inc: { "friends.number": 1 },
      $push: { "friends.list": req.user._id },
    });
    if (!addedUser) throw new Error("User not found !");
    // console.log(addedUser)
    // console.log(addedUser.friends.list)
    if (id === req.user._id || req.user.friends.list.includes(id))
      throw new Error("Adding error!!");
    req.user.friends.number++;
    req.user.friends.list.push(id);
    const user = await req.user.save({ validateBeforeSave: false });
    res.status(200).json({
      status: "ok",
      user,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

exports.uploadImage = async (req, res, next) => {
  try {
    // console.log(req.file);
    if (!req.file) res.status(400).send("PLease upload an image !!");
    req.file.filename = `user-${req.user._id}.jpeg`;
    const { user } = req;
    await fs.mkdir(`public/images/user-${req.user._id}`, (e) =>
      console.log("done")
    );
    sharp(req.file.buffer)
      .resize({
        fit: sharp.fit.inside,
        width: 400,
        height: 400,
      })
      .toFormat("jpeg")
      .jpeg({ quality: 70 })
      .toFile(`public/images/user-${req.user._id}/${req.file.filename}`);
    req.user.image = req.file.filename;
    await req.user.save({ validateBeforeSave: false });
    // console.log("ok")
    res.status(200).send("ok");
  } catch (error) {
    console.log(error);
    res.status(404).send("Fail");
  }
};
