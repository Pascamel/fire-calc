'use strict';

angular.module('fireapp').directive('fireCollapseToggle', function() {
  return {
    restrict: 'E',
    scope: {
      flag: '='
    },
    template: '<i class="fa" ng-class="{\'fa-chevron-right\': flag, \'fa-chevron-down\': !flag}" ng-click="flag=!flag"></i>'
  };
});
