'use strict';

/**
 * @ngdoc function
 * @name functionalDependencyApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the functionalDependencyApp
 */
angular.module('functionalDependencyApp')
  .controller('MainCtrl', function ($scope) {
    $scope.scheme = [
      {
        text: 'A',
        editing: false
      },
      {
        text: 'B',
        editing: false
      },
      {
        text: 'C',
        editing: false
      }
    ];
  });
