'use strict';

angular.module('fireapp').service('modalSvc', function ($uibModal) {
  let modalDefaults = {
    backdrop: true,
    keyboard: true,
    modalFade: true,
    templateUrl: '/partials/modal.html'
  };

  let modalOptions = {
    closeButtonText: 'Close',
    actionButtonText: 'OK',
    headerText: 'Proceed?',
    bodyText: 'Perform this action?'
  };

  this.showModal = (customModalDefaults, customModalOptions) => {
    if (!customModalDefaults) customModalDefaults = {};
    customModalDefaults.backdrop = 'static';
    return this.show(customModalDefaults, customModalOptions);
  };

  this.show = (customModalOptions, customModalDefaults) => {
    let tempModalDefaults = {};
    let tempModalOptions = {};

    angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);
    angular.extend(tempModalOptions, modalOptions, customModalOptions);

    if (!tempModalDefaults.controller) {
      tempModalDefaults.controller = ($scope, $uibModalInstance) => {
        $scope.modalOptions = tempModalOptions;
        $scope.modalOptions.ok = (result) => {
          $uibModalInstance.close(result);
        };
        $scope.modalOptions.close = (result) => {
          $uibModalInstance.dismiss('cancel');
        };
      }
    }

    return $uibModal.open(tempModalDefaults).result;
  };
});