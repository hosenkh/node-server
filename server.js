server = function () {
  var
  http = require("http"),
  url = require("url"),

  // head = {"content-type": "text/plain"},

  singleInject = function (fun, inj) {
    var arg = inj;
    fun();
  },
  
  init = function (route, handle) {
    onRequest = function (request, response) {
      var
      pathUrl = request.url,
      method = request.method.toLowerCase(),
      path = url.parse(pathUrl).pathname;
      route(handle, path, response, url.parse(pathUrl).query, method);
    };
    server = http.createServer(onRequest);
    server.listen(8082);
  };

  return {init: init};
};
exports.init = server().init;