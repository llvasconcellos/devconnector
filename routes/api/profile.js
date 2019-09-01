const express = require("express");
const router = express.Router();
const passport = require("passport");

//Load Input Validation
const ValidateProfileInput = require("../../validation/profile");

//Load User model
const User = require("../../models/User");

//Load Profile model
const Profile = require("../../models/Profile");

/**
 * @route       GET api/profile/test
 * @description Tests profile route
 * @access      Public
 */
router.get("/test", (req, res) => res.json({ msg: "Profile Works" }));

/**
 * @route       GET api/profile
 * @description Get current user profile
 * @access      Private
 */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          return res
            .status(404)
            .json({ msg: "There is no profile for this user" });
        }
        res.json(profile);
      })
      .catch(err => res.status(500).json(err));
  }
);

/**
 * @route       POST api/profile
 * @description Create / Update current user profile
 * @access      Private
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = ValidateProfileInput(req.body);

    //Check validation
    if (!isValid) {
      return res.status(422).json(errors);
    }

    //Get fields
    const profileFields = {
      user: req.user.id,
      handle: req.body.handle,
      status: req.body.status,
      skills: req.body.skills.split(",")
    };

    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;

    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        )
          .populate("user", ["name", "avatar"])
          .then(profile => res.json(profile));
      } else {
        //Create

        //Check if handle exists
        Profile.findOne({ handle: profileFields.handle }, "id").then(
          profile => {
            if (profile) {
              return res.status(409).json({ handle: "Handle already exists" });
            }

            //Save profile
            new Profile(profileFields)
              .save()
              .then(profile => res.json(profile));
          }
        );
      }
    });
  }
);

module.exports = router;
