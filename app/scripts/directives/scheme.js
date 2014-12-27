'use strict';

/**
 * @ngdoc directive
 * @name functionalDependencyApp.directive:Scheme
 * @description
 * # Scheme
 */
angular.module('functionalDependencyApp')
  .directive('fdScheme', function () {
    return {
      restrict: 'E',
      templateUrl: 'templates/scheme.html',
      scope: {
        scheme: '='
      },
      link: function (scope, element, attrs) {
        $(element)
          .find('.fd-resizeable')
          .sortable({
            axis: 'xy',
            cancel: '.fd-addentry',
            items: "li:not(:last-child)"
          })
          .disableSelection()
          .find('.fd-addentry')
          .click(function() {
            $(element)
              .find('.fd-resizeable .fd-addentry')
              .before($('<li class="fd-entry btn btn-lg btn-default">SWAG</li>'));
          });
        
        element.on('$destroy', function() {
          
        });
      }
    };
  });
