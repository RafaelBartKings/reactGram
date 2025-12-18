const express = require('express');
const router = express.Router();

const {
   registerUser,
   login,
   getCurrentUser,
   update,
   getUserById
} = require('../controllers/UserController');

const validate = require('../middlewares/handleValidation');
const {
   userCreateValidation,
   loginValidation,
   userUpdateValidation
} = require('../middlewares/userValidation');
const authGuard = require('../middlewares/AuthGuard');
const { imageUpload } = require('../middlewares/imageUpload');

router.post('/register', userCreateValidation(), validate, registerUser);
router.post('/login', loginValidation(), validate, login);
router.get('/profile', authGuard, getCurrentUser);
router.put(
   '/',
   authGuard,
   userUpdateValidation(),
   validate,
   imageUpload.single('profileImage'),
   update
);

router.get('/:id', getUserById);

module.exports = router;
