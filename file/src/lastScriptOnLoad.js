document.addEventListener('WebComponentsReady', function () {
  var scope = document.querySelector('template[is=dom-bind]');
  scope.common = commonScope.common;
});
window.onhashchange = function() {
  commonScope.common.show = false;
  commonScope.common.getPermission(window.location.hash, function(permission) {
    console.log(permission);
    setTimeout(function(){
      commonScope.common.postpone();
      commonScope.common.show = true;
    }, 200);
  });
};