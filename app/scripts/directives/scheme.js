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
        'scheme': '='
      },
      link: function (scope, element, attrs) {
        $(element)
          .find('.fd-resizeable')
          .sortable({
            axis: 'xy',
            cancel: '.fd-addentry',
            items: "fd-entry"
          })
          .disableSelection()
          .find('.fd-addentry')
          .click(function() {
            scope.uneditAll();
            
            scope.scheme.push({
              text: '',
              editing: true
            });
            
            scope.$apply();
          });
          
        $(element)
          .find('fd-entry')
          .bind('click.sortable mousedown.sortable',function(ev){
            ev.target.focus();
          });
        
        scope.$on('remove-fdentry', function(event, msg) {
          var index = scope.scheme.indexOf(msg);
          if (index != -1) {
            scope.scheme.splice(index, 1);
            scope.$apply();
          }
        });
        
        scope.uneditAll = function() {
          for (var i = 0; i < scope.scheme.length; i++) {
            var data = scope.scheme[i];
            if (data.isReady()) {
              data.editing = false;
            }
          }
          scope.$apply();
        };
        
        scope.isReady = function() {
          var ready = true;
          for (var i = 0; i < scope.scheme.length && ready; i++) {
            if (!scope.scheme[i].isReady()) {
              ready = false;
            }
          }
          return ready;
        }
      }
    };
  })
  .directive('fdEntry', function($rootScope) {
    return {
      restrict: 'E',
      templateUrl: 'templates/fd-entry.html',
      scope: {
        data: '=data'
      },
      link: function (scope, element, attrs) {
        $(element)
          .addClass('fd-entry')
        
        $(element)
          .find('.fdentry-text')
          .click(function() {
            scope.data.editing = true;
            scope.$apply();
          });
        
        $(element)
          .find('.fdentry-remove')
          .click(function() {
            $rootScope.$broadcast('remove-fdentry', scope.data);
          });
        
        $(element)
          .find('input')
          .click(function() {
            $(this).trigger({
              type: 'mousedown',
              which: 3
            });
            scope.data.editing = true;
            scope.$apply();
          }).on('mousedown', function(e) {
            if(e.which === 3){
              $(this).focus();   
            }
          })
          .keypress(function(e) {
            if (e.which === 13 && scope.data.isReady()) {
              scope.data.editing = false;
              scope.$apply();
              return false;
            }
          });
        
        if (!scope.data.isReady) {
          scope.data.isReady = function() {
            return scope.data.text.length > 0;
          };
        }
        
        if (scope.data.editing) {
          $(element)
            .find('input')
            .trigger({
              type: 'mousedown',
              which: 3
            });
        }
      }
    };
  });
