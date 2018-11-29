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


angular.module('fireapp').directive('fireCollapseToggle', function() {
  return {
    restrict: 'E',
    scope: {
      flag: '='
    },
    template: '<i class="fa" ng-class="{\'fa-chevron-right\': flag, \'fa-chevron-down\': !flag}" ng-click="flag=!flag"></i>'
  };
});


angular.module('fireapp').directive('fireAmount', function() {
  return {
    restrict: 'E',
    scope: {
      id: '=',
      type: '=',
      institution: '=?',
      types: '=',
      class: '='
    },
    template: '\
    <div class="amount-container {{class}}" ng-class="{\'read-only\': type === \'T\'}" ng-click="enterEdit()">\
      <span ng-hide="$edit">{{ amount | amount }}</span>\
      <input type="text" ng-model="$amount" ng-show="$edit" style="width: 80px" />\
    </div>\
    ',
    controller: function($scope, $element, $timeout, $rootScope) {

      $scope.$edit = false;
      $scope.amount = _.reduce($scope.type === 'T' ? ['P', 'I'] : [$scope.type], (v, i) => v + _.get($scope, ['institution', i], 0), 0);

      $scope.enterEdit = () => {
        if ($scope.type === 'T') return;
        $scope.$amount = $scope.amount;
        $scope.$edit = true;
        $timeout(() => {
          $element[0].querySelector('input').focus();
        });
      };

      var newTotalInstitution = () => {
        return _.reduce($scope.types.filter(e => e !== 'T'), (v, i) => v + _.get($scope, ['institution', i], 0), 0);
      }

      if ($scope.type === 'T') {
        $scope.$watch(() => {
          return _.get($scope, ['institution', $scope.type]);
        }, (value) => {
          if (value !== null) $scope.amount = newTotalInstitution();
        });
      }

      $scope.confirmEdit = () => {
        $scope.amount = parseFloat($scope.$amount) || 0;

        if (!$scope.institution) $scope.institution = {};
        $scope.institution[$scope.type] = $scope.amount;

        if ($scope.types.indexOf('T') !== -1) $scope.institution['T'] = newTotalInstitution();
        
        $scope.$edit = false;
        $rootScope.$broadcast('savings:updated');
      };

      $scope.cancelEdit = () => {
        $scope.$edit = false;
      };

      $element.bind('keydown keypress', (e) => {
        if (e.which !== 13 && e.which !== 27) return;
        
        $scope.$apply(e.which === 13 ? $scope.confirmEdit : $scope.cancelEdit);
        e.preventDefault();
      });

      $scope.$on('global:keypress', (e, keyCode) => {
        if (keyCode === 13 && $scope.$edit) $scope.$apply($scope.confirmEdit);
        if (keyCode === 27 && $scope.$edit) $scope.$apply($scope.confirmEdit);
      });

      $scope.$on('$destroy', () => {
        $element.unbind('keydown keypress');
      });
    }
  };
});