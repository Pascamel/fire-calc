'use strict';

angular.module('fireapp').service('AuthSvc', function ($q, $timeout) {
  var self = this;

  self.isAuthenticated = () => {
    var user = firebase.auth().currentUser;
    return !!user;
  };

  self.userDisplay = () => {
    var user = firebase.auth().currentUser;
    return _.get(user, 'email', 'N/A');
  };

  self.login = (email, password) => {
    return firebase.auth().signInWithEmailAndPassword(email || '', password || '');
  }

  self.logout = () => {
    return firebase.auth().signOut();
  }

  self.waitForAuth = () => {
    var deferred = $q.defer();

    if (self.isAuthenticated()) {
      deferred.resolve(true);
    }

    firebase.auth().onAuthStateChanged((user) => {
      deferred.resolve(!!user);
    });
    return deferred.promise;
  }

  return self;
});
