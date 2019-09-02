const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validatePostInput(data) {
  let errors = {};

  data.text = !isEmpty(data.text) ? data.text : "";

  if (Validator.isEmpty(data.text)) {
    errors.text = "Post field is required";
  } else {
    if (!Validator.isLength(data.text, { max: 300, min: 10 })) {
      errors.text = "Post length must be between 10 and 300 characters";
    }
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
