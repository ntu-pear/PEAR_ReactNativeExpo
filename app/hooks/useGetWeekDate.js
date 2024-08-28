// //Libs
import { useState, useEffect } from 'react';
import formatDateTime from 'app/hooks/useFormatDateTime.js';

export const useGetWeekDates = () => {
  const [thisWeek, setThisWeek] = useState('');
  const [nextWeek, setNextWeek] = useState('');
  const [weekAfterNext, setWeekAfterNext] = useState('');

  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
    const diffToMonday = (dayOfWeek) % 7; // Calculate difference to get back to Monday (day 1)

    // const getFormattedDate = (date) => {
    //   const day = String(date.getDate()).padStart(2, '0');
    //   const month = date.toLocaleString('default', { month: 'short' });
    //   const year = date.getFullYear();
    //   return `${day}-${month}-${year}`;
    // };

    // This Week
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - diffToMonday);
    const endOfThisWeek = new Date(startOfThisWeek);
    endOfThisWeek.setDate(startOfThisWeek.getDate() + 6);
    setThisWeek(`${formatDateTime(startOfThisWeek,true)} to ${formatDateTime(endOfThisWeek,true)}`);

    // Next Week
    const startOfNextWeek = new Date(endOfThisWeek);
    startOfNextWeek.setDate(endOfThisWeek.getDate() + 1);
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
    setNextWeek(`${formatDateTime(startOfNextWeek,true)} to ${formatDateTime(endOfNextWeek,true)}`);

    // Week After Next
    const startOfWeekAfterNext = new Date(endOfNextWeek);
    startOfWeekAfterNext.setDate(endOfNextWeek.getDate() + 1);
    const endOfWeekAfterNext = new Date(startOfWeekAfterNext);
    endOfWeekAfterNext.setDate(startOfWeekAfterNext.getDate() + 6);
    setWeekAfterNext(`${formatDateTime(startOfWeekAfterNext,true)} to ${formatDateTime(endOfWeekAfterNext,true)}`);
  }, []);

  return { thisWeek, nextWeek, weekAfterNext };
};