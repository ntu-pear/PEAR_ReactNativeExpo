import client from "../api/client";
import AuthContext from "../auth/context";
import { useContext } from "react";
import authStorage from "../auth/authStorage";

export default useApiHandler = () => {
  const { user, setUser } = useContext(AuthContext);
  const setHeaderIfEmpty = async () => {
    // Checks if headers['Authorization'] is present
    if (!client.headers.Authorization) {
        console.log("RUNNING IN HEADERS AUTHORIZATION")
      const bearerToken = await authStorage.getToken("userAuthToken");
      bearerToken
        ? client.setHeaders({
            Authorization: `Bearer ${bearerToken}`,
          })
        : setUser(null);
    }
  };

  return { setHeaderIfEmpty };
};
