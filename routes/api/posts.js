const express = require("express");
const router = express.Router();
const passport = require("passport");

//Load Input Validation
const ValidatePostInput = require("../../validation/post");

//Load Post model
const Post = require("../../models/Post");

//Load Profile model
const Profile = require("../../models/Profile");

/**
 * @route       GET api/posts/test
 * @description Tests post route
 * @access      Public
 */
router.get("/test", (req, res) => res.json({ msg: "Posts Works" }));

/**
 * @route       GET api/posts
 * @description Get all posts
 * @access      Public
 */
router.get("/", (req, res) => {
  Post.find(null, null, { sort: { date: -1 } })
    .then(posts => res.json(posts))
    .catch(err => res.status(500).json(err));
});

/**
 * @route       GET api/posts/:id
 * @description Get post by id
 * @access      Public
 */
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(500).json(err));
});

/**
 * @route       POST api/posts
 * @description Create / Update post
 * @access      Private
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = ValidatePostInput(req.body);

    //Check validation
    if (!isValid) {
      return res.status(422).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost
      .save()
      .then(post => res.json(post))
      .catch(err => res.status(500).json(err));
  }
);

/**
 * @route       DELETE api/posts/:id
 * @description Delete post
 * @access      Private
 */
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id).then(post => {
        if (post.user.toString() !== req.user.id) {
          return res.status(401).json({ msg: "User not authorized" });
        }

        //Delete
        post
          .remove()
          .then(() => res.json({ success: true }))
          .catch(err => res.status(500).json(err));
      });
    });
  }
);

/**
 * @route       POST api/posts/like/:id
 * @description Like post
 * @access      Private
 */
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        const likeIndex = post.likes.findIndex(
          element => element.user.toString() === req.user.id
        );
        if (likeIndex > -1) {
          post.likes.splice(likeIndex, 1);
        } else {
          post.likes.unshift({ user: req.user.id });
        }
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(500).json(err));
  }
);

module.exports = router;
