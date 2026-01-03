// Profile.js - CORREÇÃO APLICADA
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

   // CORREÇÃO: Adicionado valor padrão para evitar undefined
   const { visitedUser, loading, error } = useSelector(state => state.user || {});
   
   const { user: userAuth } = useSelector(state => state.auth || {});
   
   // CORREÇÃO PRINCIPAL: Adicionado valor padrão completo para state.photo
   const {
      photos = [],
      loading: loadingPhoto = false,
      message: messagePhoto = '',
      error: errorPhoto = ''
   } = useSelector(state => state.photo || {});

   const [title, setTitle] = useState('');
   const [image, setImage] = useState('');

   // Determina qual usuário mostrar - com verificação segura
   const isMyProfile = userAuth && id && userAuth._id && id === userAuth._id;
   const userToShow = isMyProfile ? userAuth : visitedUser;

   // New form and edit form refs
   const newPhotoForm = useRef();
   const editPhotoForm = useRef();

   useEffect(() => {
      // Verificação mais segura
      if (!id || id === 'undefined') {
         if (userAuth && userAuth._id) {
            navigate(`/users/${userAuth._id}`);
         } else {
            navigate('/');
         }
         return;
      }

      // Se for o perfil de outro usuário, busca os dados
      if (id && id !== 'undefined') {
         // Verifica se é o perfil de outro usuário
         if (!userAuth || !userAuth._id || id !== userAuth._id) {
            dispatch(getUserDetails(id));
         }
      }
   }, [id, navigate, dispatch, userAuth]);

   const handleFile = e => {
      const file = e.target.files[0];
      if (file) {
         setImage(file);
      }
   };

   const submitHandle = e => {
      e.preventDefault();

      if (!image) {
         alert('Selecione uma imagem!');
         return;
      }

      const formData = new FormData(); // CORREÇÃO: "FormData" com F maiúsculo
      formData.append('title', title);
      formData.append('image', image);

      dispatch(publishPhoto(formData));

      setTitle('');
      setImage('');

      setTimeout(() => {
         dispatch(resetMessage());
      }, 2000);
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
                     e.target.src = '/default-avatar.png'; // Adicione uma imagem padrão
                  }}
               />
            )}
            <div className="profile-description">
               <h2>{userToShow.name}</h2>
               {userToShow.bio && <p className="bio">{userToShow.bio}</p>}

               {/* Mostra email apenas no próprio perfil */}
               {isMyProfile && userToShow.email && (
                  <p className="email">{userToShow.email}</p>
               )}

               {/* Botão de editar apenas no próprio perfil */}
               {isMyProfile && (
                  <Link to="/profile/edit" className="btn-edit"> {/* Supondo que tenha uma rota de edição */}
                     <BsPencilFill /> Editar Perfil
                  </Link>
               )}
            </div>
         </div>

         {/* Mostra formulário de foto apenas no próprio perfil */}
         {isMyProfile && (
            <>
               <div className="new-photo" ref={newPhotoForm}>
                  <h3>Compartilhe algum momento seu:</h3>
                  <form onSubmit={submitHandle}>
                     <label>
                        <span>Título para a foto</span>
                        <input
                           type="text"
                           placeholder="Insira um título"
                           onChange={e => setTitle(e.target.value)}
                           value={title || ''}
                        />
                     </label>
                     <label>
                        <span>Imagem:</span>
                        <input 
                           type="file" 
                           onChange={handleFile}
                           accept="image/*" 
                        />
                     </label>

                     {loadingPhoto ? (
                        <input type="submit" disabled value="Aguarde..." />
                     ) : (
                        <input type="submit" value="Postar" />
                     )}
                     
                     {/* Mostrar mensagens de sucesso/erro */}
                     {messagePhoto && (
                        <Message msg={messagePhoto} type="success" />
                     )}
                     {errorPhoto && (
                        <Message msg={errorPhoto} type="error" />
                     )}
                  </form>
               </div>

               {/* Mostrar fotos do usuário */}
               <div className="user-photos">
                  <h3>Minhas Fotos ({photos.length})</h3>
                  {photos.length === 0 ? (
                     <p>Você ainda não postou fotos.</p>
                  ) : (
                     <div className="photos-container">
                        {/* Aqui você pode mapear as fotos */}
                        {photos.map(photo => (
                           <div key={photo._id} className="photo-item">
                              <img 
                                 src={`${uploads}/photos/${photo.image}`} 
                                 alt={photo.title} 
                              />
                              <p>{photo.title}</p>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </>
         )}

         {/* Remova o debug-info em produção */}
         {/* <div className="debug-info">
            <p>É meu perfil? {isMyProfile ? 'Sim' : 'Não'}</p>
            <p>ID: {userToShow._id}</p>
            {!isMyProfile && <p>Visitando perfil de: {userToShow.name}</p>}
         </div> */}
      </div>
   );
};

export default Profile;