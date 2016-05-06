router = function () {
  var
  head = {"content-type": "text/html"},

  init = function (handle, pathname, response, URL, method, cookies, postData) {
    pathnameArray = pathname.split('/');
    pathnameArray[1] = '/'+pathnameArray[1];
    if (typeof handle[pathnameArray[1]] === 'function') {
      handle[pathnameArray[1]](response, pathname, URL, method, cookies, postData);
    } else {
      handle['/'](response, pathname, cookies);
    }
  };
  return {init: init};
};
exports.init = router().init;