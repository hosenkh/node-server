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
    
  },

  /**
   * the controller to login page
   * @param  {angular injection} $scope [description]
   */
  loginController = function($scope, $resource) {
    $scope.common = commonScope.common;
    $scope.post = function (username, password) {
      var resource = $resource('/login',{}, {save: {method: 'POST'}});
      results = resource.save({username: username, password: md5(password)});
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

  DBUController = function ($scope, $resource, $routeParams) {
    var db = $resource('/db', {},
      {
        select: {method: 'POST', isArray: false},
        update: {method: 'POST'},
        insert: {method: 'POST'},
        delete: {method: 'POST'},
        updateBulk: {method: 'POST'},
        insertBulk: {method: 'POST'}
      }
    );
    $scope.updatePageData = function () {
      var firstView = db.select(
        {
          selectionArray: [{"table": $routeParams.table, "exportFields": ["*"]}],
          command: "select"
        }
      ),
      gotString = '';
      firstView.$promise.then(function(data){
        for (var i in data) {
          if (typeof(data[i]) == 'string') {
            gotString += data[i];
          }
        }
        gotString = gotString.slice(1);
        $scope.mainTable = JSON.parse(gotString);
        $scope.tableWidth = _.keys($scope.mainTable[0]);
        $scope.setWidth = function () {
          return {"width": $scope.tableWidth.length*20+'%'};
        };
        $scope.edittedArray = [[]];
        for (i in $scope.tableWidth) {
          $scope.edittedArray[0].push({key: $scope.tableWidth[i], value: ''});
        }
        $scope.edittedArray[0].shift();
      });
    };
    $scope.updatePageData();
    $scope.newRowActive = function () {
      $scope.newRow = true;
      if ($scope.edittedArray.length <1) {
        $scope.edittedArray = [[]];
        for (var i in $scope.tableWidth) {
          $scope.edittedArray[0].push({key: $scope.tableWidth[i], value: ''});
        }
        $scope.edittedArray[0].shift();
      }
    };
    $scope.moreNewRows = function () {
      $scope.edittedArray.push([]);
      for (var i in $scope.tableWidth) {
        $scope.edittedArray[$scope.edittedArray.length-1].push({key: $scope.tableWidth[i], value: ''});
      }
      $scope.edittedArray[$scope.edittedArray.length-1].shift();
      console.log($scope.edittedArray);
    };
    $scope.addRow = function () {
      var data = {};
      for (var i in $scope.edittedArray[0]) {
        data[$scope.edittedArray[0][i].key] = $scope.edittedArray[0][i].value;
      }
      db.insert(
        {
          command: "insert",
          data: data,
          selectionArray: $routeParams.table
        }
      );
      $scope.newRow = false;
      for (i in $scope.edittedArray[0]) {
        $scope.edittedArray[0][i].value = '';
      }
      $scope.updatePageData();
    };
    $scope.sendAll = function () {
      for (var i in $scope.edittedArray) {
        isEmpty = true;
        for (var j in $scope.edittedArray[i]) {
          isEmpty = isEmpty && $scope.edittedArray[i][j].value === '';
        }
        if (isEmpty === true) {
          $scope.edittedArray.splice(i,1);
        }
      }
      var columns = JSON.parse(JSON.stringify($scope.tableWidth));
      columns.shift();
      var data = {columns: columns, data:[]};
      for (i in $scope.edittedArray) {
        data.data.push([]);
        for (j in $scope.edittedArray[i]) {
          data.data[data.data.length-1].push($scope.edittedArray[i][j].value);
        }
        data.data[i].pop();
      }
      console.log(data);
      db.insertBulk(
        {
          command: 'insertBulk',
          selectionArray: $routeParams.table,
          data: data
        }
      );
      $scope.newRow = false;
      for (j in $scope.edittedArray) {
        for (i in $scope.edittedArray[j]) {
          $scope.edittedArray[0][j].value = '';
        }  
      }
      $scope.updatePageData();
    };
    $scope.dropNewRow = function (array) {
      for (var i in $scope.edittedArray) {
        if ($scope.edittedArray[i] == array) {
          $scope.edittedArray.splice(i,1);
          return;
        }
      }
      if ($scope.edittedArray.length < 2) {
        $scope.newRow = false;
      }
    };

    $scope.deleteClick = function () {

    };
    $scope.deleteRow = function () {

    };
  },

  /**
   * app initializer
   * @return {[type]} [description]
   */
  init = function(){
    ng
      .module('main', ['ngResource', 'ngRoute'])
      .controller('mainControl', ['$scope', '$resource', mainController])
      .controller('dbUController', ['$scope', '$resource', '$routeParams',DBUController])
      .controller('loginControl', ['$scope', '$resource', loginController]);
  }
  ;
  return {init: init};
})(window.angular, window._).init();
