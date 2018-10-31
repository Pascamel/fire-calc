angular.module('fireapp').service('AuthSvc', function() {
	var self = this;

	self.isLoggedIn = () => {
		var user = firebase.auth().currentUser;
		return !!user;
	};

	self.login = (email, password) => {
		return firebase.auth().signInWithEmailAndPassword(email || '', password || '');
	}

	self.logout = () => {
		return firebase.auth().signOut();
	}

	return self;
});


angular.module('fireapp').service('dataSvc', function($q) {
	var self = this;

    this.firestore = firebase.firestore();
    const settings = {
    	timestampsInSnapshots: true
    };

    this.firestore.settings(settings);

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