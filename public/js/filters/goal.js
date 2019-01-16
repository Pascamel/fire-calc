'use strict';

angular.module('fireapp').filter('goal', function() {
  return function(value, threshold, success, danger) {
    success = success || 'success';
    danger = danger || 'danger';
    
    return (value >= threshold) ? success : danger;
  }
});