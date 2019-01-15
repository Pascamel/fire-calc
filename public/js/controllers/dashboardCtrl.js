'use strict';

angular.module('fireapp').controller('dashboardCtrl', function($scope, $q, AuthSvc, DataSvc, toastr) {
  $scope.init = () => {
    $q.all([DataSvc.lastUpdateSavings(), DataSvc.lastUpdateIncome()]).then((data) => {
      $scope.lastUpdate = moment.unix(Math.max(data[0], data[1]) / 1000).fromNow();
      $scope.loaded = true;
    }).catch((error) => {
      toastr.error(error.message || 'An error occurred. Please try again later.');
    });
  };

  $scope.loaded = false;
  AuthSvc.waitForAuth().then((isAuthenticated) => {
    if (isAuthenticated) $scope.init();
  });
});
