import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import photoService from '../services/photoService';

const initialState = {
   photos: [],
   photo: {},
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

export const photoSlice = createSlice({
   name: 'photo',
   initialState,
   reducers: {
      resetMessage: state => {
         console.log('🗑️ Reducer: resetMessage');
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
            console.log(
               '🔄 Atualizando photos de',
               state.photos.length,
               'para',
               newPhotos.length
            );

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
         })
         .addCase(getPhoto.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.error = false;
            state.photo = action.payload;
         });
   }
});

// ✅ Exportar todas as actions
export const { resetMessage, resetPhotos, logState } = photoSlice.actions;
export default photoSlice.reducer;
