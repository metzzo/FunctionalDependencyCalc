// Angular needs a global window object
var window = self;

// Skeleton properties to get Angular to load and bootstrap.
self.history = {};
var document = {
  readyState: 'complete',
  querySelector: function() {},
  createElement: function() {
    return {
      pathname: '',
      setAttribute: function() {}
    }
  }
};

// Load Angular: must be on same domain as this script
importScripts('../../bower_components/angular/angular.js', 'algorithm.js');

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

angular.module('worker', ['FDAlgorithm']).run(function($window, algorithm) {
  $window.onmessage = function(e) {
    var result = {
      rawKeys: null,
      keys: null,
      superKeys: null,
      rawCanonicalOverlap: null,
      canonicalOverlap: null,
      rawSynthetic: null,
      synthetic: null
    };
    var newRelation = algorithm.toRelation(e.data);
    
    
    var keys = newRelation.calculateKey();
    result.rawKeys = keys;
    result.keys = [];
    for (var i = 0; i < keys.length; i++) {
      result.keys.push(dataFromScheme(keys[i].scheme, 'scheme'));
    }
    
    var superKeys = newRelation.calculateSuperKey();
    result.rawSuperKeys = superKeys;
    result.superKeys  = [];
    for (var i = 0; i < superKeys.length; i++) {
      result.superKeys.push(dataFromScheme(superKeys[i].scheme, 'scheme'));
    }
    
    var overlap = newRelation.calculateCanonicalOverlap();
    result.rawCanonicalOverlap = overlap;
    result.canonicalOverlap = dataFromDeps(overlap);
    
    var synthetic = newRelation.calculateSyntheticAlgorithm();
    result.rawSynthetic = synthetic;
    result.synthetic = [];
    for (var i = 0; i < synthetic.length; i++) {
      var rel = synthetic[i];
      result.synthetic.push({
        scheme: dataFromScheme(rel.scheme.scheme, 'scheme'),
        deps: dataFromDeps(rel.deps)
      });
    }
    
    $window.postMessage(result);
  };
});

angular.bootstrap(null, ['worker']); // quite hacky
