(function (ng){
  var
  /**
   * routing config
   * @param  {angular injection} routeProvider [description]
   */
  configurater = function(routeProvider){
    routeProvider
      .when('/home', {
        templateUrl: 'partials/main.html',
        controller: 'mainControl'
      })
      .when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'tableControl'
      })
      .when('/databaseuserinterface', {
        templateUrl: 'partials/dbUI.html',
        controller: 'polymerTestControl'
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