import { useEffect, useRef, useState } from 'react';
import requestDeadline from 'app/utility/requestDeadline';

/*
*   Purpose: Reusable useApi custom hook to prevent code repetition.
*   Note: Convention is to run `useApi(<API TO CALL>)`
*   @Returns
    -- data: the response data
    -- error: any error messages
    -- loading: if it's still loading
    -- request: function that can be used to call the specified api
*/

export default function useApi(apiFunc) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const latestRequest = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const request = async (...args) => {
    setLoading(true);
    const requestId = ++latestRequest.current;
    const isCurrent = () =>
      mounted.current && requestId === latestRequest.current;
    try {
      const response = await requestDeadline(apiFunc(...args));
      if (isCurrent()) {
        setError(!response.ok);
        setData(response.data);
      }
      return response;
    } catch (requestError) {
      if (isCurrent()) {
        setError(true);
        setData(null);
      }
      return {
        ok: false,
        status: 0,
        problem: requestError?.problem || 'CLIENT_ERROR',
        data: null,
      };
    } finally {
      if (isCurrent()) {
        setLoading(false);
      }
    }
  };

  return {
    data,
    error,
    loading,
    request,
  };
}
