const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const jwrSecret = process.env.JWT_SECRET;

const generateToken = id => {
   return jwt.sign({ id }, jwrSecret, { expiresIn: '7d' });
};

const registerUser = async (req, res) => {
   const { name, email, password } = req.body;

   try {
      // 1. Check if user exists (Verificação de Duplicidade)
      const userExists = await User.findOne({ email });

      if (userExists) {
         // Se o usuário existir, retorna o erro 422 e interrompe
         return res.status(422).json({ errors: ['Email already registered'] });
      }

      // 2. Encrypt Password (Criptografia)
      const salt = await bcrypt.genSalt(10); // Reduzi o salt para 10, 12 é overkill
      const passwordHash = await bcrypt.hash(password, salt);

      // 3. Create new user instance (Cria a instância)
      const newUser = new User({
         name,
         email,
         password: passwordHash
      });

      // 4. SAVE the user to the database (SALVA no DB - ESSA ERA A ETAPA FALTANTE)
      const savedUser = await newUser.save();

      // 5. Success Response (Resposta de Sucesso)
      if (savedUser) {
         return res.status(201).json({
            message: 'User created successfully',
            user: {
               _id: savedUser._id,
               name: savedUser.name,
               email: savedUser.email
            },
            token: generateToken(savedUser._id)
         });
      } else {
         // Caso a criação/salvamento falhe por um motivo desconhecido
         return res
            .status(422)
            .json({ errors: ['Error creating user, please try again later'] });
      }
   } catch (error) {
      console.error('Registration Error:', error);
      // Retorna um erro genérico de servidor
      return res.status(500).json({
         errors: ['Server error, please try again later']
      });
   }
};

const login = async (req, res) => {
   const { email, password } = req.body;

   try {
      // // Validação de campos vazios
      // if (!email || !password) {
      //    return res.status(422).json({
      //       errors: ['Por favor, preencha todos os campos']
      //    });
      // }

      // Busca usuário
      const user = await User.findOne({ email });

      // Verifica se usuário existe
      if (!user) {
         return res.status(404).json({
            errors: ['Email não cadastrado'] // ← MUDOU AQUI
         });
      }

      // Verifica senha
      const checkPassword = await bcrypt.compare(password, user.password);

      if (!checkPassword) {
         return res.status(401).json({
            errors: ['Senha incorreta']
         });
      }

      // Login bem-sucedido
      return res.status(200).json({
         _id: user._id,
         profileImage: user.profileImage,
         name: user.name,
         email: user.email,
         bio: user.bio,
         token: generateToken(user._id)
      });
   } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
         errors: ['Erro interno do servidor']
      });
   }
};

// Get current logged in user
const getCurrentUser = async (req, res) => {
   const user = req.user;
   res.status(200).json(user);
};

const update = async (req, res) => {
   try {
      console.log('\n=== UPDATE REQUEST ===');
      
      const { name, password, bio } = req.body || {};
      
      let profileImage = null;
      
      if (req.file) {
         profileImage = req.file.filename;
      }
      
      const reqUser = req.user;
      
      const user = await User.findById(reqUser._id).select('-password');
      
      if (!user) {
         return res.status(404).json({ errors: ['User not found'] });
      }
      
      // Atualiza campos
      if (name) user.name = name;
      if (bio) user.bio = bio;
      
      if (password) {
         const salt = await bcrypt.genSalt(10);
         user.password = await bcrypt.hash(password, salt);
      }
      
      if (profileImage) {
         user.profileImage = profileImage;
      }
      
      await user.save();
      
      // Prepara resposta INCLUINDO O TOKEN
      const userResponse = user.toObject();
      delete userResponse.password;
      
      // Se veio token no body (para atualização), mantém na resposta
      const responseData = {
         message: 'User updated successfully',
         user: {
            ...userResponse,
            token: req.body.token || generateToken(user._id) // Mantém ou gera novo
         }
      };
      
      res.status(200).json(responseData);
      
   } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ errors: ['Server error'] });
   }
};

// Get user by id
const getUserById = async (req, res) => {
   const { id } = req.params;

   if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.send(422).json({ errors: ['Invalid user id'] });
   }

   try {
      const user = await User.findById(id).select('-password');

      if (!user) {
         res.status(404).json({ errors: ['Do not found user'] });
         return;
      }

      return res.status(200).json(user);
   } catch (error) {
      console.error(error);
      return res.status(500).json({ errors: ['Server Error'] });
   }
};

module.exports = {
   registerUser,
   login,
   getCurrentUser,
   update,
   getUserById
};
