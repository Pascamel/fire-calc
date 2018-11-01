angular.module('fireapp').controller('MainMenuCtrl', function($scope, AuthSvc, toastr) {
    $scope.authSvc = AuthSvc;

    $scope.logoutUser = () => {
    	AuthSvc.logout().then((data) => {
			toastr.success('Logged out successfully');
		}).catch((error) => {
			toastr.error(error.message || 'An error occurred. Please try again later.');
		});
    };
});

angular.module('fireapp').controller('splashCtrl', function($scope) {
	// TODO
});

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

angular.module('fireapp').controller('appCtrl', function($scope, AuthSvc, DataSvc, toastr) {
	$scope.addProperty = () => {
		$scope.data[$scope.newPropertyName] = 0
	};

	$scope.init = () => {
		$scope.data = {};
		DataSvc.loadFinances().then((data) => {
			$scope.data = data;
		}).catch((error) => {
			toastr.error(error.message || 'An error occurred. Please try again later.');
		});
	};

	$scope.saveChanges = () => {
		DataSvc.saveFinances($scope.data).then(() => {
			toastr.success('Data updated successfully');
		}).catch((error) => {
		    toastr.error(error.message || 'An error occurred. Please try again later.');
		});
	};

	AuthSvc.waitForAuth().then($scope.init);
});

angular.module('fireapp').controller('dashboardCtrl', function($scope, AuthSvc, DataSvc) {
	$scope.init = () => {
		console.log('ok lets init')
		$scope.data = {};
		DataSvc.lastUpdateFinances().then((data) => {
			$scope.lastUpdate = moment.unix(data/1000).fromNow();
		}).catch((error) => {
			toastr.error(error.message || 'An error occurred. Please try again later.');
		});
	};

	AuthSvc.waitForAuth().then($scope.init);
});
