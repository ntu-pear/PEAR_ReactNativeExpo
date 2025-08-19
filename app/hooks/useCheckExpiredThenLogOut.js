/* eslint-disable */
import { useContext, useState } from 'react';
import AuthContext from '../auth/context';
import authStorage from '../auth/authStorage';
/*
 * If token is expired, proceed to log out.
 */
export default function useCheckExpiredThenLogOut() {
  const { setUser } = useContext(AuthContext);
  const [bearerError, setBearerError] = useState('');
  const [errorDescription, setErrorDescription] = useState('');

  const handleLogOut = async (errorMessage) => {
    if (
      errorMessage &&
      errorMessage.headers &&
      errorMessage.headers['www-authenticate']
    ) {
      console.log('Expired logout error message: ');
      console.log(JSON.stringify(errorMessage), '\n');
      const responseHeader = errorMessage.headers;
      const errors = responseHeader['www-authenticate'].split(',');
      if (errors[0] === 'Bearer error="invalid_token"') {
        setBearerError(errors[0]);
        setErrorDescription(errors[1]);
        setUser(null);
        await authStorage.removeToken();
      }
    }
  };
  return { bearerError, errorDescription, handleLogOut };
}
