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
  }).state('user-dashboard', {
    url: '/user-dashboard',
    templateUrl: './partials/dashboard.html',
    controller: 'dashboardCtrl'
  }).state('savings', {
    url: '/savings',
    templateUrl: './partials/savings.html',
    controller: 'savingsCtrl'
  }).state('revenues', {
    url: '/revenues',
    templateUrl: './partials/revenues.html',
    controller: 'revenuesCtrl'
  }).state('headers', {
    url: '/headers',
    templateUrl: './partials/headers.html',
    controller: 'headersCtrl'
  });

  $locationProvider.html5Mode(true);
});

angular.module('fireapp').run(function($state, $rootScope) {
  $rootScope._ = _;

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      if (_.reduce(['headers', 'savings', 'revenues'], (acc, s) => acc && !$state.is(s), true)) {
        $state.go('user-dashboard');
      }
    } else if (_.reduce(['login'], (acc, s) => acc && !$state.is(s), true)) {
      $state.go('splash');
    }
  });
    
  angular.element(document).bind('keyup', (e) => {
    if (e.keyCode !== 27 && e.keyCode !== 13) return;
    $rootScope.$broadcast('global:keypress', e.keyCode);
  });
});
