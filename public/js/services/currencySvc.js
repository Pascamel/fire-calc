'use strict';

angular.module('fireapp').service('CurrencySvc', function ($q) {
	var self = this;

	this.roundFloat = (num) => {
		return Math.round((num + 0.00001) * 100) / 100;
	};

	return self;
});
