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

// Like photo

// Like photo - VERSÃO QUE BUSCA A FOTO ATUALIZADA
const like = async (id, token) => {
   const config = {
      method: 'PUT',
      headers: {
         'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({})
   };

   try {
      const url = `${api}/photos/like/${id}`;
      const res = await fetch(url, config);
      const result = await res.json();

      // Se for sucesso (200) mas não tem os dados completos
      if (res.ok) {
         // Busca a foto atualizada
         const photoResponse = await fetch(`${api}/photos/${id}`, {
            headers: {
               Authorization: `Bearer ${token}`
            }
         });

         if (photoResponse.ok) {
            const photoData = await photoResponse.json();
            return photoData; // Retorna a foto completa
         }
      }

      // Se for erro 422, retorna o resultado para tratamento
      if (res.status === 422) {
         console.log('Usuário já deu like');
         return result;
      }

      if (!res.ok) {
         throw new Error(result.message || `Erro ${res.status}`);
      }

      return result;
   } catch (error) {
      console.error('Erro no like:', error);
      throw error;
   }
};

const photoService = {
   publishPhoto,
   getUserPhotos,
   deletePhoto,
   updatePhoto,
   getPhoto,
   like
};

export default photoService;
