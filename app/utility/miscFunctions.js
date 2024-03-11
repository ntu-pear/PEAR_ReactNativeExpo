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
// TODO
export const formatTime = (inputTime) => {
  const listOfDays = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];

  let day, date, month, year;
  day = inputTime.getDay();
  date = inputTime.getDate();
  month = inputTime.getMonth() + 1;
  year = inputTime.getFullYear();
  date = date.toString().padStart(2, '0');
  month = month.toString().padStart(2, '0');

  return hideDayOfWeek
    ? `${date}/${month}/${year}`
    : `${listOfDays[day]}, ${date}/${month}/${year}`;
};

export const sortFilterInitialState = {'filterOptions': {}, 'sel': {}, 'tempSel': {}}