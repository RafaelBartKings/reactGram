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

const photoService = {
   publishPhoto,
   getUserPhotos
};

export default photoService;
