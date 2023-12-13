export const parseSelectOptions = (array) => {
  let options = [];
  for(i in array){
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