const User = require('../models/User');
const jwt = require('jsonwebtoken');

const AuthGuard = async (req, res, next) => {
   console.log('\n=== AUTH GUARD ===');
   console.log('Method:', req.method);
   console.log('URL:', req.url);

   const authHeader = req.headers.authorization;
   console.log('Authorization header:', authHeader);

   const token = authHeader && authHeader.split(' ')[1];
   console.log('Token extracted:', token ? 'Present' : 'Missing');

   if (!token) {
      console.log('❌ ERRO: Token não fornecido');
      return res.status(401).json({
         errors: ['No token provided']
      });
   }

   try {
      console.log('Verificando token...');
      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
         console.log('❌ ERRO: JWT_SECRET não está definido no .env');
         return res.status(500).json({
            errors: ['Server configuration error']
         });
      }

      const verified = jwt.verify(token, jwtSecret);
      console.log('✅ Token válido. User ID:', verified.id);

      console.log('Buscando usuário no banco...');
      const user = await User.findById(verified.id).select('-password');

      if (!user) {
         console.log('❌ ERRO: Usuário não encontrado no banco');
         return res.status(404).json({
            errors: ['User not found']
         });
      }

      req.user = user;
      console.log('✅ Usuário autenticado:', user.email);

      // IMPORTANTE: Chama next() para continuar
      next();
   } catch (error) {
      console.log('\n❌ ERRO NO AUTH GUARD:');
      console.log('Error name:', error.name);
      console.log('Error message:', error.message);

      if (error.name === 'TokenExpiredError') {
         return res.status(403).json({
            errors: ['Token expired']
         });
      }

      if (error.name === 'JsonWebTokenError') {
         return res.status(403).json({
            errors: ['Invalid token']
         });
      }

      // Erro do banco de dados ou outros
      console.log('Stack trace:', error.stack);
      return res.status(500).json({
         errors: ['Authentication error']
      });
   }
};

module.exports = AuthGuard;
