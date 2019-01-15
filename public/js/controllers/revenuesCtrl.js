'use strict';

angular.module('fireapp').controller('revenuesCtrl', function($scope, $q, AuthSvc, DataSvc, toastr) {
  $scope.income = [];

  $scope.init = () => {
    $scope.dataUpdated = false;
    $scope.loaded = false;
    $q.all([DataSvc.loadHeaders(), DataSvc.loadSavings(), DataSvc.loadIncome()]).then((data) => {
      $scope.formatHeaders(data[0]);
      $scope.formatSavingsAndIncome(data[1].data, data[2].data);
      $scope.formatYearHeaders(data[2].yearly_data);
      $scope.loaded = true;
    }).catch((error) => {
      toastr.error(error.message || 'An error occurred. Please try again later.');
    });
  };

  $scope.formatHeaders = (data) => {
    angular.extend($scope, data);
    $scope.headersLine = _.map($scope.incomes, (h, idx) => {
      h.last = (idx === $scope.incomes.length - 1);
      return h;
    });
  };

  let formatYear = (months, value) => {
    return _(months).reduce((acc, m) => {
      acc[m] = angular.copy(value);
      return acc;
    }, {});
  };

  $scope.formatSavingsAndIncome = (savings_data, income_data) => {
    $scope.income = {};
    let years = _.range($scope.firstYear, new Date().getFullYear() + 1);

    _(years).each((y, idx) => {
      let months = [];
      if (idx === 0 && years.length === 1) {
        $scope.income[y] = formatYear(_.range($scope.firstMonth, new Date().getMonth() + 2), {});
      } else if (idx === 0) {
        $scope.income[y] = formatYear(_.range($scope.firstMonth, 13), {});
      } else {
        $scope.income[y] = formatYear(_.range(1, 13), {});
      }
    });

    _(savings_data).each((d) => {
      let current_value = _.get($scope.income, [d.year, d.month, 'savings'], 0);
      _.set($scope.income, [d.year, d.month, 'savings'], current_value + d.amount);
    });

    _(income_data).each((d) => {
      _.set($scope.income, [d.year, d.month, 'income', d.type], d.amount);
    });
  };

  $scope.formatYearHeaders = (d) => {
    $scope.year_headers = d || {collapsed: {}};
  };

  $scope.totalMonthPreOrPost = (year, month, isPre) => {
    return _.reduce($scope.income[year][month].income, (sum, amount, type) => {
      var header = _.keyBy($scope.headersLine, 'id')[type];
      if (!header || header.pretax !== isPre) return sum;
      return sum + amount / header.count;
    }, 0);
  };

  $scope.totalMonthPre = (year, month) => {
    return $scope.totalMonthPreOrPost(year, month, true);
  };

  $scope.totalMonthPost = (year, month) => {
    return $scope.totalMonthPreOrPost(year, month, false);
  };

  $scope.totalMonth = (year, month) => {
    return $scope.totalMonthPre(year, month) + $scope.totalMonthPost(year, month);
  };

  $scope.savingRateMonth = (year, month) => {
    let i = _.reduce($scope.income[year][month].income, (sum, amount, type) => {
      var header = _.keyBy($scope.headersLine, 'id')[type];
      return sum + amount / header.count;
    }, 0);

    return $scope.income[year][month].savings / i;
  };

  $scope.yearlySavings = (year) => {
    return _.reduce($scope.income[year], (sum, month) => {
      return sum + _.get(month, 'savings', 0);
    }, 0);
  };

  $scope.yearlyIncome = (year, header) => {
    return _.reduce($scope.income[year], (sum, month) => {
      return sum + _.get(month, ['income', header.id], 0);
    }, 0);
  };

  $scope.totalYearPreOrPost = (year, isPre) => {
    return _.reduce($scope.income[year], (sum, month) => {
      return sum + _.reduce(_.get(month, 'income', {}), (sum, amount, type) => {
        var header = _.keyBy($scope.headersLine, 'id')[type];
        if (!header || header.pretax !== isPre) return sum;
        return sum + amount / header.count;
      }, 0);
    }, 0);
  };

  $scope.totalYearPre = (year) => {
    return $scope.totalYearPreOrPost(year, true);
  };

  $scope.totalYearPost = (year) => {
    return $scope.totalYearPreOrPost(year, false);
  };

  $scope.yearlyTotal = (year) => {
    return $scope.totalYearPre(year) + $scope.totalYearPost(year);
  };

  $scope.savingRateYear = (year) => {
    let i = _.reduce($scope.income[year], (sum, month) => {
      return sum + _.reduce(_.get(month, 'income', {}), (sum, amount, type) => {
        var header = _.keyBy($scope.headersLine, 'id')[type];
        return sum + amount / header.count;
      }, 0);
    }, 0);
    let s = _.reduce($scope.income[year], (sum, month) => {
      return sum + _.get(month, 'savings', 0);
    }, 0);

    return s / i;
  };

  $scope.$on('revenues:updated', (event, data) => {
    $scope.dataUpdated = true;
  });

  $scope.formatDataToSave = () => {
    let data = [];

    _.each($scope.income, (data_year, year) => {
      _.each(data_year, (data_month, month) => {
        _.each(data_month.income, (amount, institution) => {
          data.push({year: parseInt(year), month: parseInt(month), type: institution, amount: amount});
        })
      });
    });

    return data;
  };

  $scope.formatYearHeadersToSave = () => {
    return $scope.year_headers;
  };

  $scope.saveChanges = () => {
    DataSvc.saveIncome($scope.formatDataToSave(), $scope.formatYearHeadersToSave()).then(() => {
      toastr.success('Data updated successfully');
      $scope.dataUpdated = false;
    }).catch((error) => {
      toastr.error(error.message || 'An error occurred. Please try again later.');
    });
  };

  AuthSvc.waitForAuth().then((isAuthenticated) => {
    if (isAuthenticated) $scope.init();
  });
});
