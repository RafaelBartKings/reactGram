const express = require('express');
const multer = require('multer');
const path = require('path');

// Configuração do multer para armazenamento em disco
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, 'uploads/users/');
   },
   filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
   }
});

const upload = multer({
   storage: storage,
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
   fileFilter: function (req, file, cb) {
      const filetypes = /jpeg|jpg|png|gif/;
      const extname = filetypes.test(
         path.extname(file.originalname).toLowerCase()
      );
      const mimetype = filetypes.test(file.mimetype);

      if (mimetype && extname) {
         return cb(null, true);
      } else {
         cb(new Error('Apenas imagens são permitidas'));
      }
   }
});

const handleMultiPart = (req, res, next) => {
   console.log('\n=== handleMultiPart ===');
   console.log('Content-Type:', req.headers['content-type'] || 'NOT PROVIDED');

   const contentType = req.headers['content-type'] || '';

   if (contentType.includes('multipart/form-data')) {
      console.log('Processando como FormData');

      upload.single('profileImage')(req, res, err => {
         if (err) {
            console.error('Erro no upload:', err.message);
            return res.status(400).json({ errors: [err.message] });
         }

         console.log('Arquivo:', req.file ? req.file.filename : 'Nenhum');
         console.log('Body (campos de texto):', req.body);

         // O multer já coloca os campos de texto em req.body
         next();
      });
   } else {
      console.log('Processando como JSON');
      express.json()(req, res, err => {
         if (err) {
            console.error('Erro no JSON parser:', err);
            return res.status(400).json({ errors: ['Invalid JSON'] });
         }
         console.log('Body:', req.body);
         next();
      });
   }
};

module.exports = handleMultiPart;
