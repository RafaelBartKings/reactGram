import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice'; // ← CORRIJA ESTA LINHA

export const store = configureStore({
   reducer: {
      auth: authReducer,
      user: userReducer // Agora apontando para o seu próprio userSlice
   }
});
