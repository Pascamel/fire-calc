'use strict';

angular.module('fireapp', ['ui.router', 'ui.bootstrap', 'toastr']);

angular.module('fireapp').config(function($stateProvider, $urlRouterProvider, $locationProvider) {
	$urlRouterProvider.otherwise(($injector) => {
        var $state = $injector.get('$state');
        $state.go('splash');
    });

	$stateProvider.state('splash', {
        url: '/',
        templateUrl: './partials/splash.html',
        controller: 'splashCtrl'
    }).state('login', {
        url: '/login',
        templateUrl: './partials/login.html',
        controller: 'loginCtrl'
    }).state('app', {
        url: '/app',
        templateUrl: './partials/app.html',
        controller: 'appCtrl'
    }).state('user-dashboard', {
        url: '/user-dashboard',
        templateUrl: './partials/dashboard.html',
        controller: 'dashboardCtrl'
    });

    $locationProvider.html5Mode(true);
});

angular.module('fireapp').run(function($state) {
	firebase.auth().onAuthStateChanged((user) => {
		if (user) {
            if (!$state.is('app')) {
                $state.go('user-dashboard');
            }
		} else {
			$state.go('splash');
		}
	});
});
