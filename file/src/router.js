(function (ng){
  var
  /**
   * routing config
   * @param  {angular injection} routeProvider [description]
   */
  configurater = function(routeProvider){
    routeProvider
      .when('/home', {
        templateUrl: 'restricted/partials/main.html',
        controller: 'mainControl'
      })
      .when('/login', {
        templateUrl: 'restricted/partials/login.html',
        controller: 'loginControl'
      })
      .when('/dbUI/:table', {
        templateUrl: 'restricted/partials/dbUI.html',
        controller: 'dbUController'
      })
      .otherwise({
        redirectTo: '/home'
      });
  },

  /**
   * routing initializer
   */
  init = function(){
    ng
      .module('router',['main','ngRoute'])
      .config(['$routeProvider', configurater]);
  }
  ;
  return {init: init};
})(window.angular).init();