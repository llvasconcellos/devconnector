const express = require("express");
const router = express.Router();
const passport = require("passport");

//Load Input Validation
const ValidateProfileInput = require("../../validation/profile");
const ValidateExperienceInput = require("../../validation/experience");
const ValidateEducationInput = require("../../validation/education");

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
 * @route       GET api/profile/all
 * @description Get all profiles
 * @access      Public
 */
router.get("/all", (req, res) => {
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        return res.status(404).json({ msg: "There are no profiles" });
      }

      return res.json(profiles);
    })
    .catch(err => res.status(500).json(err));
});

/**
 * @route       GET api/profile/handle/:handle
 * @description Get profile by handle
 * @access      Public
 */
router.get("/handle/:handle", (req, res) => {
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        return res
          .status(404)
          .json({ msg: "There is no profile for this user" });
      }

      return res.json(profile);
    })
    .catch(err => res.status(500).json(err));
});

/**
 * @route       GET api/profile/user/:user_id
 * @description Get profile by user ID
 * @access      Public
 */
router.get("/user/:user_id", (req, res) => {
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        return res
          .status(404)
          .json({ msg: "There is no profile for this user" });
      }

      return res.json(profile);
    })
    .catch(err => res.status(500).json(err));
});

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

/**
 * @route       POST api/profile/experience
 * @description Create / Update profile experience
 * @access      Private
 */
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = ValidateExperienceInput(req.body);

    //Check validation
    if (!isValid) {
      return res.status(422).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      //Add to experience array
      profile.experience.unshift(newExp);

      profile.save().then(profile => res.json(profile));
    });
  }
);

/**
 * @route       POST api/profile/education
 * @description Create / Update profile education
 * @access      Private
 */
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = ValidateEducationInput(req.body);

    //Check validation
    if (!isValid) {
      return res.status(422).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      //Add to experience array
      profile.education.unshift(newEdu);

      profile.save().then(profile => res.json(profile));
    });
  }
);

/**
 * @route       DELETE api/profile/experience/:exp_id
 * @description Delete profile experience
 * @access      Private
 */
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      //Get remove index
      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

      //splice out of array
      profile.experience.splice(removeIndex, 1);

      //save
      profile
        .save()
        .then(profile => res.json(profile))
        .catch(err => res.status(500).json(err));
    });
  }
);

/**
 * @route       DELETE api/profile/education/:edu_id
 * @description Delete profile education
 * @access      Private
 */
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      //Get remove index
      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

      //splice out of array
      profile.education.splice(removeIndex, 1);

      //save
      profile
        .save()
        .then(profile => res.json(profile))
        .catch(err => res.status(500).json(err));
    });
  }
);

/**
 * @route       DELETE api/profile
 * @description Delete user and profile
 * @access      Private
 */
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        User.findOneAndRemove({ _id: req.user.id }).then(() =>
          res.json({ success: true })
        );
      })
      .catch(err => res.status(500).json(err));
  }
);

module.exports = router;
