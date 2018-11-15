'use strict';

angular.module('fireapp').directive('ngLoading', function ($compile) {
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


angular.module('fireapp').directive('fireAmount', function() {
  return {
    restrict: 'E',
    scope: {
      id: '=',
      type: '=',
      institution: '=?',
      readOnly: '='
    },
    template: '\
    <div class="amount-container">\
      <span ng-hide="$edit" ng-click="enterEdit()">{{ amount || \'-----\' }}</span>\
      <input type="text" ng-model="$amount" ng-show="$edit" />\
    </div>\
    ',
    controller: function($scope, $element, $attrs) {

      $scope.$edit = false;
      $scope.amount = _.reduce($scope.type === 'T' ? ['P', 'I'] : [$scope.type], (v, i) => v + _.get($scope, ['institution', i], 0), 0);

      $scope.enterEdit = () => {
        if ($scope.readOnly) return;
        $scope.$amount = $scope.amount;
        $scope.$edit = true;
        $timeout( () => {
          $element[0].querySelector('input').focus();
        });
      };

      $scope.confirmEdit = () => {
        $scope.amount = parseFloat($scope.$amount) || 0;
        $scope.$edit = false;
      };

      $scope.cancelEdit = () => {
        $scope.$edit = false;
      };

      var bindKeydownKeypress = $element.bind('keydown keypress', (e) => {
        if (e.which !== 13 && e.which !== 27) return;
        $scope.$apply(e.which === 13 ? $scope.confirmEdit : $scope.cancelEdit);
        e.preventDefault();
      });

      $scope.$on('global:keypress', (e, keyCode) => {
        if (keyCode === 13 && $scope.$edit) $scope.$apply($scope.confirmEdit);
        if (keyCode === 27 && $scope.$edit) $scope.$apply($scope.confirmEdit);
      });

      $scope.$on('$destroy', () => {
        bindKeydownKeypress();
      });
    }
  };
});