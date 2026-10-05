import { useEffect, useState } from 'react';
import {
  getSelectionOptionCache,
  setSelectionOptionsCache,
} from 'app/datastore/selectionDataCache';
import listApi from 'app/api/list';
import requestDeadline from 'app/utility/requestDeadline';
import { beginQaTiming, markQaTiming } from 'app/utility/qaProfileTiming';

// The cache contains selection vocabulary, never patient records.
export default function useGetSelectionOptions(option, enabled = true) {
  const [state, setState] = useState({
    option,
    data: [],
    isError: false,
    isLoading: false,
  });

  useEffect(() => {
    let active = true;
    if (!enabled) {
      setState((previous) => {
        if (
          previous.option === option &&
          !previous.isError &&
          !previous.isLoading
        )
          return previous;
        return {
          option,
          data: previous.option === option ? previous.data : [],
          isError: false,
          isLoading: false,
        };
      });
      return () => {
        active = false;
      };
    }

    const load = async () => {
      let timing;
      try {
        const cached = getSelectionOptionCache(option);
        if (cached !== null && cached !== undefined) {
          if (active)
            setState({
              option,
              data: cached,
              isError: false,
              isLoading: false,
            });
          return;
        }
        setState({ option, data: [], isError: false, isLoading: true });
        timing = beginQaTiming('selection-read');
        const response = await requestDeadline(
          listApi.getSelectionOptionList(option),
        );
        markQaTiming(timing, 'response', {
          status: response?.status,
          requestDurationMs: response?.duration,
        });
        if (!active) return;
        if (!response?.ok || !Array.isArray(response.data?.data)) {
          setState({ option, data: [], isError: true, isLoading: false });
          return;
        }
        const data = response.data.data.map((entry) => ({
          label: entry.value,
          value: Object.values(entry)[0],
        }));
        setSelectionOptionsCache(option, data);
        setState({ option, data, isError: false, isLoading: false });
      } catch (error) {
        if (timing) markQaTiming(timing, 'error');
        if (active)
          setState({ option, data: [], isError: error, isLoading: false });
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [option, enabled]);

  return state.option === option
    ? {
        data: state.data,
        isError: state.isError,
        isLoading: enabled && state.isLoading,
      }
    : { data: [], isError: false, isLoading: enabled };
}
