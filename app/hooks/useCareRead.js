import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import requestDeadline from 'app/utility/requestDeadline';

export default function useCareRead(identity, load, enabled = true) {
  const current = useRef(identity);
  current.current = identity;
  const generation = useRef(0);
  const [retry, setRetry] = useState(0);
  const [snapshot, setSnapshot] = useState({ identity: null, loading: true });
  useFocusEffect(
    useCallback(() => {
      const run = ++generation.current;
      let active = true;
      if (!enabled) {
        return () => {
          active = false;
          generation.current += 1;
        };
      }
      setSnapshot({ identity, loading: true, attempt: retry });
      const read = async () => {
        let result;
        try {
          result = { data: await requestDeadline(load()) };
        } catch (error) {
          result = {
            error: error.message || 'This information could not be loaded.',
            retry: error.retry !== false,
          };
        }
        if (
          active &&
          current.current === identity &&
          generation.current === run
        ) {
          setSnapshot({ identity, loading: false, ...result });
        }
      };
      read();
      return () => {
        active = false;
        generation.current += 1;
      };
    }, [identity, load, enabled, retry]),
  );
  return {
    ...(snapshot.identity === identity ? snapshot : { loading: true }),
    reload: () => setRetry((n) => n + 1),
  };
}
