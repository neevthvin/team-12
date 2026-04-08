const Joi = require('joi');

const FORGOT_PASSWORD_MODEL = Joi.object({
    email: Joi.string().email().required()
});

const RESET_PASSWORD_MODEL = Joi.object({
    otp: Joi.string().length(4).required(),
    password: Joi.string().min(8).required(),
    confirmPassword: Joi.string().required()
});

module.exports = {
    FORGOT_PASSWORD_MODEL,
    RESET_PASSWORD_MODEL
};