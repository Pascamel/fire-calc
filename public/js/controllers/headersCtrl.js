'use strict';

angular.module('fireapp').controller('headersCtrl', function($scope, AuthSvc, DataSvc, modalSvc, toastr) {
  $scope.init = () => {
    $scope.dataUpdated = false;
    $scope.currentYear = new Date().getFullYear();
    $scope.newHeaderLabel = '';
    $scope.newHeaderSublabel = '';
    $scope.newHeaderIcon = '';
    $scope.newIncomeLabel = '';
    $scope.newIncomePretax = false;
    $scope.newIncomeCount = 1;
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

  var defaultHeader = (t) => {
    if (t == 'headers') return {
      id: DataSvc.newUUID(),
      label: $scope.newHeaderLabel,
      sublabel: $scope.newHeaderSublabel,
      icon: $scope.newHeaderIcon,
      sorting: $scope.headers.headers.length,
      interest: false
    };
    if (t == 'incomes') return {
      id: DataSvc.newUUID(),
      label: $scope.newIncomeLabel,
      pretax: $scope.newIncomePretax,
      count: $scope.newIncomeCount,
      sorting: $scope.headers.headers.length,
    }
    return {};
  };

  $scope.addHeader = (t) => {
    $scope.headers.headers.push(defaultHeader(t));
    if (t === 'headers') {
      $scope.newHeaderLabel = '';
      $scope.newHeaderSublabel = '';
      $scope.newHeaderIcon = '';
    } 
    if (t === 'incomes') {
      $scope.newIncomeLabel = '';
      $scope.newIncomePretax = false;
      $scope.newIncomeCount = 1;
    }
  };

  $scope.editHeader = (t, header) => {
    if (t === 'headers') {
      header.$edit = true;
      header.$editLabel = header.label;
      header.$editSublabel = header.sublabel;
      header.$editIcon = header.icon;
    }
    if (t === 'incomes') {
      header.$edit = true;
      header.$editLabel = header.label;
      header.$editPretax = header.pretax;
      header.$editCount = header.count;
    }
  };

  $scope.editHeaderConfirm = (t, header) => {
    if (t === 'headers') {
      header.label = header.$editLabel;
      header.sublabel = header.$editSublabel;
      header.icon = header.$editIcon;
      header.$edit = false;
      $scope.dataUpdated = true;
    }
    if (t === 'incomes') {
      header.label = header.$editLabel;
      header.pretax = header.$editPretax;
      header.count = header.$editCount;
      header.$edit = false;
      $scope.dataUpdated = true;
    }
  }

  $scope.editHeaderCancel = (t, header) => {
    if (t === 'headers' || t === 'incomes') {
      header.$edit = false;
    }
  };

  $scope.removeHeader = (t, header) => {
    modalSvc.showModal({
      closeButtonText: 'Cancel',
      actionButtonText: 'Delete',
      headerText: 'Delete',
      bodyText: 'Are you sure you want to delete this header?'
    }).then((result) => {
      _.remove($scope.headers[t], (h) => h.id === header.id);
      $scope.dataUpdated = true;
    });
  };

  $scope.moveUpHeader = (t, index) => {
    if (index <= 0 || index >= $scope.headers[t].length) return;

    var tmp = $scope.headers[t][index-1];
    $scope.headers[t][index-1] = $scope.headers[t][index];
    $scope.headers[t][index] = tmp;
    $scope.dataUpdated = true;
  };

  $scope.moveDownHeader = (t, index) => {
    if (index < 0 || index >= $scope.headers[t].length - 1) return;

    var tmp = $scope.headers[t][index+1];
    $scope.headers[t][index+1] = $scope.headers[t][index];
    $scope.headers[t][index] = tmp;
    $scope.dataUpdated = true;
  };

  $scope.saveChanges = () => {
    _.each($scope.headers.headers, (header) => {
      delete header.$edit;
      delete header.$editLabel;
      delete header.$editSublabel;
      delete header.$editIcon;
    });
    _.each($scope.headers.incomes, (header) => {
      delete header.$edit;
      delete header.$editLabel;
      delete header.$editPretax;
      delete header.$editCount;
    });

    $scope.headers.startingCapital = parseFloat($scope.headers.startingCapital) || 0;

    DataSvc.saveHeaders($scope.headers).then(() => {
      toastr.success('Headers updated successfully');
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
