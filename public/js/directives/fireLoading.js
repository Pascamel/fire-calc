angular.module('fireapp').directive('fireLoading', function ($compile) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.parent().append('<div class="col-xs-12 loading-spinner" ng-show="loaded"><div class="fa fa-spinner fa-spin"></div></div>');
      scope.$watch(attrs.ngLoading, (val) => {
        if (val) {
          angular.element(document.querySelector(".loading-spinner")).remove();
          element.removeClass('ng-hide');
        } else {
          element.addClass('ng-hide');
        }
      });
    }
  };
});
