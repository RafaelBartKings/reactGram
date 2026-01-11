import './Photo.css';
import { uploads } from '../../utils/config';

// components
import Message from '../../components/Message';
import { Link } from 'react-router-dom';
import PhotoItem from '../../components/PhotoItem';
import LikeContainer from '../../components/LikeContainer';

// hooks
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useResetComponentMessage } from '../../hooks/useResetComponentMessage';

// Redux
import { getPhoto, likePhoto, comment } from '../../slices/photoSlice';

const Photo = () => {
   const { id } = useParams();
   const dispatch = useDispatch();
   const resetMessage = useResetComponentMessage(dispatch);

   const { user } = useSelector(state => state.auth);
   const { photo, loading, error, message } = useSelector(state => state.photo);

   const [commentText, setCommentText] = useState('');

   // Load photo data
   useEffect(() => {
      dispatch(getPhoto(id));
   }, [dispatch, id]);

   const handleLike = () => {
      dispatch(likePhoto(photo._id));
      resetMessage();
   };

   // Insert comment
   const handleComment = e => {
      e.preventDefault();

      // ✅ CORREÇÃO: Verifica se TEM photo._id e texto
      if (!photo?._id || !commentText.trim()) {
         console.log('Faltando dados:', {
            hasPhotoId: !!photo?._id,
            hasText: !!commentText.trim()
         });
         return;
      }

      dispatch(
         comment({
            commentData: commentText,
            photoId: photo._id
         })
      );

      setCommentText('');
      resetMessage();
   };

   if (loading) {
      return <p>Carregando...</p>;
   }

   if (!photo) {
      return <p>Foto não encontrada!</p>;
   }

   return (
      <div id="photo">
         <PhotoItem photo={photo} />
         <LikeContainer photo={photo} user={user} handleLike={handleLike} />

         <div className="message-container">
            {error && <Message msg={error} type="error" />}
            {message && <Message msg={message} type="success" />}
         </div>

         <div className="comments">
            <h3>Comentários: ({photo.comments?.length || 0})</h3>

            <form onSubmit={handleComment}>
               <input
                  type="text"
                  placeholder="Insira o seu comentário..."
                  onChange={e => setCommentText(e.target.value)}
                  value={commentText}
               />
               <input type="submit" value="Enviar" />
            </form>

            {/* ✅ CORREÇÃO: Verificação segura */}
            {(photo.comments?.length === 0 || !photo.comments) && (
               <p>Não há comentários ainda...</p>
            )}

            {/* ✅ CORREÇÃO: Map com parênteses e key única */}
            {photo.comments?.map((comment, index) => (
               <div className="comment" key={comment._id || `comment-${index}`}>
                  <div className="author">
                     {comment.userImage && (
                        <img
                           src={`${uploads}/users/${comment.userImage}`}
                           alt={comment.userName}
                        />
                     )}
                     <Link to={`/users/${comment.userId}`}>
                        <p>{comment.userName}</p>
                     </Link>
                  </div>
                  <p>{comment.comment}</p>
               </div>
            ))}
         </div>
      </div>
   );
};

export default Photo;
