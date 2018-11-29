'use strict';

angular.module('fireapp').controller('dashboardCtrl', function($scope, AuthSvc, DataSvc, toastr) {
	$scope.init = () => {
		$scope.data = {};	
		DataSvc.lastUpdateFinances().then((data) => {
			$scope.lastUpdate = moment.unix(data/1000).fromNow();
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
