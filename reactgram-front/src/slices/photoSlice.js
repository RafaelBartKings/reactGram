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

      // Check for errors
      if (data.errors) {
         return thunkAPI.rejectWithValue(data.errors[0]);
      }

      return data;
   }
);

// funcoes

export const photoSlice = createSlice({
   name: 'photo',
   initialState,
   reducers: {
      resetMessage: state => {
         state.message = null;
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
            state.photo = action.payload; // Atualiza o USUÁRIO AUTENTICADO
            state.photos.unshift(state.photo);
            state.message = 'Foto publicada com sucesso!';
         })
         .addCase(publishPhoto.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.photo = {}; // Atualiza o USUÁRIO AUTENTICADO
         });
   }
});

export const { resetMessage } = photoSlice.actions;
export default photoSlice.reducer;
