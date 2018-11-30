'use strict';

angular.module('fireapp').controller('headersCtrl', function($scope, AuthSvc, DataSvc, toastr) {
  $scope.init = () => {
    $scope.currentYear = new Date().getFullYear();
    $scope.newHeaderLabel = '';
    $scope.newHeaderSublabel = '';
    $scope.newHeaderIcon = '';
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
      icon: $scope.newHeaderIcon,
      sorting: $scope.headers.headers.length,
      interest: false
    };
    $scope.headers.headers.push(h);
    $scope.newHeaderLabel = '';
    $scope.newHeaderSublabel = '';
    $scope.newHeaderIcon = '';
  };

  $scope.editHeader = (header) => {
    header.$edit = true;
    header.$editLabel = header.label;
    header.$editSublabel = header.sublabel;
    header.$editIcon = header.icon;
  };

  $scope.editHeaderConfirm = (header) => {
    header.label = header.$editLabel;
    header.sublabel = header.$editSublabel;
    header.icon = header.$editIcon;
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

  $scope.moveUpHeader = (index) => {
    if (index <= 0 || index >= $scope.headers.headers.length) return;

    var tmp = $scope.headers.headers[index-1];
    $scope.headers.headers[index-1] = $scope.headers.headers[index];
    $scope.headers.headers[index] = tmp;
  };

  $scope.moveDownHeader = (index) => {
    if (index < 0 || index >= $scope.headers.headers.length - 1) return;

    var tmp = $scope.headers.headers[index+1];
    $scope.headers.headers[index+1] = $scope.headers.headers[index];
    $scope.headers.headers[index] = tmp;
  };

  $scope.saveChanges = () => {
    _.each($scope.headers.headers, (header) => {
      delete header.$edit;
      delete header.$editLabel;
      delete header.$editSublabel;
      delete header.$editIcon;
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
