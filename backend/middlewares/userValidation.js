const { body } = require('express-validator');

const userCreateValidation = () => {
   return [
      body('name')
         .isString()
         .withMessage('Name must be filled out')
         .isLength({ min: 3 })
         .withMessage('Name must be at least 3 characters long'),
      body('email')
         .isString()
         .withMessage('Email must be filled out')
         .isEmail()
         .withMessage('Email must be valid'),
      body('password')
         .isString()
         .withMessage('Password must be filled out')
         .isLength({ min: 6 })
         .withMessage('Password must be at least 6 characters long'),
      body('passwordConfirmation')
         .isString()
         .withMessage('Password Confirmation must be filled out')
         .custom((value, { req }) => {
            if (!req.body.password) {
               throw new Error('Password field is required');
            }
            if (value !== req.body.password) {
               throw new Error('Password Confirmation does not match Password');
            }
            return true;
         })
   ];
};

const loginValidation = () => {
   return [
      body('email')
         .isString()
         .withMessage('Email must be filled out.')
         .isEmail()
         .withMessage('Email must be valid.'),
      body('password').isString().withMessage('Password must be filled out.')
   ];
};

const userUpdateValidation = () => {
   return [
      body('name')
         .optional()
         .isLength({ min: 3 })
         .withMessage('Name must be at 3 length'),
      body('password')
         .optional()
         .isLength({ min: 5 })
         .withMessage('Password must be at 3 lenght')
   ];
};

module.exports = {
   userCreateValidation,
   loginValidation,
   userUpdateValidation
};
