import { data } from 'react-router-dom';
import { api, requestConfig } from '../utils/config';

//// Get user details

const profile = async (data, token) => {
   const config = requestConfig('GET', data, token);

   try {
      const res = await fetch(api + '/users/profile', config)
         .then(res => res.json())
         .catch(err => err);

      return res;
   } catch (error) {
      console.log(error);
   }
};

// update user details
// userService.js
const updateProfile = async (userData, token) => {
   try {
      console.log('Sending update request:', userData);

      const headers = {
         Authorization: `Bearer ${token}`,
         'Content-Type': 'application/json' // ADICIONE ESTA LINHA
      };

      const response = await fetch('http://localhost:5000/api/users/', {
         method: 'PUT',
         headers: headers,
         body: JSON.stringify(userData)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
         const errorData = await response.json();
         console.error('Server error response:', errorData);
         throw new Error(errorData.errors?.[0] || 'Update failed');
      }

      return await response.json();
   } catch (error) {
      console.error('Update profile error:', error);
      throw error;
   }
};

// Get user details
const getUserDetails = async id => {
   const config = requestConfig('GET');

   try {
      const res = await fetch(api + '/users/' + id, config)
         .then(res => res.json())
         .catch(err => err);

      return res;
   } catch (error) {
      console.log(error);
   }
};

const userService = {
   profile,
   updateProfile,
   getUserDetails
};

export default userService;
