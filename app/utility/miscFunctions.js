export const parseSelectOptions = (array) => {
  let options = [];
  for(i=0; i<array.length; i++){
    options.push({label: array[i], value: i+1})
  }
  return options;
}

export const getItemHeight = (ref) => {
  if (ref.current) {
    ref.current.measure((x, y, width, height, pageX, pageY) => {
      return height;
    });
  }
}