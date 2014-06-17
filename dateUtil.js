/***************
 * Date Format *
 ***************/
    
exports.getLeDateFormat = function(dateStr) {
  var Months = [
    'Jan', 'Feb', 'Mar', 'Apr',
    'May', 'Jun', 'Jul', 'Aug',
    'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  if(!(dateStr instanceof Date)) 
    return null;  
    
  var day = dateStr.getDate();
  var month = Months[dateStr.getMonth()];
  var year = dateStr.getFullYear();
  
  return '' + day + ' ' + month + ' ' + year;
}