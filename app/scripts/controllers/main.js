'use strict';

/**
 * @ngdoc function
 * @name functionalDependencyApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the functionalDependencyApp
 */
angular.module('functionalDependencyApp')
  .factory('calculator', ['$q', function($q) {
    var worker = new Worker('scripts/domain/algoWorker.js');
    var defer;

    worker.addEventListener('message', function(e) {
      defer.resolve(e.data);
    }, false);

    return {
        calculate : function(relation){
          defer = $q.defer();
          worker.postMessage(relation); // Send data to our worker.
          return defer.promise;
        }
    };
  }])
  .controller('MainCtrl', function ($scope, algorithm, calculator) {
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
      
      var newRelation = new algo.Relation(scheme, deps);
      if ($scope.relation == null || $scope.relation.name() !== newRelation.name()) {
        $scope.relation = newRelation;
        
        calculator
          .calculate(newRelation)
          .then(function(data) {
            $scope.rawKeys = algo.toScheme(data.rawKeys);
            $scope.keys = data.keys;
            
            $scope.rawSuperKeys = algo.toScheme(data.rawSuperKeys);
            $scope.superKeys = data.superKeys
            
            $scope.rawCanonicalOverlap = algo.toFDep(data.rawCanonicalOverlap);
            $scope.canonicalOverlap = data.canonicalOverlap;
            
            $scope.rawSynthetic = algo.toRelation(data.rawSynthetic);
            $scope.synthetic = data.synthetic;
          });
        
        console.log("NEW CALCULATION " + $scope.relation.name() + ' ' + newRelation.name());
      }
    });
    
    $scope.$on('request-scheme', function(event, msg) {
      msg.notifyScheme($scope.scheme);
    });
    
    $scope.formatScheme = function(scheme) {
      if (!scheme) {
        return '{}';
      } else {
        return '{' + scheme.scheme.join(', ') + '}';
      }
    };
    
    $scope.formatDeps = function(dep) {
      if (!dep) {
        return '{}';
      } else {
        var deps = [];
        for (var i = 0; i < dep.length; i++) {
          deps.push(dep[i].name());
        }
        return '{' + deps.join(', ') + '}';
      }
    };
    
    $scope.$broadcast('request-dataupdate');
  });
