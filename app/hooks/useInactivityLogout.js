import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useContext,
} from 'react';
import { PanResponder } from 'react-native';
import AuthContext from 'app/auth/context';
import authStorage from 'app/auth/authStorage';

// ref: https://facto.hashnode.dev/auto-logout-user-after-inactivity-react-native

export default function useInactivityLogout() {
  const { user, setUser } = useContext(AuthContext);
  const lastInteraction = useRef(new Date());
  const [timeWentInactive, setTimeWentInactive] = useState(null);
  const inactivityTimer = useRef(false);
  const waitForInactivity = useRef(0);

  const INACTIVITY_CHECK_INTERVAL_MS = 1000;

  useEffect(() => {
    // set time only if user != null -> user is logged in
    if (user) {
      // 4 hrs = 14400 = 4 * 60 * 60
      const autologoutTime = 14400;
      // 10 secs
      // const autologoutTime = 10;
      waitForInactivity.current = autologoutTime * 1000;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, waitForInactivity.current]);

  const performAutoLogout = useCallback(async () => {
    console.log('useInactivitylogout: Performing auto logout!');
    setUser(null);
    await authStorage.removeToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkInactive = useCallback(() => {
    if (inactivityTimer.current) {
      return;
    }
    inactivityTimer.current = setInterval(() => {
      if (
        Math.abs(new Date().valueOf() - lastInteraction.current.valueOf()) >=
        waitForInactivity.current
      ) {
        setIsInactive();
      }
    }, INACTIVITY_CHECK_INTERVAL_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      checkInactive();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkInactive]);

  // update last interaction timestamp
  const setIsActive = useCallback(() => {
    // console.log('useInactivitylogout: setIsActive');
    lastInteraction.current = new Date();
    // reset timeWentInactive state
    if (timeWentInactive) {
      setTimeWentInactive(null);
    }
    if (user) {
      checkInactive();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setIsInactive = () => {
    setTimeWentInactive(new Date());
    clearInterval(inactivityTimer.current);
    inactivityTimer.current = false;
    // Logout
    performAutoLogout();
  };

  const handleMoveShouldSetPanResponder = useCallback(() => {
    setIsActive();
    return false;
  }, [setIsActive]);

  const handleStartShouldSetPanResponder = useCallback(() => {
    setIsActive();
    return false;
  }, [setIsActive]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: handleStartShouldSetPanResponder,
        onMoveShouldSetPanResponder: handleMoveShouldSetPanResponder,
        onStartShouldSetPanResponderCapture: handleStartShouldSetPanResponder,
        onMoveShouldSetPanResponderCapture: () => false,
        onPanResponderTerminationRequest: () => true,
        onShouldBlockNativeResponder: () => false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return {
    panResponder,
  };
}
