// Libs
import React, { useState, useEffect } from 'react';
// API
import guardianApi from 'app/api/guardian';
import patientApi from 'app/api/patient';
import userApi from 'app/api/user';
// Hooks
import useApi from 'app/hooks/useApi';

export const useGetPersonalDetails = (subjectID, isGuardian) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState({});

  const getPatient = useApi(patientApi.getPatient);
  const getPatientGuardian = useApi(guardianApi.getPatientGuardian);
  const getUser = useApi(userApi.getUser);

  const getPersonalDetails = async () => {
    // check data type of subjectID => number = patient, string = user
    setIsLoading(true);
    const dataType = typeof subjectID;
    let apiFunction = null;
    // set the correct API to use based on the data type.
    switch (dataType) {
      case 'number':
        if (isGuardian) {
          apiFunction = getPatientGuardian;
        } else {
          apiFunction = getPatient;
        }
        break;
      case 'string':
        apiFunction = getUser;
        break;
    }
    try {
      const response = await apiFunction.request(subjectID);
      console.log(response);
      if (!isGuardian) {
        setData(response.data.data);
      } else {
        setData(response.data);
      }
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getPersonalDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectID]);

  return { data, isError, isLoading };
};
