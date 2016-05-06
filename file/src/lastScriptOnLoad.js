// document.addEventListener('WebComponentsReady', function () {
//   var scope = document.querySelector('template[is=dom-bind]');
//   scope.common = commonScope.common;
// });
window.onhashchange = function() {
  commonScope.common.show = false;
  setTimeout(function(){
    commonScope.common.getPermission(window.location.hash, function(permission) {
      console.log(permission);
      commonScope.common.postpone();
      commonScope.common.show = true;
    });
  }, 200);
};
console.log(commonScope.common);