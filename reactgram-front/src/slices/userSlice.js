// userSlice.js - VERSÃO COMPLETA CORRIGIDA
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Pega token do localStorage
const getToken = () => {
   const userStr = localStorage.getItem('user');
   if (!userStr) return null;
   try {
      const user = JSON.parse(userStr);
      return user.token;
   } catch {
      return null;
   }
};

// Pega user do localStorage preservando token
const getUser = () => {
   const userStr = localStorage.getItem('user');
   if (!userStr) return {};
   try {
      return JSON.parse(userStr);
   } catch {
      return {};
   }
};

const initialState = {
   user: getUser(),
   error: false,
   success: false,
   loading: false,
   message: null
};

// Get user profile - FUNÇÃO QUE ESTAVA FALTANDO
export const profile = createAsyncThunk('user/profile', async (_, thunkAPI) => {
   try {
      const token = getToken();

      if (!token) {
         throw new Error('Usuário não autenticado');
      }

      const response = await fetch('http://localhost:5000/api/users/profile', {
         headers: {
            Authorization: `Bearer ${token}`
         }
      });

      console.log('Profile response status:', response.status);

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.errors?.[0] || 'Erro ao carregar perfil');
      }

      const data = await response.json();
      console.log('Profile data:', data);

      // Preserva o token
      const userWithToken = {
         ...data,
         token: token
      };

      // Atualiza localStorage
      localStorage.setItem('user', JSON.stringify(userWithToken));

      return userWithToken;
   } catch (error) {
      console.error('Erro no profile:', error);
      return thunkAPI.rejectWithValue(error.message);
   }
});

export const updateProfile = createAsyncThunk(
   'user/updateProfile',
   async (userData, { rejectWithValue }) => {
      try {
         console.log('🔄 UPDATE PROFILE INICIADO');
         console.log('Tipo dos dados:', typeof userData);
         console.log('É FormData?', userData instanceof FormData);

         // Pega token
         const token = getToken();

         if (!token) {
            throw new Error('Usuário não autenticado');
         }

         let headers = {
            Authorization: `Bearer ${token}`
         };

         let body;

         if (userData instanceof FormData) {
            console.log('📤 Enviando como FormData');
            // NÃO adicionar Content-Type para FormData
            body = userData;
         } else {
            console.log('📤 Enviando como JSON');
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(userData);
         }

         console.log('Headers:', headers);

         const response = await fetch('http://localhost:5000/api/users/', {
            method: 'PUT',
            headers: headers,
            body: body
         });

         console.log('📥 Status:', response.status);

         const data = await response.json();
         console.log('📥 Resposta:', data);

         if (!response.ok) {
            throw new Error(data.errors?.[0] || 'Falha na atualização');
         }

         // Preserva o token
         const updatedUser = {
            ...(data.user || data),
            token: token
         };

         localStorage.setItem('user', JSON.stringify(updatedUser));

         return updatedUser;
      } catch (error) {
         console.error('💥 Erro:', error);
         return rejectWithValue(error.message);
      }
   }
);

export const userSlice = createSlice({
   name: 'user',
   initialState,
   reducers: {
      resetMessage: state => {
         state.message = null;
      },
      loginSuccess: (state, action) => {
         // Garante que o token está incluído
         state.user = action.payload;
         state.success = true;
         localStorage.setItem('user', JSON.stringify(action.payload));
      },
      logout: state => {
         state.user = {};
         state.success = false;
         localStorage.removeItem('user');
      },
      // Nova action para salvar token
      saveToken: (state, action) => {
         if (state.user) {
            state.user.token = action.payload;
            // Atualiza localStorage
            const currentUser = localStorage.getItem('user');
            if (currentUser) {
               try {
                  const userObj = JSON.parse(currentUser);
                  userObj.token = action.payload;
                  localStorage.setItem('user', JSON.stringify(userObj));
               } catch (error) {
                  console.error('Erro ao atualizar token:', error);
               }
            }
         }
      }
   },
   extraReducers: builder => {
      builder
         // CASES PARA PROFILE
         .addCase(profile.pending, state => {
            state.loading = true;
            state.error = false;
         })
         .addCase(profile.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.error = false;
            state.user = action.payload;
         })
         .addCase(profile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.user = {};
         })

         // CASES PARA UPDATE PROFILE
         .addCase(updateProfile.pending, state => {
            state.loading = true;
            state.error = false;
         })
         .addCase(updateProfile.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.error = false;
            state.user = action.payload;
            state.message = 'Atualizado com sucesso!';
         })
         .addCase(updateProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
         });
   }
});

export const { resetMessage, loginSuccess, logout, saveToken } =
   userSlice.actions;
export default userSlice.reducer;
