// Profile.js - VERSÃO COM AÇÕES NAS FOTOS
import './Profile.css';

import { uploads } from '../../utils/config';
import Message from '../../components/Message';
import { Link, useParams, useNavigate } from 'react-router-dom';

import { 
  BsPencilFill, 
  BsFillEyeFill, 
  BsXLg 
} from 'react-icons/bs';
import { useSelector, useDispatch } from 'react-redux';
import { getUserDetails } from '../../slices/userSlice';
import { useEffect, useRef, useState, useMemo } from 'react';
import {
   publishPhoto,
   resetMessage,
   getUserPhotos,
   resetPhotos,
   deletePhoto,
   updatePhoto
} from '../../slices/photoSlice';

const Profile = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const dispatch = useDispatch();

   const photos = useSelector(state => state.photo?.photos || []);
   const loadingPhoto = useSelector(state => state.photo?.loading || false);
   const messagePhoto = useSelector(state => state.photo?.message || '');
   const errorPhoto = useSelector(state => state.photo?.error || '');
   
   const userState = useSelector(state => state.user);
   const authState = useSelector(state => state.auth);

   // Extrair valores
   const visitedUser = userState?.visitedUser || null;
   const loading = userState?.loading || false;
   const error = userState?.error || null;

   const userAuth = authState?.user || null;

   const [title, setTitle] = useState('');
   const [image, setImage] = useState('');
   const [preview, setPreview] = useState('');
   const [localSuccess, setLocalSuccess] = useState('');
   const [editingPhoto, setEditingPhoto] = useState(null);
   const [editTitle, setEditTitle] = useState('');

   // Cálculos memoizados
   const isMyProfile = useMemo(() => {
      return userAuth && id && userAuth._id && id === userAuth._id;
   }, [userAuth, id]);

   const userToShow = useMemo(() => {
      return isMyProfile ? userAuth : visitedUser;
   }, [isMyProfile, userAuth, visitedUser]);

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

      // Limpar estado anterior
      dispatch(resetPhotos());
      
      // Se não for o próprio perfil, carregar detalhes
      if (!userAuth || !userAuth._id || id !== userAuth._id) {
         dispatch(getUserDetails(id));
      }
      
      // Carregar fotos
      dispatch(getUserPhotos(id));
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

      if (!image || !title.trim()) {
         alert('Preencha todos os campos!');
         return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('image', image);

      try {
         const result = await dispatch(publishPhoto(formData));

         if (publishPhoto.fulfilled.match(result)) {
            // Recarregar fotos após um delay
            setTimeout(() => {
               if (userAuth?._id) {
                  dispatch(getUserPhotos(userAuth._id));
               }
            }, 1000);

            // Limpar formulário
            setTitle('');
            setImage('');
            setPreview('');
            
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';
            
            // Mensagem de sucesso
            setLocalSuccess('Foto publicada com sucesso!');
            
            setTimeout(() => {
               setLocalSuccess('');
               dispatch(resetMessage());
            }, 3000);
         }
      } catch (error) {
         console.error('Erro ao publicar foto:', error);
      }
   };

   // ✅ Função para visualizar foto
   const handleViewPhoto = (photoId) => {
      navigate(`/photos/${photoId}`);
   };

   // ✅ Função para iniciar edição
   const handleStartEdit = (photo) => {
      setEditingPhoto(photo._id);
      setEditTitle(photo.title);
   };

   // ✅ Função para salvar edição
   const handleSaveEdit = async (photoId) => {
      if (!editTitle.trim()) {
         alert('Digite um título para a foto!');
         return;
      }

      try {
         const result = await dispatch(updatePhoto({
            id: photoId,
            title: editTitle
         }));

         if (updatePhoto.fulfilled.match(result)) {
            setEditingPhoto(null);
            setEditTitle('');
            
            // Recarregar fotos
            setTimeout(() => {
               if (userAuth?._id) {
                  dispatch(getUserPhotos(userAuth._id));
               }
            }, 500);
         }
      } catch (error) {
         console.error('Erro ao editar foto:', error);
      }
   };

   // ✅ Função para cancelar edição
   const handleCancelEdit = () => {
      setEditingPhoto(null);
      setEditTitle('');
   };

   // ✅ Função para deletar foto
   const handleDeletePhoto = async (photoId) => {
      if (!window.confirm('Tem certeza que deseja excluir esta foto?')) {
         return;
      }

      try {
         const result = await dispatch(deletePhoto(photoId));

         if (deletePhoto.fulfilled.match(result)) {
            // Recarregar fotos
            setTimeout(() => {
               if (userAuth?._id) {
                  dispatch(getUserPhotos(userAuth._id));
               }
            }, 500);
         }
      } catch (error) {
         console.error('Erro ao excluir foto:', error);
      }
   };

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

   // Usuário não encontrado
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
            <div className="new-photo" ref={newPhotoForm}>
               <h3>Compartilhe algum momento seu:</h3>

               {preview && (
                  <div className="image-preview">
                     <div className="preview-image-container">
                        <img
                           src={preview}
                           alt="Preview"
                           className="preview-image"
                        />
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
         )}

         {/* Seção de fotos - COM AÇÕES */}
         <div className="user-photos">
            <h3>
               {isMyProfile 
                  ? `Minhas Fotos (${photos.length})` 
                  : `Fotos de ${userToShow.name} (${photos.length})`
               }
            </h3>
            
            {loadingPhoto ? (
               <p>Carregando fotos...</p>
            ) : photos.length === 0 ? (
               <p>
                  {isMyProfile 
                     ? 'Você ainda não postou fotos.' 
                     : 'Este usuário ainda não postou fotos.'
                  }
               </p>
            ) : (
               <div className="photos-container">
                  {photos.map(photo => (
                     <div key={photo._id} className="photo-item">
                        {/* Container da imagem */}
                        <div className="photo-image-container">
                           <img
                              src={`${uploads}/photos/${photo.image}`}
                              alt={photo.title}
                              onError={e => {
                                 e.target.src = '/default-image.png';
                              }}
                           />
                        </div>
                        
                        {/* Conteúdo da foto */}
                        <div className="photo-content">
                           {/* Modo edição ou visualização normal */}
                           {editingPhoto === photo._id ? (
                              <div className="edit-form">
                                 <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="edit-input"
                                    placeholder="Novo título"
                                 />
                                 <div className="edit-actions">
                                    <button 
                                       onClick={() => handleSaveEdit(photo._id)}
                                       className="btn-small btn-save"
                                    >
                                       Salvar
                                    </button>
                                    <button 
                                       onClick={handleCancelEdit}
                                       className="btn-small btn-cancel"
                                    >
                                       Cancelar
                                    </button>
                                 </div>
                              </div>
                           ) : (
                              <>
                                 <p className="photo-title">{photo.title}</p>
                                 
                                 {/* ✅ Ações da foto */}
                                 <div className="photo-actions">
                                    {/* Para o próprio perfil */}
                                    {isMyProfile ? (
                                       <>
                                          <button 
                                             onClick={() => handleViewPhoto(photo._id)}
                                             className="btn-action"
                                             title="Visualizar"
                                          >
                                             <BsFillEyeFill />
                                          </button>
                                          <button 
                                             onClick={() => handleStartEdit(photo)}
                                             className="btn-action"
                                             title="Editar"
                                          >
                                             <BsPencilFill />
                                          </button>
                                          <button 
                                             onClick={() => handleDeletePhoto(photo._id)}
                                             className="btn-action"
                                             title="Excluir"
                                          >
                                             <BsXLg />
                                          </button>
                                       </>
                                    ) : (
                                       /* Para outros perfis */
                                       <Link 
                                          className="btn btn-view-full" 
                                          to={`/photos/${photo._id}`}
                                       >
                                          <BsFillEyeFill /> Ver detalhes
                                       </Link>
                                    )}
                                 </div>
                              </>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
};

export default Profile;