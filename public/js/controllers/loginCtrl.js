'use strict';

angular.module('fireapp').controller('loginCtrl', function($scope, AuthSvc, toastr) {
  $scope.email = '';
  $scope.password = '';

  $scope.loginUser = () => {
    AuthSvc.login($scope.email, $scope.password).then((data) => { 
      toastr.success('Logged in successfully');
    }).catch((error) => {
      toastr.error(error.message || 'An error occurred. Please try again later.');
    });
  };
});
