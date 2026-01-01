import './EditProfile.css';

import { uploads } from '../../utils/config';

// Hooks
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// Redux
import { profile, resetMessage, updateProfile } from '../../slices/userSlice';

// Componente
import Message from '../../components/Message';

const EditProfile = () => {
   const dispatch = useDispatch();

   const { user, message, error, loading } = useSelector(state => state.user);

   // states
   const [name, setName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [profileImage, setProfileImage] = useState(null);
   const [bio, setBio] = useState('');
   const [previewImage, setPreviewImage] = useState('');

   // load user data
   useEffect(() => {
      dispatch(profile());
   }, [dispatch]);

   // Fill form with user data
   useEffect(() => {
      if (user) {
         setName(user.name);
         setEmail(user.email);
         setBio(user.bio || '');
      }
   }, [user]);

   const handleSubmit = async e => {
      e.preventDefault();

      // Gather user data from states
      const userData = {
         name
      };

      if (bio) {
         userData.bio = bio;
      }

      if (password) {
         userData.password = password;
      }

      console.log('Dados coletados:', userData);

      // Se tiver imagem, usa FormData
      if (profileImage) {
         const formData = new FormData();

         // Adiciona campos de texto
         formData.append('name', name);
         if (bio) formData.append('bio', bio);
         if (password) formData.append('password', password);

         // Adiciona a imagem
         formData.append('profileImage', profileImage);

         console.log('Enviando como FormData');
         await dispatch(updateProfile(formData));
      } else {
         // Se não tiver imagem, envia como JSON normal
         console.log('Enviando como JSON:', userData);
         await dispatch(updateProfile(userData));
      }

      setTimeout(() => {
         dispatch(resetMessage());
      }, 2000);
   };

   const handleFile = e => {
      // image preview
      const image = e.target.files[0];

      setPreviewImage(image);
      // update image state
      setProfileImage(image);
   };

   return (
      <div id="edit-profile">
         <h2>Edite seus dados</h2>
         <p className="subtitle">
            Adicione uma imagem de perfil e conte mais sobre você...
         </p>
         {(user.profileImage || previewImage) && (
            <img
               className="profile-image"
               src={
                  previewImage
                     ? URL.createObjectURL(previewImage)
                     : `${uploads}/users/${user.profileImage}`
               }
               alt={user.name}
            />
         )}
         <form onSubmit={handleSubmit}>
            <input
               type="text"
               placeholder="Nome"
               onChange={e => setName(e.target.value)}
               value={name || ''}
               required
            />
            <input
               type="email"
               placeholder="E-mail"
               value={email || ''}
               disabled
               title="E-mail não pode ser alterado"
            />
            <label>
               <span>Imagem do Perfil</span>
               <input type="file" onChange={handleFile} accept="image/*" />
            </label>
            <label>
               <span>Bio:</span>
               <input
                  type="text"
                  placeholder="Descrição do perfil"
                  onChange={e => setBio(e.target.value)}
                  value={bio || ''}
               />
            </label>
            <label>
               <span>Quer alterar sua senha?</span>
               <input
                  type="password"
                  placeholder="Digite sua nova senha"
                  onChange={e => setPassword(e.target.value)}
                  value={password || ''}
               />
            </label>
            {!loading && <input type="submit" value="Atualizar" />}
            {loading && <input type="submit" value="Aguarde..." disabled />}
            {error && <Message msg={error} type="error" />}
            {message && <Message msg={message} type="success" />}
         </form>
      </div>
   );
};

export default EditProfile;
