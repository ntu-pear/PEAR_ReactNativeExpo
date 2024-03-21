import MessageDisplayCard from "app/components/MessageDisplayCard";
import { View } from "native-base";

// Function that takes array of select options and converts to required [{value, label}, {}, {} ...] format
export const parseSelectOptions = (array) => {
  let options = [];
  for(var i=0; i<array.length; i++){
    options.push({label: array[i], value: i+1})
  }
  return options;
}

// Function that retrieves height of a component
export const getItemHeight = (ref) => {
  if (ref.current) {
    ref.current.measure((x, y, width, height, pageX, pageY) => {
      return height;
    });
  }
}

// Function to initialize disabled status of items in allergy select field 
export const initSelectDisable = (list) => {
  let isDisabledItems = {}
  for(var item of list) {
    isDisabledItems[item['value']] = false;
  }
  return isDisabledItems
}

// Function to sort array of objects on a property
export const sortArray = (arr, property, asc) => {
  if(asc) {
    return arr.sort((a,b) => 
      (a[property].toString().toLowerCase().trim() > b[property].toString().toLowerCase().trim()) ? 1 :
      (b[property].toString().toLowerCase().trim() > a[property].toString().toLowerCase().trim()) ? -1 : 0)
  } else {    
    return arr.sort((a,b) => 
      (a[property].toString().toLowerCase().trim() < b[property].toString().toLowerCase().trim()) ? 1 :
      (b[property].toString().toLowerCase().trim() < a[property].toString().toLowerCase().trim()) ? -1 : 0)
  }
}

export const parseAutoCompleteOptions = (array) => {
  let options = [];
  for(var i=0; i<array.length; i++){
    options.push({title: array[i], id: (i+1).toString()})
  }
  return options;
}

// Used to update state when a component declares a state only if the state is not a prop from the parent
// If prop state passed, update prop state
// Otherwise update state that is declared in the component
export const updateState = (setInternalState, setExternalState, value) => {
  if(setExternalState) {
    setExternalState(value);
  }
  setInternalState(value);  
}

export const isEmptyObject = (object) => {
  return Object.keys(object).length == 0;
}

// Used to format the date to DD/MM/YYYY
export const formatDate = (inputDate, hideDayOfWeek) => {
  const listOfDays = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
  let day, date, month, year;
  day = inputDate.getDay();
  date = inputDate.getDate();
  month = inputDate.getMonth() + 1;
  year = inputDate.getFullYear();
  date = date.toString().padStart(2, '0');
  month = month.toString().padStart(2, '0');

  return hideDayOfWeek
    ? `${date}/${month}/${year}`
    : `${listOfDays[day]}, ${date}/${month}/${year}`;
};

// Used to format the time to HH:mm AM/PM
export const formatTimeAMPM = (date) => {
  date = typeof(date) == 'Date' ? date : new Date(date);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  
  return strTime;
};

// Convert a string of military time like 0900 to datetime 
export const convertTimeMilitary = (timeString, date=new Date()) => {
  const hours = parseInt(timeString.substring(0, 2), 10);
  const minutes = parseInt(timeString.substring(2), 10);
  
  const dateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
  
  return dateTime;
}

// Convert date to 24 hour format string like "15:20" or "1520"
export const formatTimeHM24 = (date, useColon=true) => { 
  date = typeof(date) == 'Date' ? date : new Date(date);

  const hour = date.getHours();
  const minute = date.getMinutes();

  const hourString = hour < 10 ? '0' + hour : hour.toString();
  const minuteString = minute < 10 ? '0' + minute : minute.toString();
  
  const timeString = hourString + (useColon ? ':' : '') + minuteString;

  return timeString;
}

// Convert 24 hour format string like "15:20" to datetime
export const convertTimeHM24 = (timeString, date=new Date()) => {
  
  const hours = timeString.split(':')[0];
  const minutes = timeString.split(':')[1];

  return new Date(new Date(new Date().setHours(hours)).setMinutes(minutes));
}

// Convert DD/MM/YYYY string to datetime
export const convertDateDMY = (dateString) => {
  
  const date = dateString.split('/')[0];
  const month = dateString.split('/')[1];
  const year = dateString.split('/')[2];
  
  return new Date().setFullYear(year, month-1, date);
}

// Set the seconds of any datetime to zero
// Useful for time-related calculations where seconds are irrelevant
export const setSecondsToZero = (datetime) => {
  let tempDatetime = new Date(datetime)
  datetime = datetime.setHours(tempDatetime.getHours(), tempDatetime.getMinutes(), 0);
  return new Date(datetime);
}

// Set the hours, minutes, and seconds of any datetime to zero
// Useful for date-related calculations where only comparing date
export const setTimeToZero = (datetime) => {
  datetime = typeof(datetime) == 'Date' ? datetime : new Date(datetime);
  datetime = datetime.setHours(0, 0, 0);
  datetime = new Date(datetime).setMilliseconds(0);
  return new Date(datetime);
}

// Format of data for sort and filter states used by FilterModal/SearchFilterBar
export const sortFilterInitialState = {'filterOptions': {}, 'sel': {}, 'tempSel': {}}

// Returns message to display if api call error or no data to display
// For flatlist, need additional top padding to center the message
export const noDataMessage = (statusCode=null, isLoading=false, isError=false, defaultMessage='No data found', flatlist=false) => {
  // Display error message if API request fails
  let message = '';
  if (isLoading) {
    return <></>;
  }
  if (isError) {
    if (statusCode === 401) {
      message = 'Error: User is not authenticated.';
    } else if (statusCode >= 500) {
      message = 'Error: Server is down. Please try again later.';
    } else {
      message = `${statusCode || 'Some'} error has occured`;
    }
  }
  return (
      <MessageDisplayCard
        TextMessage={isError ? message : defaultMessage}
        topPaddingSize={flatlist ? '36%' : 0}
        />
  );
};