'use strict';

angular.module('fireapp').controller('mainMenuCtrl', function($scope, AuthSvc, toastr) {
  $scope.authSvc = AuthSvc;

  $scope.logoutUser = () => {
    AuthSvc.logout().then((data) => {
      toastr.success('Logged out successfully');
    }).catch((error) => {
      toastr.error(error.message || 'An error occurred. Please try again later.');
    });
  };
});
