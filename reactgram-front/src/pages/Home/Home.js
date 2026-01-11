import './Home.css';

// components
import LikeContainer from '../../components/LikeContainer';
import PhotoItem from '../../components/PhotoItem';
import { Link } from 'react-router-dom';

// hooks
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useResetComponentMessage } from '../../hooks/useResetComponentMessage';

// redux
import { getPhotos, likePhoto } from '../../slices/photoSlice';

// Ícones (você pode usar react-icons ou SVG)
import {
   FaCamera,
   FaHeart,
   FaRegHeart,
   FaEye,
   FaUserCircle
} from 'react-icons/fa';
import { uploads } from '../../utils/config';

const Home = () => {
   const dispatch = useDispatch();
   const resetMessage = useResetComponentMessage(dispatch);
   const { user } = useSelector(state => state.auth);
   const { photos, loading, error } = useSelector(state => state.photo);

   // Load all photos
   useEffect(() => {
      dispatch(getPhotos());
   }, [dispatch]);

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

   if (error) {
      return (
         <div className="no-photos-container">
            <div className="no-photos-icon">⚠️</div>
            <h2>Oops!</h2>
            <p>{error}</p>
            <button onClick={() => dispatch(getPhotos())} className="cta-btn">
               Tentar novamente
            </button>
         </div>
      );
   }

   return (
      <div id="home">
         <header className="home-header">
            <h1>Explore fotos incríveis</h1>
            <p className="subtitle">
               {photos?.length > 0
                  ? `${photos.length} fotos para inspirar você`
                  : 'Compartilhe seus momentos com o mundo'}
            </p>
         </header>

         {photos && photos.length > 0 ? (
            <div className="photo-grid">
               {photos.map(photo => (
                  <div key={photo._id} className="photo-item">
                     {/* Cabeçalho com info do usuário */}
                     <div className="photo-header">
                        {photo.userImage ? (
                           <img
                              src={`${uploads}/users/${photo.userImage}`}
                              alt={photo.userName}
                              className="user-avatar"
                           />
                        ) : (
                           <FaUserCircle className="user-avatar" size={40} />
                        )}
                        <div className="user-info">
                           <p className="user-name">{photo.userName}</p>
                           <p className="photo-date">
                              {new Date(photo.createdAt).toLocaleDateString(
                                 'pt-BR'
                              )}
                           </p>
                        </div>
                     </div>

                     {/* Imagem da foto */}
                     <div className="photo-image-container">
                        <img
                           src={`${uploads}/photos/${photo.image}`}
                           alt={photo.title}
                           className="photo-image"
                        />
                     </div>

                     {/* Título e descrição */}
                     <div className="photo-content">
                        <h3 className="photo-title">{photo.title}</h3>
                        {photo.description && (
                           <p className="photo-description">
                              {photo.description}
                           </p>
                        )}
                     </div>

                     {/* Ações */}
                     <div className="photo-actions">
                        <div className="like-section">
                           <button
                              onClick={() => handleLike(photo)}
                              className={`like-btn ${
                                 photo.likes?.includes(user?._id) ? 'liked' : ''
                              }`}
                              title={
                                 photo.likes?.includes(user?._id)
                                    ? 'Descurtir'
                                    : 'Curtir'
                              }
                           >
                              {photo.likes?.includes(user?._id) ? (
                                 <FaHeart size={20} />
                              ) : (
                                 <FaRegHeart size={20} />
                              )}
                           </button>
                           <span className="like-count">
                              {photo.likes?.length || 0} curtidas
                           </span>
                        </div>

                        <Link to={`/photos/${photo._id}`} className="view-btn">
                           <FaEye /> Ver mais
                        </Link>
                     </div>

                     {/* Comentários preview */}
                     {photo.comments?.length > 0 && (
                        <div className="comments-preview">
                           <p className="comment-count">
                              {photo.comments.length} comentário
                              {photo.comments.length !== 1 ? 's' : ''}
                           </p>
                           <p className="last-comment">
                              <strong>{photo.comments[0].userName}:</strong>{' '}
                              {photo.comments[0].comment.substring(0, 50)}...
                           </p>
                        </div>
                     )}
                  </div>
               ))}
            </div>
         ) : (
            <div className="no-photos-container">
               <div className="no-photos-icon">
                  <FaCamera size={64} />
               </div>
               <h2>Nenhuma foto publicada ainda</h2>
               <p>Seja o primeiro a compartilhar suas fotos incríveis!</p>
               {user ? (
                  <Link to={`/users/${user._id}`} className="cta-btn">
                     Publicar minha primeira foto
                  </Link>
               ) : (
                  <Link to="/login" className="cta-btn">
                     Entre para começar
                  </Link>
               )}
            </div>
         )}
      </div>
   );
};

export default Home;
