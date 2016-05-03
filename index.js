(function () {
  var
  server = require("./server"),
  router = require("./router"),
  requestHandler = require("./requestHandlers"),
  handler = {
    "/": requestHandler.main,
    "/db": requestHandler.db,
  },

  init = function () {
    server.init(router.init, handler);
  };
  return {init: init};
})().init();
