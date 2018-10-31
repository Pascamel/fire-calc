'use strict';

angular.module('fireapp', ['ui.router', 'ui.bootstrap', 'toastr']);

angular.module('fireapp').config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise(($injector) => {
        var $state = $injector.get('$state');
        $state.go('splash');
    });

	$stateProvider.state('splash', {
        templateUrl: './partials/splash.html',
        controller: 'splashCtrl'
    }).state('login', {
        templateUrl: './partials/login.html',
        controller: 'loginCtrl'
    }).state('app', {
        templateUrl: './partials/app.html',
        controller: 'appCtrl'
    }).state('user-dashboard', {
        templateUrl: './partials/dashboard.html',
        controller: 'dashboardCtrl'
    });
});

angular.module('fireapp').run(function($state) {
	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
			$state.go('user-dashboard');
		} else {
			$state.go('splash');
		}
	});
});
