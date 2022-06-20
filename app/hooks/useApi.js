import { useState } from "react";

/*
*   Purpose: Reusable useApi custom hook to prevent code repetition. 
*   Note: Convention is to run `useApi(<API TO CALL>)` 
*   @Returns
    -- data: the response data
    -- error: any error messages
    -- loading: if it's still loading
    -- request: function that can be used to call the specified api
*/
export default useApi = (apiFunc) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const request = async (...args) => {
    setLoading(true);
    const response = await apiFunc(...args);
    setLoading(false);

    if (!response.ok) return setError(true);

    setError(false);
    setData(response.data);
  };

  return { data, error, loading, request };
};
