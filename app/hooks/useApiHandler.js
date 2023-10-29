/* eslint-disable */
import { useContext } from 'react';
import client from '../api/client';
import AuthContext from '../auth/context';
import authStorage from '../auth/authStorage';

export default function useApiHandler() {
  const { setUser } = useContext(AuthContext);
  const setHeaderIfEmpty = async () => {
    // Checks if headers['Authorization'] is present
    if (!client.headers.Authorization) {
      const bearerToken = await authStorage.getToken('userAuthToken');
      bearerToken
        ? client.setHeaders({
            Authorization: `Bearer ${bearerToken}`,
          })
        : setUser(null);
    }
  };

  const setHeader = async () => {
    const bearerToken = await authStorage.getToken('userAuthToken');
    // Set the header if there are none configured.
    if (!client.headers.Authorization || client.headers.Authorization !== `Bearer ${bearerToken}`) {
      console.log('!client.headers.Authorization');
      bearerToken
        ? client.setHeaders({
            Authorization: `Bearer ${bearerToken}`,
          })
        : setUser(null);
    }
    // else if (client.headers.Authorization !== `Bearer ${bearerToken}`) {
    //   // Update the header newer auth token.
    //   console.log('client.headers.Authorization !==');
    //   // const bearerToken = await authStorage.getToken('userAuthToken');
    //   bearerToken
    //     ? client.setHeaders({
    //         Authorization: `Bearer ${bearerToken}`,
    //       })
    //     : setUser(null);
    // }
  }

  return { setHeaderIfEmpty, setHeader };
}
