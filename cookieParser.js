parse = function (cookie) {
  var cookieObject = {};
  if (cookie) {
    cookieArray = cookie.split('; ');
    for (var i in cookieArray) {
      tempArray = cookieArray[i].split('=');
      cookieObject[tempArray[0]] = tempArray[1];
    }
  }
  return cookieObject;
};
exports.parse = parse;