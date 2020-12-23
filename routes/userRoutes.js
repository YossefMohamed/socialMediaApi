const express = require("express");
const userControllers = require("./../controller/userControllers");
const auth = require("./../controller/authController");

const userRouter = express.Router();
// ملح ماجي ليمون مكعبين جبنه ملح خفيف
userRouter.post("/signup", userControllers.addUser);
userRouter.post("/login", userControllers.login);
userRouter.use(auth.protect);
userRouter.patch("/update", userControllers.updateUser);
userRouter.get("/me", userControllers.getme);
userRouter.delete("/delete", userControllers.delete);
userRouter.post("/logout", userControllers.logout);
userRouter.post("/addFriend/:userId", userControllers.addFriend);
userRouter.post(
  "/upload",
  userControllers.upload.single("image"),
  userControllers.uploadImage
);
module.exports = userRouter;
