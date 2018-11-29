'use strict';

angular.module('fireapp').controller('savingsCtrl', function($scope, $q, AuthSvc, DataSvc, CurrencySvc, toastr) {
	$scope.addProperty = () => {
		$scope.data[$scope.newPropertyName] = 0
	};

	$scope.init = () => {
		$scope.dataUpdated = false;
		$scope.headers = {};
		$scope.data = [];
		$q.all([DataSvc.loadHeaders(), DataSvc.loadFinances()]).then((data) => {
			$scope.formatHeaders(data[0]);
			$scope.formatData(data[1].data);
			$scope.formatYearHeaders(data[1].goals);
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
				var o = [];
				if (header.principal) o.push(header.sublabel || 'Principal');
				if (header.interest) o.push('Interest');
				if (header.total) o.push('Total');
				return o;
			})
			.flatMap()
			.value();
		$scope.inputLine = _($scope.headers)
			.map((header) => {
				var o = [];
				if (header.principal) o.push({id: header.id, type: 'P'});
				if (header.interest) o.push({id: header.id, type: 'I'});
				if (header.total) o.push({id: header.id, type: 'T'});
				_.each(o, (item) => { item.types = _.map(o, 'type')});
				return o;
			})
			.flatMap()
			.value();
	};

	$scope.formatData = (data) => {
		$scope.savings = {};
		let years = _.range($scope.firstYear, new Date().getFullYear() + 1);

		_(years).each((y, idx) => {
			let months = [];
			if (idx === 0 && years.length === 1) {
				$scope.savings[y] = formatYear(_.range($scope.firstMonth, new Date().getMonth() + 2));
			} else if (idx === 0) {
				$scope.savings[y] = formatYear(_.range($scope.firstMonth, 13));
			} else {
				$scope.savings[y] = formatYear(_.range(1, 13));
			}
		});

		_(data).each((d) => {
			_.set($scope.savings, [d.year, d.month, d.institution, d.type], d.amount);
		});
	}; 

	$scope.formatYearHeaders = (d) => {
		$scope.year_headers = d;
	};

	$scope.startOfYearAmount = (year) => {
		var keys = _.keys($scope.savings), idx = keys.indexOf(year);

		if (idx <= 0) return $scope.startingCapital;
		
		return $scope.totalHolding('12', keys[idx - 1]);
	};

	$scope.totalMonth = (month, year, type) => {
		var m = _.get($scope,['savings', year, month]);
		if (!m || !Object.keys(m).length) return 0;

		if (type === 'T') return _.reduce(['P', 'I'], (v, i) => v + $scope.totalMonth(month, year, i), 0);
		return _.reduce(m, (v, i) => v + _.get(i, [type], 0), 0);
	};

	$scope.totalHolding = (month, year) => {
		var keys = _.keys($scope.savings), idxYear = keys.indexOf(year);
		if (idxYear < 0) return 0;

		var yearData = $scope.savings[year], idxMonth = _.keys(yearData).indexOf(month);
		if (idxMonth < 0) return 0;

		return _.reduce($scope.savings, (sum, data_y, y) => {
			if (parseInt(y) > parseInt(year)) return sum;
			return sum + _.reduce(data_y, (sum, data_m, m) => {
				if (parseInt(y) == parseInt(year) && parseInt(m) > parseInt(month)) return sum;
				return sum + _.reduce(data_m, (sum, data_institution) => {
					return sum + _.reduce(data_institution, (sum, amount, type) =>{
						if (type === 'T') return sum;
						return sum + amount;
					}, 0);
				}, 0)
			}, 0);
		}, $scope.startingCapital);
	};

	$scope.monthlyGoal = (year) => {
		var idxYear = _($scope.savings).keys().indexOf(year);
		if (idxYear < 0) return 0;

		var goal_year = _.get($scope, ['year_headers', 'goals', year], 0);
		var start_of_year = (idxYear === 0) ? $scope.startingCapital : $scope.totalHolding('12', (parseInt(year) - 1).toString());
		var goal = (goal_year - start_of_year) /  _.keys($scope.savings[year]).length;

		return goal;
	}

	$scope.goalMonth = (month, year) => {
		var idxYear = _($scope.savings).keys().indexOf(year);
		if (idxYear < 0) return 0;
	
		var goal_year = _.get($scope, ['year_headers', 'goals', year], 0);
		var start_of_year = (idxYear === 0) ? $scope.startingCapital : $scope.totalHolding('12', (parseInt(year) - 1).toString());
		var goal = (goal_year - start_of_year) /  _.keys($scope.savings[year]).length;
		var achieved = $scope.totalMonth(month, year, 'T');

		return CurrencySvc.roundFloat(achieved - goal);
	};

	$scope.goalTotal = (month, year) => {
		var idxYear = _($scope.savings).keys().indexOf(year);
		if (idxYear < 0) return 0;
		var idxMonth = _($scope.savings[year]).keys().indexOf(month);
		if (idxYear < 0) return 0;

		var goal_year = _.get($scope, ['year_headers', 'goals', year], 0);
		var start_of_year = (idxYear === 0) ? $scope.startingCapital : $scope.totalHolding('12', (parseInt(year) - 1).toString());
		var goal_by_month = (goal_year - start_of_year) / _.keys($scope.savings[year]).length;
		var goal = start_of_year + goal_by_month * (idxMonth + 1);
		var achieved = $scope.totalHolding(month, year, 'T');

		return CurrencySvc.roundFloat(achieved - goal);
	};

	$scope.totalInstitution = (year, institution, type) => {
		var idxYear = _($scope.savings).keys().indexOf(year);
		if (idxYear < 0) return 0;

		if (type === 'T') return _.reduce(['P', 'I'], (v, i) => v + $scope.totalInstitution(year, institution, i), 0);
		return _.reduce($scope.savings[year], (v, i) => v + _.get(i, [institution, type], 0), 0);
	};

	$scope.grandTotalInstitution = (institution, type) => {
		return _($scope.savings).keys().reduce((acc, year) => acc + $scope.totalInstitution(year, institution, type), 0);
	};

	$scope.grandTotalHolding = () => {
		var year = _($scope.savings).keys().last();
		if (!year) return;

		var month = _($scope.savings[year]).keys().last();
		if (!month) return;

		return $scope.totalHolding(month, year);
	};

	$scope.$on('savings:updated', function(event, data) {
		$scope.dataUpdated = true;
	});

	$scope.formatDataToSave = () => {
		let data = [];

		_.each($scope.savings, (data_year, year) => {
			_.each(data_year, (data_month, month) => {
				_.each(data_month, (data_institution, institution) => {
					_.each(data_institution, (amount, type) => {
						if (type === 'T') return;
						data.push({year: parseInt(year), month: parseInt(month), institution: institution, type: type, amount: amount});
					});
				})
			});
		});

		return data;
	}; 

	$scope.formatGoalsToSave = () => {
		return $scope.year_headers;
	}; 

	$scope.saveChanges = () => {
		DataSvc.saveFinances($scope.formatDataToSave(), $scope.formatGoalsToSave()).then(() => {
			toastr.success('Data updated successfully');
			$scope.dataUpdated = false;
		}).catch((error) => {
			toastr.error(error.message || 'An error occurred. Please try again later.');
		});
	};

	$scope.loaded = false;
	AuthSvc.waitForAuth().then((isAuthenticated) => {
		if (isAuthenticated) $scope.init();
	});
});
