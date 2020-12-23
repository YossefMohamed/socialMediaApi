const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const Post = require("./../model/postModel");

exports.upload = multer({
  fileFilter: (req, file, cd) => {
    if (file.mimetype.startsWith("image")) {
      cd(null, true);
    } else {
      cd(null, false, new Error("Upload an Image !"));
    }
  },
});
exports.addPost = async (req, res) => {
  try {
    console.log(req.user);
    req.body.user = req.user._id;
    const post = await Post.create(req.body);
    res.status(200).json({ status: "ok", Data: post });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) throw new Error("Post not found !");
    if (post.like.includes(req.user._id)) {
      throw new Error("Already Liked");
    }
    post.like.push(req.user._id);
    await post.save();
    res.status(200).json({
      status: "ok",
      data: {
        post,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      error: error.message,
    });
  }
};

exports.unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (post.like.indexOf(req.user._id) < 0)
      throw new Error("Already unliked !");
    post.like.splice(post.like.indexOf(req.user._id), 1);
    await post.save();
    res.status(200).json({
      status: "ok",
      data: {
        post,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: "fail",
      error: error.message,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const deletedPost = await Post.findById(postId);
    if (!deletedPost) throw new Error("Post not found !");
    if (!req.user._id.equals(deletedPost.user._id))
      throw new Error("Not authorized !");
    const post = await deletedPost.remove();
    fs.rmdir(`public/images/post-${post._id}`, { recursive: true }, (e) =>
      console.log("done")
    );
    res.status(200).json({
      status: "ok",
      data: post,
    });
  } catch (error) {
    console.log(error);
    res.status("404").json({
      status: "fail",
      error: error.message,
    });
  }
};

exports.getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post Not Found !!");
    res.status(200).json({
      status: "ok",
      data: post,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "fail",
      error: error.message,
    });
  }
};

exports.updatePost = async (req, res) => {
  try {
    console.log(req.params);
    const { postId } = req.params;
    const updatedPost = await Post.findById(postId);
    if (!req.user._id.equals(updatedPost.user._id))
      throw new Error("Not authorized !");
    const aa = await updatedPost.updateOne(req.body);

    // for (const prop in updatedPost) {
    //     if (updatedPost.hasOwnProperty(prop))
    //     console.log(`Key ===> ${prop}`);
    //   }

    if (!aa.n) throw new Error("Random Error !!");

    res.status(200).json({
      status: "ok",
      data: aa,
    });
  } catch (error) {
    res.status(404).json({
      error: error.message,
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    post.comments.push({
      user: req.user._id,
      content: req.body.content,
    });
    await post.save();
    res.status(200).json({ status: "ok", Data: post });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
};
exports.updateComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    let comment = 0;

    for (let i = 0; i < post.comments.length; i++) {
      if (!post.comments[i]._id.equals(req.body.commentId)) {
        console.log(false);
        comment++;
      } else {
        console.log(true);
        break;
      }
    }
    if (!post.comments[comment].user._id.equals(req.user._id))
      throw new Error("Not authorized !");
    if (!req.body.content) throw new Error("There's no content !!");
    post.comments[comment].content = req.body.content;
    await post.save();
    res.status(200).json({ status: "ok", Data: post });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "error", error: error.message });
  }
};

exports.uploadPostImage = async (req, res, next) => {
  try {
    console.log(req.files);
    if (req.files.length <= 0) throw new Error("There's no image !");
    const post = await Post.findById(req.params.postId);
    console.log(post);
    req.files.map(async (e, i) => {
      e.filename = `post-${req.user._id}-${i}.jpeg`;
      post.images.push(e.filename);
      await fs.mkdir(`public/images/post-${post._id}`, (e) =>
        console.log("done !")
      );
      sharp(e.buffer)
        .resize({
          fit: sharp.fit.inside,
          width: 400,
          height: 400,
        })
        .toFormat("jpeg")
        .jpeg({ quality: 70 })
        .toFile(`public/images/post-${post._id}/${e.filename}`);
    });
    console.log(req.files);
    await post.save();
    // const { user } = req
    // req.user.image = req.file.filename;
    // await req.user.save({ validateBeforeSave: false })
    // console.log("ok")
    res.status(200).send(post);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "fail",
      error: error.message,
    });
  }
};
