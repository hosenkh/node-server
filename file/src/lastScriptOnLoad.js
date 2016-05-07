// document.addEventListener('WebComponentsReady', function () {
//   var scope = document.querySelector('template[is=dom-bind]');
//   scope.common = commonScope.common;
// });
window.onhashchange = function() {
  setTimeout(function () {
    link = document.getElementById('restrictedlink');
    console.log(link);
    if (window.location.hash != '#/login') {
      if (link === null) {
        commonScope.common.lastPagePermitted = window.location.hash;
        commonScope.common.lastPage = window.location.hash;
      } else {
        commonScope.common.lastPage = window.location.hash;
      }
    }
    console.log(commonScope.common);
  }, 200);
  
};
