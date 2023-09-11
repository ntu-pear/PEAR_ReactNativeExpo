
// Function used to format date data into dd-mm-yyyy
export default function useFormatDateTime(strDate, boolDate) {
  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    if (hours.toString().length !== 2){
      hours = '0' + hours;
    }
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  if (boolDate){
    const originalDate = new Date(strDate);
    const adjustedDateTime = new Date(originalDate.getTime() - 8 * 60 * 60 * 1000);
    
    const day = adjustedDateTime.getDate();
    const month = adjustedDateTime.getMonth() + 1;
    const year = adjustedDateTime.getFullYear();
    
    const formattedDate = `${day < 10 ? "0" : ""}${day}-${month < 10 ? "0" : ""}${month}-${year}`;
    return formattedDate;
  } else {
    const originalDateTime = new Date(strDate);
    const adjustedDateTime = new Date(originalDateTime.getTime() - 8 * 60 * 60 * 1000);

    // Format the time as "h:mm A" (e.g., "10:24 AM")
    const formattedTime = formatAMPM(adjustedDateTime);
    return formattedTime;
  }
}
