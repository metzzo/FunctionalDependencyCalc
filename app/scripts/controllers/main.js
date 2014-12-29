'use strict';

/**
 * @ngdoc function
 * @name functionalDependencyApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the functionalDependencyApp
 */
angular.module('functionalDependencyApp')
  .controller('MainCtrl', function ($scope, algorithm) {
    var algo = algorithm;
    
    $scope.scheme = [
      {
        attribute: 'A',
        editing: false,
        type: 'scheme'
      },
      {
        attribute: 'B',
        editing: false,
        type: 'scheme'
      },
      {
        attribute: 'C',
        editing: false,
        type: 'scheme'
      }
    ];
    
    $scope.fdep = [ ];
    
    $scope.relation = new algo.Relation(new algo.Scheme(), []);
    
    var arrayFromScheme = function(scheme) {
      if (!scheme) return [];
      
      var schemeArray = [];
      for (var i = 0; i < scheme.length; i++) {
        var attr = scheme[i].attribute;
        if (attr && attr.length > 0) {
          schemeArray.push(attr);
        }
      }
      return schemeArray;
    };
    
    $scope.$on('request-dataupdate', function(event, msg) {
      var scheme = new algo.Scheme(arrayFromScheme($scope.scheme));
      
      var deps = [];
      for (var i = 0; i < $scope.fdep.length; i++) {
        var from = arrayFromScheme($scope.fdep[i].from);
        var to   = arrayFromScheme($scope.fdep[i].to);
        if (from.length > 0 && to.length > 0) {
          deps.push(new algo.FDep(from, to));
        }
      }
      
      $scope.relation   = new algo.Relation(scheme, deps);
      $scope.keys       = $scope.relation.calculateKey();
      $scope.superKeys  = $scope.relation.calculateSuperKey();
      $scope.canonicalOverlap = $scope.relation.calculateCanonicalOverlap();
    });
    
    $scope.$on('request-scheme', function(event, msg) {
      msg.notifyScheme($scope.scheme);
    });
    
    $scope.formatScheme = function(scheme) {
      if (!scheme || !scheme.scheme) {
        return '{}';
      } else {
        return '{' + scheme.scheme.join(', ') + '}';
      }
    };
    
    $scope.$broadcast('request-dataupdate');
  });
