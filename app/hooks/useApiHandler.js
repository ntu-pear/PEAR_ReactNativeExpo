/* eslint-disable */
import { useContext } from 'react';
import client from '../api/client';
import AuthContext from '../auth/context';
import authStorage from '../auth/authStorage';

export default function useApiHandler() {
  const { setUser } = useContext(AuthContext);
    // === NEW: real axios header helpers ===
    const getAuthHeader = () =>
      client?.axiosInstance?.defaults?.headers?.common?.Authorization;
  
    const setAuthHeader = (token) => {
      if (token) {
        client.setHeaders({ Authorization: `Bearer ${token}` });
        // (debug) see actual header path:
        console.log('AUTH HEADER NOW:', getAuthHeader());
      }
    };
    // === END NEW
  const setHeaderIfEmpty = async () => {
    // === CHANGED: check axios defaults instead of client.headers ===
    const current = getAuthHeader();
    if (!current) {
      const bearerToken = await authStorage.getToken('userAuthToken');
      if (bearerToken) {
        setAuthHeader(bearerToken);
      } else {
        setUser(null);
      }
    }
  };

  const setHeader = async () => {
    // === CHANGED: compare against real axios header ===
    const bearerToken = await authStorage.getToken('userAuthToken');
    const expected = bearerToken ? `Bearer ${bearerToken}` : null;
    const current = getAuthHeader();

    if (!expected) {
      setUser(null);
      return;
    }

    if (current !== expected) {
      console.log('Updating Authorization header...');
      setAuthHeader(bearerToken);
    }
    // else: header already correct; no-op
  };

  // NEW: one-call bootstrap after login
  const bootstrapAfterLogin = async () => {
    await setHeader();                              // ensure Authorization is set
    const me = await userApi.getUser();             // GET /api/v1/user/get_user/
    if (me?.ok) {
      setUser(me.data);                             // put user into context → navigator can switch
    } else {
      console.log('Failed to load profile after login:', me?.status, me?.data);
    }
    return me;
  };

  return { setHeaderIfEmpty, setHeader };
}
