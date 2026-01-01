// UserRoutes.js - COM DEBUG
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
const handleMultiPart = require('../middlewares/handleMultiPart');

router.post('/register', userCreateValidation(), validate, registerUser);
router.post('/login', loginValidation(), validate, login);
router.get('/profile', authGuard, getCurrentUser);

// Middleware de debug
router.use((req, res, next) => {
   console.log('\n=== ROUTE DEBUG ===');
   console.log('Time:', new Date().toISOString());
   console.log('Method:', req.method);
   console.log('URL:', req.url);
   console.log('Original URL:', req.originalUrl);
   console.log('Path:', req.path);
   next();
});

router.put(
   '/',
   (req, res, next) => {
      console.log('1. Antes do handleMultiPart');
      next();
   },
   handleMultiPart,
   (req, res, next) => {
      console.log('2. Após handleMultiPart, antes do authGuard');
      console.log('Body disponível:', req.body);
      next();
   },
   authGuard,
   (req, res, next) => {
      console.log('3. Após authGuard, antes das validações');
      console.log('User autenticado:', req.user ? 'Sim' : 'Não');
      next();
   },
   userUpdateValidation(),
   validate,
   (req, res, next) => {
      console.log('4. Após validações, antes do controller');
      next();
   },
   update
);

router.get('/:id', getUserById);

module.exports = router;
