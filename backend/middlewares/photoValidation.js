const { body } = require('express-validator');

const photoInsertValidation = () => {
   return [
      body('title')
         .not()
         .equals()
         .withMessage('Title is required')
         .isString()
         .withMessage('Title is required')
         .isLength({ min: 3 })
         .withMessage('Title must be at 3 length'),
      body('image').custom((value, { req }) => {
         if (!req.file) {
            throw new Error('The image is required');
         }
         return true;
      })
   ];
};

const photoUpdateValidation = () => {
   return [
      body('title')
         .optional()
         .isString()
         .withMessage('Title is required')
         .isLength({ min: 3 })
         .withMessage('Title must be at 3 length')
   ];
};

const commentValidation = () => {
   return [body('comment').isString().withMessage('Comment is Required')];
};

module.exports = {
   photoInsertValidation,
   photoUpdateValidation,
   commentValidation
};
