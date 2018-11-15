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


angular.module('fireapp').controller('splashCtrl', function($scope) {});


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


angular.module('fireapp').controller('dashboardCtrl', function($scope, AuthSvc, DataSvc) {
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


angular.module('fireapp').controller('headersCtrl', function($scope, AuthSvc, DataSvc, toastr) {
	$scope.init = () => {
		$scope.currentYear = new Date().getFullYear();
		$scope.newHeaderLabel = '';
		$scope.newHeaderSublabel = '';
		$scope.headers = {};
		$scope.headers.startingCapital = 0;
		$scope.headers.firstMonth = new Date().getMonth();
		$scope.headers.firstYear = new Date().getFullYear();
		DataSvc.loadHeaders().then((data) => {
			if (!data.headers) data.headers = [];
			angular.extend($scope.headers, data);
			$scope.loaded = true;
		}).catch((error) => {
			toastr.error(error.message || 'An error occurred. Please try again later.');
		});
	};

	$scope.labelMonth = (m) => {
		return moment().month(m-1).format('MMMM');
	};

	$scope.addHeader = () => {
		let h = {
			id: DataSvc.newUUID(),
			label: $scope.newHeaderLabel,
			sublabel: $scope.newHeaderSublabel,
			sorting: $scope.headers.headers.length,
			principal: true,
			interet: false,
			total: false
		};
		$scope.headers.headers.push(h);
		$scope.newHeaderLabel = '';
		$scope.newHeaderSublabel = '';
	};

	$scope.editHeader = (header) => {
		header.$edit = true;
		header.$editLabel = header.label;
		header.$editSublabel = header.sublabel;
	};

	$scope.editHeaderConfirm = (header) => {
		header.label = header.$editLabel;
		header.sublabel = header.$editSublabel;
		header.$edit = false;
	}

	$scope.editHeaderCancel = (header) => {
		header.$edit = false;
	};

	$scope.removeHeader = (header) => {
		_.remove($scope.headers.headers, (h) => {
			return h.id === header.id;
		});
	};

	$scope.saveChanges = () => {
		_.each($scope.headers.headers, (header) => {
			delete header.$edit;
			delete header.$editLabel;
			delete header.$editSublabel;
		});

		$scope.headers.startingCapital = parseFloat($scope.headers.startingCapital) || 0;

		DataSvc.saveHeaders($scope.headers).then(() => {
			toastr.success('Headers updated successfully');
		}).catch((error) => {
		    toastr.error(error.message || 'An error occurred. Please try again later.');
		});
	};

	$scope.loaded = false;
	AuthSvc.waitForAuth().then((isAuthenticated) => {
		if (isAuthenticated) $scope.init();
	});
});


angular.module('fireapp').controller('appCtrl', function($scope, $q, AuthSvc, DataSvc, toastr) {
	$scope.addProperty = () => {
		$scope.data[$scope.newPropertyName] = 0
	};

	$scope.init = () => {
		$scope.headers = {};
		$scope.data = [];
		$q.all([DataSvc.loadHeaders(), DataSvc.loadFinances()]).then((data) => {
			$scope.formatHeaders(data[0]);
			$scope.formatData(data[1]);
			$scope.loaded = true;
		}).catch((error) => {
			toastr.error(error.message || 'An error occurred. Please try again later.');
		});
	};

	let formatYear = (months) => {
		return _(months).reduce((acc, m) => {
			acc[m] = {};
			return acc;
		}, {});
	};

	$scope.formatHeaders = (d) => {
		angular.extend($scope, d);
		$scope.headersLine1 = _($scope.headers)
			.map((header) => {
				return {
					label: header.label,	
					weight: (header.principal ? 1 : 0) + (header.interest ? 1 : 0) + (header.total ? 1 : 0)
				};
			})
			.groupBy('label')
			.map((header, key) => {
				let temp = _.reduce(header, (sum, v) => {
					return sum + v.weight;
				}, 0);
				return {
					label: key,
					weight: temp
				};
			})
			.value();
		$scope.headersLine2 = _($scope.headers)
			.map((header) => {
				o = [];
				if (header.principal) o.push(header.sublabel || 'Principal');
				if (header.interest) o.push('Interest');
				if (header.total) o.push('Total');
				return o;
			})
			.flatMap()
			.value();
		$scope.inputLine = _($scope.headers)
			.map((header) => {
				o = [];
				if (header.principal) o.push({id: header.id, type: 'P'});
				if (header.interest) o.push({id: header.id, type: 'I'});
				if (header.total) o.push({id: header.id, type: 'T'});
				return o;
			})
			.flatMap()
			.value();
	};

	$scope.formatData = (d) => {
		$scope.data = {};
		let years = _.range($scope.firstYear, new Date().getFullYear() + 1);

		_(years).each((y, idx) => {
			let months = [];
			if (idx === 0 && years.length === 1) {
				$scope.data[y] = formatYear(_.range($scope.firstMonth, new Date().getMonth() + 2));
			} else if (idx === 0) {
				$scope.data[y] = formatYear(_.range($scope.firstMonth, 13));
			} else if (idx === (years.length -1)) {
				$scope.data[y] = formatYear(_.range(1, new Date().getMonth() + 2));
			} else {
				$scope.data[y] = formatYear(_.range(1, 13));
			}
		});

		_(d).each((info) => {
			_.set($scope.data, [info.year, info.month, info.institution, info.type], info.amount);
		});
	}; 

	$scope.formatDataToSave = () => {
		let data = [];

		_.each($scope.data, (data_year, year) => {
			_.each(data_year, (data_month, month) => {
				_.each(data_month, (data_institution, institution) => {
					_.each(data_institution, (amount, type) => {
						data.push({year: year, month: month, institution: institution, type: type, amount: amount});
					});
				})
			});
		});

		return data;
	}; 

	$scope.saveChanges = () => {
		DataSvc.saveFinances($scope.formatDataToSave()).then(() => {
			toastr.success('Data updated successfully');
		}).catch((error) => {
			toastr.error(error.message || 'An error occurred. Please try again later.');
		});
	};

	$scope.loaded = false;
	AuthSvc.waitForAuth().then((isAuthenticated) => {
		if (isAuthenticated) $scope.init();
	});
});
