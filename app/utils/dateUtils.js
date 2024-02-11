const moment = require('moment');

function convertDateFormat(inputDateStr) {
  if (typeof inputDateStr !== 'string') {
    return ''; // Return an empty string or handle the error as needed
  }
console.log(inputDateStr);
  const formattedDate = moment(inputDateStr).format('MM/DD/YYYY');
  console.log(formattedDate);
  return formattedDate;
}

function dateFormat(date){
    // Parse the announcement_date received in "MM-DD-YYYY" format
    const dateParts = date.split("-");
    const year = parseInt(dateParts[2]);
    const month = parseInt(dateParts[0]) - 1; // Months are zero-based
    const day = parseInt(dateParts[1]);

    return parsedDate = new Date(Date.UTC(year, month, day));

}
// function convertDateFormat(inputDateStr) {
//     console.log(inputDateStr);
//     const year = inputDateStr.substring(0, 4);
//     const month = inputDateStr.substring(5, 7);
//     const day = inputDateStr.substring(8, 10);
//     return `${month}/${day}/${year}`;
//   }
// Export both functions together
module.exports = {
    dateFormat,
    convertDateFormat
};