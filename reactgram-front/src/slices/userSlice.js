// userSlice.js - VERSÃO CORRIGIDA COM ESTADOS SEPARADOS
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
   user: getUser(),           // Usuário autenticado (EU)
   visitedUser: {},           // Usuário sendo visitado (OUTRO)
   error: false,
   success: false,
   loading: false,
   message: null
};

// Get MY profile (usuário autenticado)
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


      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.errors?.[0] || 'Erro ao carregar perfil');
      }

      const data = await response.json();

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
            body = userData;
         } else {
            console.log('📤 Enviando como JSON');
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(userData);
         }

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

// Get OTHER user details
export const getUserDetails = createAsyncThunk(
   'user/getUserDetails',
   async (id, thunkAPI) => {
      try {
         console.log('🆔 Buscando detalhes do usuário com ID:', id);

         // Verifica se o ID é válido
         if (!id || id === 'undefined') {
            // console.error('❌ ID inválido ou não fornecido');
            return thunkAPI.rejectWithValue('ID do usuário é necessário');
         }

         // Faz a requisição
         const response = await fetch(`http://localhost:5000/api/users/${id}`);

         console.log('📤 Status da resposta:', response.status);

         if (!response.ok) {
            const errorData = await response.json();
            // console.error('❌ Erro do servidor:', errorData);
            throw new Error(errorData.errors?.[0] || 'Falha ao buscar usuário');
         }

         const data = await response.json();
         console.log('✅ Usuário encontrado:', data.name);

         return data;
      } catch (error) {
         console.error('💥 Erro ao buscar detalhes do usuário:', error);
         return thunkAPI.rejectWithValue(error.message);
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
         state.user = action.payload;
         state.success = true;
         localStorage.setItem('user', JSON.stringify(action.payload));
      },
      logout: state => {
         state.user = {};
         state.visitedUser = {};
         state.success = false;
         localStorage.removeItem('user');
      },
      saveToken: (state, action) => {
         if (state.user) {
            state.user.token = action.payload;
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
      },
      // Novo: limpa o visitedUser
      clearVisitedUser: (state) => {
         state.visitedUser = {};
      }
   },

   extraReducers: builder => {
      builder
         // CASES PARA PROFILE (MEU perfil)
         .addCase(profile.pending, state => {
            state.loading = true;
            state.error = false;
         })
         .addCase(profile.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.error = false;
            state.user = action.payload; // Atualiza o USUÁRIO AUTENTICADO
         })
         .addCase(profile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.user = {};
         })

         // CASES PARA UPDATE PROFILE (atualiza MEU perfil)
         .addCase(updateProfile.pending, state => {
            state.loading = true;
            state.error = false;
         })
         .addCase(updateProfile.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.error = false;
            state.user = action.payload; // Atualiza o USUÁRIO AUTENTICADO
            state.message = 'Atualizado com sucesso!';
         })
         .addCase(updateProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
         })

         // CASO PARA getUserDetails (perfil de OUTRO usuário)
         .addCase(getUserDetails.pending, state => {
            state.loading = true;
            state.error = false;
         })
         .addCase(getUserDetails.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.error = false;
            state.visitedUser = action.payload; // Salva no visitedUser, NÃO no user
         })
         .addCase(getUserDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.visitedUser = {};
         });
   }
});

export const { resetMessage, loginSuccess, logout, saveToken, clearVisitedUser } =
   userSlice.actions;
export default userSlice.reducer;