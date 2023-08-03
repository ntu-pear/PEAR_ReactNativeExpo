// Base
import React, { useState, useEffect, useCallback } from 'react';

// Local Cache
import {
  getSelectionOptionCache,
  setSelectionOptionsCache,
} from 'app/datastore/selectionDataCache';

// API
import listApi from 'app/api/list';
import useApi from 'app/hooks/useApi';
/*
    This hook is used to get the list options for the input selection field component
    it formats and returns [{label: xxx, value: yyy}, ...] suitable for use in SelectionInputField component
*/
export default function useGetSelectionOptions(option) {
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const apiFunction = useApi(listApi.getSelectionOptionList);
  let extractedObjects = [];

  // function to get data from API -> used only when no previous instance is cached.
  const getSelectionOptions = useCallback(async () => {
    setIsError(false);
    setIsLoading(true);
    // Check if there is exist a cached value in selectionDataCache.
    // const storedData = await AsyncStorage.getItem(option);
    const storedData = getSelectionOptionCache(option);
    // Call API if there is no cached value.
    if (storedData === null || storedData === undefined) {
      try {
        console.log('Retrieving from API!');
        const response = await apiFunction.request(option);
        const responseData = response.data.data;
        // console.log('response data = ');
        // console.log(responseData);
        responseData.map((object) => {
          /* response have inconsistent key name for ID (e.g: list_RelationshipID, list_EducationID)
             but have consistent position i.e: required value is always in position 0
             after extracting the values(only!) from each object in responseData.
          */
          const valuesArray = Object.values(object);
          const id = valuesArray[0];
          const value = object.value;
          const extractedObject = { label: value, value: id };
          extractedObjects.push(extractedObject);
        });
        setData(extractedObjects);
        // cache the data in Async Storage for later retrieval
        try {
          // await AsyncStorage.setItem(option, JSON.stringify(extractedObjects));
          setSelectionOptionsCache(option, extractedObjects);
        } catch (error) {
          setIsError(error);
          setIsLoading(false);
        }
        // store the data locally after retrieval
      } catch (error) {
        setIsError(error);
      }
    } else {
      console.log('Data in Cache!');
      setData(storedData);
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [option]);

  useEffect(() => {
    getSelectionOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [option]);
  // console.log(data);
  return { data, isLoading, isError };
}
