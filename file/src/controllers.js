(function (ng, _, undefined){
  var
  /**
   * the controller for the main page
   * @param  {angular injection} $scope the scope
   */
  mainController = function($scope, $resource){
    $scope.common = commonScope.common;
    $scope.common.postpone = function () {
      $resource('/postpone').get();
    };
    console.log(commonScope.common);
  },

  /**
   * the controller to login page
   * @param  {angular injection} $scope [description]
   */
  loginController = function($scope, $resource) {
    $scope.common = commonScope.common;
    $scope.post = function (username, password) {
      var resource = $resource('/login',{}, {save: {method: 'POST'}});
      results = resource.save({username: username, password: password});
      results.$promise.then(function(data){
        var log = '';
        for (var i in data) {
          if (typeof (data[i]) == 'string') {
            log += data[i];
          }
        }
        switch (log) {
          case 'login successful':
            console.log('login successful');
            console.log(commonScope.common.lastPage);
            window.location = commonScope.common.lastPage;
            window.location.reload();
          break;
          case 'password incorrect':
            $scope.password = '';
            console.log('password incorrect');
          break;
          case 'no such user':
            $scope.username = '';
            $scope.password = '';
            console.log('no such user');
          break;
        }
      });
    };
  },

  DBUController = function ($scope, $resource) {

  },

  /**
   * app initializer
   * @return {[type]} [description]
   */
  init = function(){
    ng
      .module('main', ['ngResource'])
      .controller('mainControl', ['$scope', '$resource', mainController])
      .controller('dbUController', ['$scope', '$resource', DBUController])
      .controller('loginControl', ['$scope', '$resource', loginController]);
  }
  ;
  return {init: init};
})(window.angular, window._).init();
