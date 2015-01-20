'use strict';

/**
 * @ngdoc directive
 * @name functionalDependencyApp.directive:Set
 * @description
 * # Set
 */
angular.module('functionalDependencyApp')
  .directive('fdSet', function($rootScope) {
    return {
      restrict: 'E',
      templateUrl: 'templates/fd-set.html',
      scope: {
        'set': '=',
        'type': '@',
        'readonly': '=fdreadonly'
      },
      link: function (scope, element, attrs) {
        $(element)
          .find('.fd-resizeable')
          .sortable({
            axis: 'xy',
            cancel: '.fd-addentry,.form-control,input',
            items: 'fd-entry'
          })
          .disableSelection()
          .find('.fd-addentry')
          .click(function() {
            if (!scope.readonly) {
              scope.set.push({
                attribute: '',
                editing: true,
                type: scope.type
              });
              
              scope.$apply();
            }
          });
        
        scope.$on('remove-fdentry', function(event, msg) {
          if (scope && scope.set) {
            var index = scope.set.indexOf(msg);
            if (index != -1) {
              scope.set.splice(index, 1);
              $rootScope.$broadcast('request-dataupdate');
            }
          }
        });
        
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
        data: '=data',
        readonly: '=fdreadonly'
      },
      link: function (scope, element, attrs) {
        $(element)
          .addClass('fd-entry');
        
        scope.removeMyself = function() {
          $rootScope.$broadcast('remove-fdentry', scope.data);
        };
        
        if (scope.data.type === 'scheme') {
          $(element)
            .find('input')
            .keypress(function(e) {
              if (e.which === 13 && scope.data.isReady()) {
                scope.data.setEditing(false);
                scope.$apply();
                return false;
              }
            });
        } else if (scope.data.type === 'fdep') {
          scope.data.from = scope.data.from ? scope.data.from : [ ];
          scope.data.to   = scope.data.to ? scope.data.to : [ ];
          
          $(element)
            .find('.fdep-to')
            .append('<fd-set set="data.from" type="dep" fdreadonly="readonly"></fd-set>');
          $(element)
            .find('.fdep-from')
            .append('<fd-set set="data.to" type="dep" fdreadonly="readonly"></fd-set>');
            
            $compile(element.contents())(scope);
        } else if (scope.data.type === 'dep') {
          scope.notifyScheme = function(scheme) {
            scope.data.scheme = scheme;
            scope.data.attribute = (scope.selected = (scheme.length > 0 ? scheme[0] : { attribute: '' })).attribute;
            
          };
          scope.selected = null;
          
          $rootScope.$broadcast('request-scheme', scope);
          
          $(element)
            .find('.form-control')
            .focus(function() {
              $(this).prop('selectedIndex', -1);
              $(this).blur();
            })
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
            } else if (scope.data.type === 'fdep') {
              var ready = null;
              for (var i = 0; i < scope.data.from.length; i++) {
                if (ready === null || ready) {
                  ready = scope.data.from[i].attribute.length > 0;
                }
              }
              
              ready = scope.data.to.length > 0 ? ready : false;
              
              for (var i = 0; i < scope.data.to.length; i++) {
                if (ready) {
                  ready = scope.data.to[i].attribute.length > 0;
                }
              }
              
              return ready === true;
            } else {
              return true;
            }
          };
        }
        
        if (!scope.data.setEditing) {
          scope.data.setEditing = function(val) {
            if (scope.readonly) {
              scope.data.editing = false;
              return;
            }
            
            if (scope.data.editing && !val) {
              $rootScope.$broadcast('request-dataupdate');
            }
            
            if (scope.data.type === 'fdep') {
              if (val) {
                $(element)
                  .find('.modal')
                  .modal('show')
                  .on('hidden.bs.modal', function() {
                    scope.data.setEditing(false);
                    scope.$apply();
                  });
              } else {
                $(element)
                  .find('.modal')
                  .modal('hide');

              }
            }
            
            scope.data.editing = val;
          };
          
          scope.data.setEditing(scope.data.editing);
        }
        
        $rootScope.$broadcast('request-dataupdate');
      }
    };
  });
