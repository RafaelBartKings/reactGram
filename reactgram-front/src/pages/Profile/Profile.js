// Profile.js - VERSÃO COM MENSAGEM DE SUCESSO
import './Profile.css';

import { uploads } from '../../utils/config';
import Message from '../../components/Message';
import { Link, useParams, useNavigate } from 'react-router-dom';

import { BsPencilFill } from 'react-icons/bs';
import { useSelector, useDispatch } from 'react-redux';
import { getUserDetails } from '../../slices/userSlice';
import { useEffect, useRef, useState } from 'react';
import { publishPhoto, resetMessage } from '../../slices/photoSlice';

const Profile = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const dispatch = useDispatch();

   const { visitedUser, loading, error } = useSelector(state => state.user || {});
   const { user: userAuth } = useSelector(state => state.auth || {});
   
   const {
      photos = [],
      loading: loadingPhoto = false,
      message: messagePhoto = '',
      error: errorPhoto = ''
   } = useSelector(state => state.photo || {});

   const [title, setTitle] = useState('');
   const [image, setImage] = useState('');
   const [preview, setPreview] = useState('');
   const [localSuccess, setLocalSuccess] = useState(''); // ← ESTADO LOCAL PARA MENSAGEM

   const isMyProfile = userAuth && id && userAuth._id && id === userAuth._id;
   const userToShow = isMyProfile ? userAuth : visitedUser;

   const newPhotoForm = useRef();

   useEffect(() => {
      if (!id || id === 'undefined') {
         if (userAuth && userAuth._id) {
            navigate(`/users/${userAuth._id}`);
         } else {
            navigate('/');
         }
         return;
      }

      if (id && id !== 'undefined') {
         if (!userAuth || !userAuth._id || id !== userAuth._id) {
            dispatch(getUserDetails(id));
         }
      }
   }, [id, navigate, dispatch, userAuth]);

   const handleFile = e => {
      const file = e.target.files[0];
      if (file) {
         setImage(file);
         
         const reader = new FileReader();
         reader.onloadend = () => {
            setPreview(reader.result);
         };
         reader.readAsDataURL(file);
      }
   };

   const submitHandle = async e => {
      e.preventDefault();

      if (!image) {
         alert('Selecione uma imagem!');
         return;
      }

      if (!title.trim()) {
         alert('Digite um título para a foto!');
         return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('image', image);

      try {
         const result = await dispatch(publishPhoto(formData));
         
         if (publishPhoto.fulfilled.match(result)) {
            console.log('Foto publicada com sucesso:', result.payload);
            
            // Limpa o formulário
            setTitle('');
            setImage('');
            setPreview('');
            
            // Limpa o input de arquivo
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';
            
            // Define mensagem de sucesso local
            setLocalSuccess('Foto publicada com sucesso!');
            
            // Limpa a mensagem local após 3 segundos
            setTimeout(() => {
               setLocalSuccess('');
            }, 3000);
            
            // Limpa a mensagem do Redux se existir
            setTimeout(() => {
               dispatch(resetMessage());
            }, 3000);
         }
         
         // Se houver erro
         if (publishPhoto.rejected.match(result)) {
            console.error('Erro ao publicar foto:', result.error);
         }
      } catch (error) {
         console.error('Erro ao publicar foto:', error);
      }
   };

   // Limpa a mensagem manualmente
   const handleCloseMessage = () => {
      dispatch(resetMessage());
      setLocalSuccess('');
   };

   // Loading
   if (loading && !isMyProfile) {
      return (
         <div id="profile">
            <div className="loading-container">
               <p>Carregando perfil...</p>
            </div>
         </div>
      );
   }

   // Erro
   if (error && !isMyProfile) {
      return (
         <div id="profile">
            <Message msg={error} type="error" />
            <Link to="/" className="btn">
               Voltar para Home
            </Link>
         </div>
      );
   }

   // Se não há usuário para mostrar
   if (!userToShow || !userToShow.name) {
      return (
         <div id="profile">
            <Message msg="Usuário não encontrado" type="error" />
            <Link to="/" className="btn">
               Voltar para Home
            </Link>
         </div>
      );
   }

   return (
      <div id="profile">
         <div className="profile-header">
            {userToShow.profileImage && (
               <img
                  src={`${uploads}/users/${userToShow.profileImage}`}
                  alt={userToShow.name}
                  className="profile-avatar"
                  onError={e => {
                     e.target.src = '/default-avatar.png';
                  }}
               />
            )}
            <div className="profile-description">
               <h2>{userToShow.name}</h2>
               {userToShow.bio && <p className="bio">{userToShow.bio}</p>}

               {isMyProfile && userToShow.email && (
                  <p className="email">{userToShow.email}</p>
               )}

               {isMyProfile && (
                  <Link to="/profile/edit" className="btn-edit">
                     <BsPencilFill /> Editar Perfil
                  </Link>
               )}
            </div>
         </div>

         {isMyProfile && (
            <>
               <div className="new-photo" ref={newPhotoForm}>
                  <h3>Compartilhe algum momento seu:</h3>
                  
                  {/* Preview da imagem */}
                  {preview && (
                     <div className="image-preview">
                        <div className="preview-image-container">
                           <img src={preview} alt="Preview" className="preview-image" />
                        </div>
                        <p className="preview-label">Pré-visualização</p>
                     </div>
                  )}
                  
                  <form onSubmit={submitHandle}>
                     <label>
                        <span>Título para a foto:</span>
                        <input
                           type="text"
                           placeholder="Insira um título"
                           onChange={e => setTitle(e.target.value)}
                           value={title || ''}
                           required
                        />
                     </label>
                     
                     <label>
                        <span>Imagem:</span>
                        <input 
                           type="file" 
                           onChange={handleFile}
                           accept="image/*"
                           required 
                        />
                     </label>

                     {loadingPhoto ? (
                        <button type="button" disabled className="btn">
                           <span className="spinner"></span> Enviando...
                        </button>
                     ) : (
                        <button type="submit" className="btn">
                           Postar Foto
                        </button>
                     )}
                  </form>
                  
                  {/* Mostrar mensagens - AGORA COM MENSAGEM LOCAL TAMBÉM */}
                  <div className="messages-container">
                     {localSuccess && (
                        <Message 
                           msg={localSuccess} 
                           type="success" 
                           onClose={handleCloseMessage}
                        />
                     )}
                     
                     {messagePhoto && !localSuccess && (
                        <Message 
                           msg={messagePhoto} 
                           type="success" 
                           onClose={handleCloseMessage}
                        />
                     )}
                     
                     {errorPhoto && (
                        <Message 
                           msg={errorPhoto} 
                           type="error" 
                           onClose={handleCloseMessage}
                        />
                     )}
                  </div>
               </div>

               {/* Mostrar fotos do usuário */}
               <div className="user-photos">
                  <h3>Minhas Fotos ({photos.length})</h3>
                  {loadingPhoto ? (
                     <p>Carregando fotos...</p>
                  ) : photos.length === 0 ? (
                     <p>Você ainda não postou fotos.</p>
                  ) : (
                     <div className="photos-container">
                        {photos.map(photo => (
                           <div key={photo._id} className="photo-item">
                              <img 
                                 src={`${uploads}/photos/${photo.image}`} 
                                 alt={photo.title}
                                 onError={(e) => {
                                    e.target.src = '/default-image.png';
                                 }}
                              />
                              <p className="photo-title">{photo.title}</p>
                              <small>
                                 {new Date(photo.createdAt).toLocaleDateString()}
                              </small>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </>
         )}
      </div>
   );
};

export default Profile;