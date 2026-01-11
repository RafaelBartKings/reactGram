import './Search.css';

import React from 'react';

// hooks
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useResetComponentMessage } from '../../hooks/useResetComponentMessage';
import { useQuery } from '../../hooks/useQuery';

// components
import LikeContainer from '../../components/LikeContainer';
import PhotoItem from '../../components/PhotoItem';
import { Link } from 'react-router-dom';

// redux
import { searchPhotos, likePhoto, resetMessage } from '../../slices/photoSlice';

const Search = () => {
   const query = useQuery();
   const search = query.get('q');

   const dispatch = useDispatch();
   const resetMessageComponent = useResetComponentMessage(dispatch);
   const { user } = useSelector(state => state.auth);
   const { photos, loading, message } = useSelector(state => state.photo);

   // Load photos
   useEffect(() => {
      dispatch(searchPhotos(search));
   }, [dispatch, search]);

   // Like a photo
   const handleLike = photo => {
      dispatch(likePhoto(photo._id));
      resetMessage();
   };

   if (loading) {
      return (
         <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Carregando fotos...</p>
         </div>
      );
   }

   return (
      <div id="search">
         <h2>Você está buscando por: {search}</h2>

         {photos &&
            photos.map(photo => (
               <div key={photo._id}>
                  <PhotoItem photo={photo} />
                  <LikeContainer
                     photo={photo}
                     user={user}
                     handleLike={handleLike}
                  />
                  <Link className="btn" to={`/photos/${photo._id}`}>
                     Ver mais
                  </Link>
               </div>
            ))}
         {photos && photos.length === 0 && (
            <h2 className="no-photos">
               Não foram encontrados resultados para sua busca!
            </h2>
         )}
      </div>
   );
};

export default Search;
