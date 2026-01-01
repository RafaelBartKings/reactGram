// Profile.js - VERSÃO CORRIGIDA
import './Profile.css';

import { uploads } from '../../utils/config';
import Message from '../../components/Message';
import { Link, useParams, useNavigate } from 'react-router-dom';

import { BsPencilFill } from 'react-icons/bs';
import { useSelector, useDispatch } from 'react-redux';
import { getUserDetails } from '../../slices/userSlice';
import { useEffect, useRef } from 'react';

const Profile = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const dispatch = useDispatch();

   // CORREÇÃO: Agora temos visitedUser para outros usuários
   const { visitedUser, loading, error } = useSelector(state => state.user);
   const { user: userAuth } = useSelector(state => state.auth);

   // Determina qual usuário mostrar
   const isMyProfile = userAuth && id === userAuth._id;
   const userToShow = isMyProfile ? userAuth : visitedUser;

   // New form and edit form refs
   const newPhotoForm = useRef();
   const editPhotoForm = useRef();

   useEffect(() => {
      if (!id || id === 'undefined') {
         // Se está autenticado, redireciona para o próprio perfil
         if (userAuth && userAuth._id) {
            navigate(`/users/${userAuth._id}`);
         } else {
            navigate('/');
         }
         return;
      }

      // Se for o perfil de outro usuário, busca os dados
      if (id && id !== 'undefined' && (!userAuth || id !== userAuth._id)) {
         dispatch(getUserDetails(id));
      }
      // Se for o próprio perfil, não precisa buscar (já está no userAuth)
   }, [id, navigate, dispatch, userAuth]);

   const submitHandle = e => {
      e.preventDefault();
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
                     e.target.style.display = 'none';
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
                  <Link to="/profile" className="btn-edit">
                     <BsPencilFill /> Editar Perfil
                  </Link>
               )}
            </div>
         </div>

         {id === userAuth._id && (
            <>
               <div className="new-photo" ref={newPhotoForm}>
                  <h3>Compartilhe algum momento seu: </h3>
                  <form action="" onSubmit={submitHandle}>
                     <label htmlFor="">
                        <span>Título para a foto</span>
                        <input type="text" placeholder="Insira um título" />
                     </label>
                     <label>
                        <span>Imagem:</span>
                        <input type="file" />
                     </label>
                     <input type="submit" value="Postar" />
                  </form>
               </div>
            </>
         )}

         {/* Info de debug */}
         <div className="debug-info">
            <p>É meu perfil? {isMyProfile ? 'Sim' : 'Não'}</p>
            <p>ID: {userToShow._id}</p>
            {!isMyProfile && <p>Visitando perfil de: {userToShow.name}</p>}
         </div>
      </div>
   );
};

export default Profile;
