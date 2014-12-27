'use strict';

/**
 * @ngdoc directive
 * @name functionalDependencyApp.directive:FDef
 * @description
 * # FDef
 */
angular.module('functionalDependencyApp')
  .directive('FDef', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the FDef directive');
      }
    };
  });
