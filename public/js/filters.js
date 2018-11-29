angular.module('fireapp').filter('amount', function($filter, CurrencySvc) {
  return function(number, display_if_zero) {
    if (number === 0 && !display_if_zero) return '';
    //if (CurrencySvc.roundFloat(number % 1000) == 0 && number > 0) return $filter('number')(number/1000) + 'k';
    return $filter('number')(number, 2);
  }
});
