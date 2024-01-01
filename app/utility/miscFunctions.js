// Function that takes array of select options and converts to required [{value, label}, {}, {} ...] format
export const parseSelectOptions = (array) => {
  let options = [];
  for(i=0; i<array.length; i++){
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