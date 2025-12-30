import { api, requestConfig } from '../utils/config';

// Register an user
const register = async data => {
   const config = requestConfig('POST', data);

   try {
      const response = await fetch(api + '/users/register', config);

      // Converte a resposta para JSON
      const res = await response.json();

      console.log('Register response:', { status: response.status, data: res }); // DEBUG

      if (!response.ok) {
         // Se tiver erro, retorna objeto com errors
         return {
            errors: res.errors || [`Erro ${response.status}`]
         };
      }

      // Se foi sucesso, salva no localStorage
      if (res._id) {
         // Verifica se tem ID (indica sucesso)
         localStorage.setItem('user', JSON.stringify(res));
      }

      return res;
   } catch (error) {
      console.error('Register error:', error);
      return {
         errors: ['Erro de conexão com o servidor']
      };
   }
};

// Sign in an user
const login = async data => {
   const config = requestConfig('POST', data);

   try {
      console.log('Login attempt with:', data); // DEBUG

      const response = await fetch(api + '/users/login', config);

      // Converte a resposta para JSON
      const res = await response.json();

      console.log('Login response:', {
         status: response.status,
         ok: response.ok,
         data: res
      }); // DEBUG

      if (!response.ok) {
         // Erro do backend (422, 404, etc.)
         console.error('Login failed:', res.errors); // DEBUG
         return {
            errors: res.errors || [
               `Erro ${response.status}: ${response.statusText}`
            ]
         };
      }

      // Sucesso - salva no localStorage
      if (res._id) {
         localStorage.setItem('user', JSON.stringify(res));
         console.log('User saved to localStorage:', res._id); // DEBUG
      }

      return res;
   } catch (error) {
      console.error('Login connection error:', error);
      return {
         errors: ['Erro de conexão. Verifique se o servidor está rodando.']
      };
   }
};

// Logout
const logout = () => {
   localStorage.removeItem('user');
   return { success: true };
};

const authService = {
   register,
   logout,
   login
};

export default authService;
