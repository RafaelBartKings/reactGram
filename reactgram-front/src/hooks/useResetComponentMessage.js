import React from 'react';
import { resetMessage } from '../slices/photoSlice';

export const useResetComponentMessage = dispatch => {
   return () => {
      setTimeout(() => {
         dispatch(resetMessage());
      }, 3000);
   };
};
