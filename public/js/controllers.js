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

angular.module('fireapp').controller('appCtrl', function($scope, dataSvc, toastr) {
	$scope.addProperty = () => {
		$scope.data[$scope.newPropertyName] = 0
	};

	$scope.init = () => {
		$scope.data = {};
		dataSvc.loadFinances().then((data) => {
			$scope.data = data;
		}).catch((error) => {
			toastr.error(error.message || 'An error occurred. Please try again later.');
		});
	};

	$scope.saveChanges = () => {
		dataSvc.saveFinances($scope.data).then(() => {
			toastr.success('Data updated successfully');
		}).catch((error) => {
		    toastr.error(error.message || 'An error occurred. Please try again later.');
		});
	};

	$scope.init();
});

angular.module('fireapp').controller('dashboardCtrl', function($scope) {
	// TODO
});
