export default function useFormatDateTime(strDate, boolDate) {
  function formatAMPM(date) {
    let hours = date.getUTCHours() + 8; // Adjust for GMT+8
    let minutes = date.getUTCMinutes();

    // Handle rollover of hours past midnight
    if (hours >= 24) {
      hours -= 24;
    }

    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let strTime = `${hours}:${minutes} ${ampm}`;

    console.log(`Formatted Time: ${strTime}`); // Debugging statement
    return strTime;
  }

  const originalDate = new Date(strDate);
  console.log(`Original UTC Time: ${originalDate.toISOString()}`); // Debugging statement

  if (boolDate) {
    // Adjust for GMT+8 and format date as dd-mm-yyyy
    let day = originalDate.getUTCDate();
    let month = originalDate.getUTCMonth() + 1; // getMonth() returns 0-11
    let year = originalDate.getUTCFullYear();
    originalDate.setUTCHours(originalDate.getUTCHours() + 8); // Adjust hours for GMT+8
    // Check if the day has changed after adjustment
    if (originalDate.getUTCDate() !== day) {
      day = originalDate.getUTCDate();
      month = originalDate.getUTCMonth() + 1;
      year = originalDate.getUTCFullYear();
    }
    const formattedDate = `${day < 10 ? '0' : ''}${day}-${
      month < 10 ? '0' : ''
    }${month}-${year}`;

    console.log(`Formatted Date: ${formattedDate}`); // Debugging statement
    return formattedDate;
  } else {
    // Directly format time considering GMT+8 adjustment within formatAMPM
    const formattedTime = formatAMPM(originalDate);
    return formattedTime;
  }
}
