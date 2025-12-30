import './EditProfile.css';

const EditProfile = () => {
   const handleSubmit = e => {
      e.preventDefault();
   };

   return (
      <div id="edit-profile">
         <h2>Edite seus dados</h2>
         <p className="subtitle">
            Adicione uma imagem de perfil e conte mais sobre você...
         </p>
         <form action="" onSubmit={handleSubmit}>
            <input type="text" placeholder="Home" />
            <input type="email" placeholder="E-mail" />
            <label htmlFor="">
               <span>Imagem do Perfil</span>
               <input type="file" />
            </label>
            <label>
               <span>Bio:</span>
               <input type="text" placeholder="Descrição do perfil" />
            </label>
            <label htmlFor="">
               <span>Quer alterar sua senha?</span>
               <input type="text" placeholder="Digite sua nova senha" />
            </label>
            <input type="submit" value="Atualizar" />
         </form>
      </div>
   );
};

export default EditProfile;
