const express = require("express");
const postController = require("./../controller/postController");
const auth = require("./../controller/authController");

const postRouter = express.Router();

postRouter.post("/post/add", auth.protect, postController.addPost);
postRouter.get("/post/:postId", auth.protect, postController.getPost);
// postRouter.patch('/update', auth.protect , postController.updateUser)
postRouter.delete(
  "/post/:postId/delete",
  auth.protect,
  postController.deletePost
);
postRouter.patch(
  "/post/:postId/update",
  auth.protect,
  postController.updatePost
);
postRouter.post(
  "/post/:postId/addcomment",
  auth.protect,
  postController.addComment
);
postRouter.post(
  "/post/:postId/updateComment",
  auth.protect,
  postController.updateComment
);
postRouter.post(
  "/post/:postId/likepost",
  auth.protect,
  postController.likePost
);
postRouter.post(
  "/post/:postId/unlikepost",
  auth.protect,
  postController.unlikePost
);
postRouter.post(
  "/post/:postId/uploadpostimage",
  auth.protect,
  postController.upload.array("postImages", 15),
  postController.uploadPostImage
);
// postRouter.post('/upload' , auth.protect ,postController.upload.single("image"), postController.uploadImage)
module.exports = postRouter;
