const Photo = require('../models/Photo');
const mongoose = require('mongoose');
const User = require('../models/User');

// Insert photo with a user related to it
const insertPhoto = async (req, res) => {
   const { title } = req.body;
   const image = req.file.filename;

   const reqUser = req.user;

   const user = await User.findById(reqUser._id);

   // Create a photo
   const newPhoto = await Photo.create({
      image,
      title,
      userId: user._id,
      userName: user.name
   });

   // If photo was created successfully
   if (!newPhoto) {
      res.status(422).json({
         errors: ['Houve um problema, por favor tente novamente mais tarde.']
      });
      return;
   }

   res.status(201).json(newPhoto);
};

// remove photo fomr DB
const deletePhoto = async (req, res) => {
   const { id } = req.params;
   const reqUser = req.user;

   if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(422).json({ errors: ['Invalid photo id'] });
   }

   // 🔹 Busca a foto (Mongoose já converte o id)
   const photo = await Photo.findById(id);

   // 🔹 Verifica se a foto existe
   if (!photo) {
      return res.status(404).json({ errors: ['Photo not found'] });
   }

   // 🔹 Verifica se a foto pertence ao usuário

   if (!photo.userId.equals(reqUser._id)) {
      return res.status(422).json({
         errors: ['Something went wrong, please try again later.']
      });
   }

   // 🔹 Deleta a foto
   await Photo.findByIdAndDelete(photo._id);

   // 🔹 Resposta de sucesso
   res.status(200).json({
      id: photo._id,
      message: 'Foto excluida com sucesso'
   });
};

// Get all photos

const getAllPhotos = async (req, res) => {
   const photos = await Photo.find({})
      .sort([['createdAt', -1]])
      .exec();

   return res.status(200).json(photos);
};

// Get user phots
const getUserPhotos = async (req, res) => {
   const { id } = req.params;
   const photos = await Photo.find({ userId: id })
      .sort([['createdAt', -1]])
      .exec();

   return res.status(200).json(photos);
};

const getPhotoById = async (req, res) => {
   const { id } = req.params;

   try {
      const photo = await Photo.findById(id);

      if (!photo) {
         return res.status(404).json({ errors: ['Photo not found.'] });
      }

      return res.status(200).json(photo);
   } catch (error) {
      return res.status(422).json({
         errors: ['Invalid photo id']
      });
   }
};

// Update photo
const updatePhoto = async (req, res) => {
   const { id } = req.params;
   const title = req.body?.title;
   const reqUser = req.user;

   // Validação do ID
   if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(422).json({ errors: ['Invalid photo id'] });
   }

   const photo = await Photo.findById(id);

   if (!photo) {
      return res.status(404).json({ errors: ['Photo not found'] });
   }

   // Verifica se a foto pertence ao usuário
   if (!photo.userId.equals(reqUser._id)) {
      return res.status(403).json({
         errors: ['You are not allowed to update this photo']
      });
   }

   if (title) {
      photo.title = title;
   }

   await photo.save();

   return res.status(200).json({
      photo,
      message: 'Photo updated successfully'
   });
};

// Like function

const likePhoto = async (req, res) => {
   const { id } = req.params;
   const reqUser = req.user;

   try {
      const photo = await Photo.findById(id);

      if (!photo) {
         return res.status(404).json({ errors: ['Photo not found'] });
      }

      if (photo.likes.some(likeId => likeId.equals(reqUser._id))) {
         return res
            .status(422)
            .json({ errors: ['You already liked this photo.'] });
      }

      photo.likes.push(reqUser._id);
      await photo.save();

      // 5. Retornar resposta de sucesso
      return res.status(200).json({
         photoId: id,
         userId: reqUser._id,
         message: 'The photo was liked!'
      });
   } catch (error) {
      console.error('Like Error:', error);
      return res.status(500).json({ errors: ['Internal server error.'] });
   }
};

// [PUT] /photos/unlike/:id - Remover like da foto
const unlikePhoto = async (req, res) => {
   const { id } = req.params;
   const reqUser = req.user;

   try {
      const photo = await Photo.findById(id);

      // 1. Verificar se a foto existe
      if (!photo) {
         return res.status(404).json({ errors: ['Photo not found'] });
      }

      // 2. Verificar se o utilizador realmente tinha dado like
      if (!photo.likes.some(likeId => likeId.equals(reqUser._id))) {
         return res
            .status(422)
            .json({ errors: ['You have not liked this photo yet.'] });
      }

      // 3. Remover o ID do utilizador do array de likes
      photo.likes = photo.likes.filter(likeId => !likeId.equals(reqUser._id));

      // 4. Salvar as alterações
      await photo.save();

      return res.status(200).json({
         photoId: id,
         userId: reqUser._id,
         message: 'Like removed successfully.'
      });
   } catch (error) {
      console.error('Unlike Error:', error);
      return res.status(500).json({ errors: ['Internal server error.'] });
   }
};

// Comment functionality
const commentPhoto = async (req, res) => {
   const { id } = req.params;
   const { comment } = req.body;
   const reqUser = req.user;

   // Validate photo id
   if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(422).json({ errors: ['Invalid photo id'] });
   }

   // Validate comment
   if (!comment || comment.trim().length === 0) {
      return res.status(422).json({ errors: ['Comment is required'] });
   }

   if (comment.length > 200) {
      return res.status(422).json({ errors: ['Comment too long'] });
   }

   try {
      const user = await User.findById(reqUser._id);

      if (!user) {
         return res.status(404).json({ errors: ['User not found'] });
      }

      const photo = await Photo.findById(id);

      if (!photo) {
         return res.status(404).json({ errors: ['Photo not found'] });
      }

      // Create comment
      const userComment = {
         comment,
         userName: user.name,
         userImage: user.profileImage,
         userId: user._id
      };

      photo.comments.push(userComment);
      await photo.save();

      return res.status(200).json({
         comment: userComment,
         message: 'O comentário foi adicionado com sucesso.'
      });
   } catch (error) {
      console.error(error);
      return res.status(500).json({
         errors: ['Something went wrong, please try again later']
      });
   }
};

// Search photos by title
// Search photos by title
const searchPhotos = async (req, res) => {
   const { q } = req.query;

   try {
      if (!q) {
         return res.status(422).json({ errors: ['Search query is required'] });
      }

      const photos = await Photo.find({
         title: new RegExp(q, 'i')
      }).sort([['createdAt', -1]]);

      return res.status(200).json(photos);
   } catch (error) {
      console.error(error);
      return res.status(500).json({
         errors: ['Something went wrong, please try again later']
      });
   }
};

module.exports = {
   insertPhoto,
   deletePhoto,
   getAllPhotos,
   getUserPhotos,
   getPhotoById,
   updatePhoto,
   likePhoto,
   unlikePhoto,
   commentPhoto,
   searchPhotos
};
