router = function () {
  var
  head = {"content-type": "text/html"},

  init = function (handle, pathname, response, URL, method) {
    pathnameArray = pathname.split('/');
    pathnameArray.shift();
    pathnameArray[0] = '/'+pathnameArray[0];
    if (typeof handle[pathnameArray[0]] === 'function') {
      handle[pathnameArray[0]](response, pathname, URL, method);
    } else {
      handle['/'](response, pathname);
    }
  };
  return {init: init};
};
exports.init = router().init;