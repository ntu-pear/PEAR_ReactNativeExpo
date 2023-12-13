export const parseSelectOptions = (array) => {
  let options = [];
  for(i in array){
    options.push({label: array[i], value: i+1})
  }
  return options;
}