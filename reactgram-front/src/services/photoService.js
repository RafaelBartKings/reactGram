import { api, requestConfig } from '../utils/config';

// Publish an user photo
const publishPhoto = async (data, token) => {
   const config = requestConfig('POST', data, token, true);

   try {
      const response = await fetch(api + '/photos', config);

      if (!response.ok) {
         throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result;
   } catch (error) {
      return { errors: [error.message] };
   }
};

// Get user photos
const getUserPhotos = async (id, token) => {
   const config = requestConfig('GET', null, token);

   try {
      const response = await fetch(api + '/photos/user/' + id, config);

      if (!response.ok) {
         const errorText = await response.text();
         throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      return data;
   } catch (error) {
      return []; // Retorna array vazio em caso de erro
   }
};

const deletePhoto = async (id, token) => {
   const config = requestConfig('DELETE', null, token);

   try {
      const res = await fetch(api + '/photos/' + id, config);
      const data = await res.json();
      return data;
   } catch (error) {
      console.log(error);
   }
};

const updatePhoto = async (id, data, token) => {
   const config = requestConfig('PUT', data, token);

   try {
      const res = await fetch(api + '/photos/' + id, config);
      const result = await res.json();
      return result;
   } catch (error) {
      console.log(error);
   }
};

// Get a photo by id
const getPhoto = async (id, token) => {
   const config = requestConfig('GET', null, token);

   try {
      const res = await fetch(api + '/photos/' + id, config);
      const result = await res.json();
      return result;
   } catch (error) {
      console.log(error);
   }
};

const photoService = {
   publishPhoto,
   getUserPhotos,
   deletePhoto,
   updatePhoto,
   getPhoto
};

export default photoService;
