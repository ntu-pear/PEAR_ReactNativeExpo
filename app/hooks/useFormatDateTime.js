
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

  if(strDate === 'null' || strDate === null) {
    return '-';
  }

  if (boolDate){
    const originalDate = new Date(strDate);
    const adjustedDateTime = new Date(originalDate.getTime() - 8 * 60 * 60 * 1000);
    
    const day = String(originalDate.getDate()).padStart(2, '0');
    const month = originalDate.toLocaleString('default', { month: 'short' }).toUpperCase();
    const year = originalDate.getFullYear();

    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
  } else {
    const originalDateTime = new Date(strDate);
    const adjustedDateTime = new Date(originalDateTime.getTime() - 8 * 60 * 60 * 1000);

    // Format the time as "h:mm A" (e.g., "10:24 AM")
    const formattedTime = formatAMPM(adjustedDateTime);
    return formattedTime;
  }
}
