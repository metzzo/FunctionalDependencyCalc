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
    
    var dataFromScheme = function(scheme, type) {
      var arr = [];
      for (var i = 0; i < scheme.length; i++) {
        var attr = scheme[i];
        arr.push({
          manually: true,
          attribute: attr,
          editing: false,
          type: type
        });
      }
      return arr;
    };
    
    var dataFromDeps = function(deps) {
      var arr = [];
      for (var i = 0; i < deps.length; i++) {
        var dep = deps[i];
        var obj;
        arr.push(obj = {
          manually: true,
          from: dataFromScheme(dep.from.scheme, 'dep'),
          to: dataFromScheme(dep.to.scheme, 'dep'),
          editing: false,
          type: 'fdep'
        });
      }
      return arr;
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
      
      var newRelation = new algo.Relation(scheme, deps);
      if ($scope.relation == null || $scope.relation.name() != newRelation.name()) {
        $scope.relation = newRelation;
        $scope.keys       = $scope.relation.calculateKey();
        $scope.superKeys  = $scope.relation.calculateSuperKey();
        
        var overlap = $scope.relation.calculateCanonicalOverlap();
        $scope.canonicalOverlap = dataFromDeps(overlap);
        
        var synthetic = $scope.relation.calculateSyntheticAlgorithm();
        
        $scope.synthetic = [];
        for (var i = 0; i < synthetic.length; i++) {
          var rel = synthetic[i];
          $scope.synthetic.push({
            scheme: dataFromScheme(rel.scheme.scheme, 'scheme'),
            deps: dataFromDeps(rel.deps)
          });
        }
      }
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
