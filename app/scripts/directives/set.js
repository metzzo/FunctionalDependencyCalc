'use strict';

/**
 * @ngdoc directive
 * @name functionalDependencyApp.directive:Set
 * @description
 * # Set
 */
angular.module('functionalDependencyApp')
  .directive('fdSet', function () {
    return {
      restrict: 'E',
      templateUrl: 'templates/fd-set.html',
      scope: {
        'set': '=',
        'type': '@'
      },
      link: function (scope, element, attrs) {
        $(element)
          .find('.fd-resizeable')
          .sortable({
            axis: 'xy',
            cancel: '.fd-addentry,.form-control,input',
            items: "fd-entry"
          })
          .disableSelection()
          .find('.fd-addentry')
          .click(function() {
            scope.uneditAll();
            
            scope.set.push({
              attribute: '',
              editing: true,
              type: scope.type
            });
            
            scope.$apply();
          });
        
        if (scope.type === 'dep') {
          $(element)
              .find('.fd-addentry button')
              .addClass('btn-xs');
        }
        
        scope.$on('unedit-all', function() {
          scope.uneditAll();
        });
        
        scope.$on('remove-fdentry', function(event, msg) {
          var index = scope.set.indexOf(msg);
          if (index != -1) {
            scope.set.splice(index, 1);
            scope.$apply();
          }
        });
        
        scope.uneditAll = function() {
          for (var i = 0; i < scope.set.length; i++) {
            var data = scope.set[i];
            if (data.isReady()) {
              data.setEditing(false);
            }
          }
          scope.$apply();
        };
        
        scope.isReady = function() {
          var ready = true;
          for (var i = 0; i < scope.set.length && ready; i++) {
            if (!scope.set[i].isReady()) {
              ready = false;
            }
          }
          return ready;
        }
      }
    };
  })
  .directive('fdEntry', function($rootScope, $compile) {
    return {
      restrict: 'E',
      templateUrl: 'templates/fd-entry.html',
      scope: {
        data: '=data'
      },
      link: function (scope, element, attrs) {
        $(element)
          .addClass('fd-entry');
          
        $(element)
          .find('.fdentry-text')
          .click(function() {
            $rootScope.$broadcast('unedit-all');
            
            scope.data.setEditing(true);
            scope.$apply();
          });
        
        $(element)
          .find('.fdentry-remove')
          .click(function() {
            $rootScope.$broadcast('remove-fdentry', scope.data);
          });
        
        if (scope.data.type === 'scheme') {
          $(element)
            .find('input')
            .click(function(e) {
              $rootScope.$broadcast('unedit-all');
              e.preventDefault();
              
              scope.data.setEditing(true);
              $(this).focus();
              
              scope.$apply();
              
              return false;
            })
            .keypress(function(e) {
              if (e.which === 13 && scope.data.isReady()) {
                scope.data.setEditing(false);
                scope.$apply();
                return false;
              }
            });
        } else if (scope.data.type === 'fdep') {
          scope.data.from = [];
          scope.data.to = [];
          
          $(element)
            .find('.fdep-to')
            .append('<fd-set set="data.from" type="dep" class="fd-resizeable-small"></fd-set>');
          $(element)
            .find('.fdep-from')
            .append('<fd-set set="data.to" type="dep" class="fd-resizeable-small"></fd-set>');
            
            $compile(element.contents())(scope);
        } else if (scope.data.type === 'dep') {
          scope.notifyScheme = function(scheme) {
            scope.data.scheme = scheme;
            scope.selected = scheme.length > 0 ? scheme[0] : null;
          };
          scope.selected = null;
          
          $rootScope.$broadcast('request-scheme', scope);
          
          $(element)
            .find('.form-control')
            .change(function() {
              scope.data.setEditing(false);
              scope.data.attribute = scope.selected.attribute;
              scope.$apply();
            });
        }
        
        if (!scope.data.isReady) {
          scope.data.isReady = function() {
            if (scope.data.type === 'scheme') {
              return scope.data.attribute.length > 0;
            } else {
              return true;
            }
          };
        }
        
        if (!scope.data.setEditing) {
          scope.data.setEditing = function(val) {
            if (scope.data.editing !== val) {
              if (scope.data.editing && !val) {
                $rootScope.$broadcast('request-dataupdate');
              }
              scope.data.editing = val;
            }
          };
        }
        
        $rootScope.$broadcast('request-dataupdate');
      }
    };
  });
