'use strict';

/**
 * @ngdoc function
 * @name functionalDependencyApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the functionalDependencyApp
 */
angular.module('functionalDependencyApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
