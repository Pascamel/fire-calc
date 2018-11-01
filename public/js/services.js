angular.module('fireapp').service('AuthSvc', function($q, $timeout) {
	var self = this;

	self.isAuthenticated = () => {
		var user = firebase.auth().currentUser;
		return !!user;
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

		let checkauth = () => {
			$timeout(() => {
				if (self.isAuthenticated()) {
					deferred.resolve(true);
				} else {
					checkauth();
				}
			}, 200);
		}

		checkauth();
		return deferred.promise;
	}

	return self;
});


angular.module('fireapp').service('DataSvc', function($q) {
	var self = this;

    this.firestore = firebase.firestore();
    const settings = {
    	timestampsInSnapshots: true
    };

    this.firestore.settings(settings);

    this.lastUpdateFinances = () => {
    	var deferred = $q.defer();

		let userId = firebase.auth().currentUser.uid;
		if (!userId) return deferred.reject({message: 'User is not anthenticated'});

		this.firestore.collection("finances").doc(userId).get().then((snapshot) => {
			if (snapshot.exists) {
				deferred.resolve(snapshot.data().last_update);
			} else {
				deferred.reject({message: 'Data does not exist'});
			}
		});

		return deferred.promise;
    };

    this.loadFinances = () => {
		var deferred = $q.defer();

		let userId = firebase.auth().currentUser.uid;
		if (!userId) return deferred.reject({message: 'User is not anthenticated'});

		this.firestore.collection("finances").doc(userId).get().then((snapshot) => {
			if (snapshot.exists) {
				deferred.resolve(snapshot.data().data);
			} else {
				deferred.resolve({});
			}
		});

		return deferred.promise;
    };

    this.saveFinances = (data) => {
    	let userId = firebase.auth().currentUser.uid;
		if (!userId) return;

		let payload = {
			last_update: (new Date()).getTime(),
			data: data
		}

		return this.firestore.collection("finances").doc(userId).set(payload);
    };

    return self;
});