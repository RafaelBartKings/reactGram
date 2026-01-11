import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import photoService from '../services/photoService';

const initialState = {
   photos: [],
   photo: {
      comments: []
   },
   error: false,
   success: false,
   loading: false,
   message: null
};

// Public user photo
export const publishPhoto = createAsyncThunk(
   'photo/publish',
   async (photo, thunkAPI) => {
      const token = thunkAPI.getState().auth.user.token;

      const data = await photoService.publishPhoto(photo, token);

      if (data.errors) {
         return thunkAPI.rejectWithValue(data.errors[0]);
      }

      return data;
   }
);

// Get user photos
export const getUserPhotos = createAsyncThunk(
   'photos/userphotos',
   async (id, thunkAPI) => {
      try {
         const state = thunkAPI.getState();
         const token = state.auth.user?.token;

         if (!token) {
            return thunkAPI.rejectWithValue('Token não encontrado');
         }

         const data = await photoService.getUserPhotos(id, token);

         return data;
      } catch (error) {
         return thunkAPI.rejectWithValue(error.message);
      }
   }
);

export const deletePhoto = createAsyncThunk(
   'photo/delete',
   async (id, thunkAPI) => {
      const token = thunkAPI.getState().auth.user.token;
      const data = await photoService.deletePhoto(id, token);

      if (data.errors) {
         return thunkAPI.rejectWithValue(data.errors[0]);
      }

      return data;
   }
);

export const updatePhoto = createAsyncThunk(
   'photo/update',
   async (photoData, thunkAPI) => {
      const token = thunkAPI.getState().auth.user.token;
      const data = await photoService.updatePhoto(
         photoData.id,
         { title: photoData.title },
         token
      );

      if (data.errors) {
         return thunkAPI.rejectWithValue(data.errors[0]);
      }

      return data;
   }
);

// Get photo by id
export const getPhoto = createAsyncThunk(
   'photo/getphoto',
   async (id, thunkAPI) => {
      const token = thunkAPI.getState().auth.user.token;
      const data = await photoService.getPhoto(id, token);

      return data;
   }
);

export const likePhoto = createAsyncThunk(
   'photo/like',
   async (id, thunkAPI) => {
      const token = thunkAPI.getState().auth.user.token;

      if (!token) {
         return thunkAPI.rejectWithValue('Usuário não autenticado');
      }

      try {
         const data = await photoService.like(id, token);

         if (data.errors) {
            return thunkAPI.rejectWithValue(data.errors[0]);
         }

         return data;
      } catch (error) {
         return thunkAPI.rejectWithValue(error.message || 'Erro ao dar like');
      }
   }
);

// Add comment to photo

export const comment = createAsyncThunk(
   'photo/comment',
   async ({ commentData, photoId }, thunkAPI) => {
      const token = thunkAPI.getState().auth.user.token;

      try {
         const data = await photoService.comment(
            { comment: commentData }, // Envia {comment: "texto"}
            photoId,
            token
         );

         if (data.errors) {
            return thunkAPI.rejectWithValue(data.errors[0]);
         }

         // ✅ CORREÇÃO: Estrutura correta do payload
         return {
            newComment: data.comment, // O objeto completo do comentário
            message: data.message,
            photoId
         };
      } catch (error) {
         return thunkAPI.rejectWithValue(error.message);
      }
   }
);

// Get all photos
export const getPhotos = createAsyncThunk(
   'photo/getphotos',
   async (_, thunkAPI) => {
      const state = thunkAPI.getState();
      const token = state.auth.user?.token;

      if (!token) {
         return thunkAPI.rejectWithValue('Usuário não autenticado');
      }

      try {
         const data = await photoService.getPhotos(token);
         return data;
      } catch (error) {
         // Melhor capturar a mensagem do erro
         return thunkAPI.rejectWithValue(
            error.response?.data?.message ||
               error.message ||
               'Erro ao buscar fotos'
         );
      }
   }
);

export const photoSlice = createSlice({
   name: 'photo',
   initialState,
   reducers: {
      resetMessage: state => {
         state.message = null;
      },
      resetPhotos: state => {
         state.photos = [];
         state.loading = false;
         state.error = false;
      }
   },
   extraReducers: builder => {
      builder
         // CASES PARA publishPhoto
         .addCase(publishPhoto.pending, state => {
            state.loading = true;
            state.error = false;
         })
         .addCase(publishPhoto.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.error = false;
            state.photo = action.payload;
            state.message = 'Foto publicada com sucesso!';
         })
         .addCase(publishPhoto.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.photo = {};
         })

         // CASES PARA getUserPhotos
         .addCase(getUserPhotos.pending, state => {
            state.loading = true;
            state.error = false;
         })
         .addCase(getUserPhotos.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.error = false;

            // ✅ FORÇAR ATUALIZAÇÃO COM LOG
            const newPhotos = Array.isArray(action.payload)
               ? action.payload
               : [];

            state.photos = newPhotos;
         })
         .addCase(getUserPhotos.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.photos = [];
         })

         .addCase(deletePhoto.pending, state => {
            state.loading = true;
            state.error = false;
         })
         .addCase(deletePhoto.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.error = false;
            state.photos = state.photos.filter(
               photo => photo._id !== action.payload._id
            );
            state.message = 'Foto excluída com sucesso!';
         })
         .addCase(deletePhoto.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })

         .addCase(updatePhoto.pending, state => {
            state.loading = true;
            state.error = false;
         })
         .addCase(updatePhoto.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.error = false;
            // Atualiza a foto na lista
            state.photos = state.photos.map(photo =>
               photo._id === action.payload._id ? action.payload : photo
            );
            state.message = 'Foto atualizada com sucesso!';
         })
         .addCase(updatePhoto.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })

         .addCase(getPhoto.pending, state => {
            state.loading = true;
            state.error = false;
            state.success = false;
         })
         .addCase(getPhoto.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.error = false;

            // Atualiza a foto individual
            state.photo = action.payload || {};

            // Se quiser também atualizar na lista (opcional):
            if (action.payload?._id && state.photos) {
               const updatedPhotos = state.photos.map(photo =>
                  photo._id === action.payload._id ? action.payload : photo
               );
               state.photos = updatedPhotos;
            }
         })
         .addCase(getPhoto.rejected, (state, action) => {
            state.loading = false;
            state.success = false;
            state.error = action.payload || 'Erro ao carregar a foto';
            state.photo = {}; // Limpa a foto atual em caso de erro
         })

         // photoSlice.js - Atualize o reducer do likePhoto.fulfilled
         .addCase(likePhoto.fulfilled, (state, action) => {
            // Guarde o número de likes ANTES de atualizar
            const previousLikesCount = state.photo?.likes?.length || 0;

            state.loading = false;
            state.success = true;
            state.error = null;

            const updatedPhoto = action.payload;

            if (!updatedPhoto || !updatedPhoto._id) {
               console.error('Payload inválido no like');
               return;
            }

            // Atualiza a foto individual
            if (state.photo && state.photo._id === updatedPhoto._id) {
               state.photo = {
                  ...state.photo,
                  likes: updatedPhoto.likes || [],
                  likedByUser:
                     updatedPhoto.likes?.includes(updatedPhoto.userId) || false
               };
            }

            // Atualiza a foto na lista de fotos
            if (state.photos && Array.isArray(state.photos)) {
               state.photos = state.photos.map(photo => {
                  if (photo._id === updatedPhoto._id) {
                     return {
                        ...photo,
                        likes: updatedPhoto.likes || [],
                        likedByUser:
                           updatedPhoto.likes?.includes(photo.userId) || false
                     };
                  }
                  return photo;
               });
            }

            // Compare com o valor ANTES da atualização
            const newLikesCount = updatedPhoto.likes?.length || 0;

            if (newLikesCount > previousLikesCount) {
               state.message = 'Like adicionado!';
            } else if (newLikesCount < previousLikesCount) {
               state.message = 'Like removido!';
            } else {
               state.message = 'Like atualizado!';
            }
         })
         .addCase(likePhoto.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
            state.message = action.payload || 'Erro ao dar like';
         })
         .addCase(comment.pending, state => {
            state.loading = true;
            state.error = false;
         })
         .addCase(comment.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.error = null;

            // Extrai os dados da forma correta
            const { photoId, newComment, message } = action.payload;

            // ✅ 1. Atualiza a foto individual (state.photo)
            if (state.photo && state.photo._id === photoId) {
               // Cria um novo array com o novo comentário
               const updatedComments = [
                  ...(state.photo.comments || []),
                  newComment // Este é o objeto: {comment: "Boa", userName: "rafis", ...}
               ];

               // Atualiza o estado IMUTAVELMENTE
               state.photo = {
                  ...state.photo,
                  comments: updatedComments
               };
            }

            // ✅ 2. Atualiza na lista de fotos (state.photos)
            if (state.photos && Array.isArray(state.photos)) {
               state.photos = state.photos.map(photo => {
                  if (photo._id === photoId) {
                     return {
                        ...photo,
                        comments: [...(photo.comments || []), newComment]
                     };
                  }
                  return photo;
               });
            }

            state.message = message;
         })
         .addCase(comment.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
            state.message = action.payload || 'Erro ao fazer o comentário';
         })
         .addCase(getPhotos.pending, state => {
            state.loading = true;
            state.error = false;
            state.success = false;
         })
         .addCase(getPhotos.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.error = false;

            // Garante que é um array
            const newPhotos = Array.isArray(action.payload)
               ? action.payload
               : [];

            state.photos = newPhotos;
            state.message = `Carregadas ${newPhotos.length} fotos`;
         })
         .addCase(getPhotos.rejected, (state, action) => {
            state.loading = false;
            state.success = false;
            state.error = action.payload || 'Erro ao carregar fotos';
            state.photos = []; // Limpa a lista em caso de erro
         });
   }
});

// ✅ Exportar todas as actions
export const { resetMessage, resetPhotos, logState } = photoSlice.actions;
export default photoSlice.reducer;
