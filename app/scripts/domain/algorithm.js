'use strict';

angular.module('FDAlgorithm', [])
.factory('algorithm', function() {
  var module = { };
  
  module.Scheme = function(scheme) {
    this.scheme = scheme;
  };
  module.Scheme.prototype.contains = function(scheme) {
    var set = this.asSet();
    for (var i = 0; i < scheme.scheme.length; i++) {
      if (!set[scheme.scheme[i]]) {
        return false;
      }
    }
    return true;
  };
  module.Scheme.prototype.equals = function(scheme) {
    if (scheme && scheme.scheme && scheme.scheme.length == this.scheme.length) {
      for (var i = 0; i < this.scheme.length; i++) {
        if (this.scheme[i] != scheme.scheme[i]) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }
  module.Scheme.prototype.minus = function(scheme) {
    var set = scheme.asSet();
    var newScheme = [];
    for (var i = 0; i < this.scheme.length; i++) {
      if (!set[this.scheme[i]]) {
        newScheme.push(this.scheme[i]);
      }
    }
    return new module.Scheme(newScheme);
  };
  
  module.Scheme.prototype.asSet = function() {
    var set = { };
    for (var i = 0; i < this.scheme.length; i++) {
      set[this.scheme[i]] = true;
    }
    return set;
  };
  
  module.Scheme.prototype.clone = function() {
    return new module.Scheme(this.scheme.slice(0));
  };
  
  module.Scheme.prototype.remove = function(scheme) {
    for (var i = 0; i < scheme.scheme.length; i++) {
      var attr = scheme.scheme[i];
      var index = this.scheme.indexOf(attr);
      if (index != -1) {
        this.scheme.splice(index, 1);
      }
    }
  };
  module.Scheme.prototype.name = function() {
    return this.scheme.join('');
  };
  
  module.FDep = function(from, to) {
    this.from = new module.Scheme(from);
    this.to   = new module.Scheme(to);
  };
  module.FDep.prototype.name = function() {
    return this.from.name() + ' → ' + this.to.name();
  }
  
  module.Relation = function(scheme, deps) {
    this.scheme = scheme;
    this.deps   = deps;
  };
  module.Relation.prototype.name = function() {
    var name = this.scheme.name() + '(';
    var arr = [];
    for (var i = 0; i < this.deps.length; i++) {
      arr.push(this.deps[i].name());
      
    }
    return name + arr.join(', ') + ')';
  };
  
  // inserts new FDs for transitive relations
  module.Relation.prototype.resolveTransFD = function() {
    var oldLength = this.deps.length; // to avoid infinite loops
    for (var i = 0; i < oldLength; i++) {
      for (var j = 0; j < oldLength; j++) {
        if (i != j && this.deps[j].from.equals(this.deps[i].to)) {
          this.deps.push(new module.FDep(this.deps[i].from.scheme, this.deps[j].to.scheme));
        }
      }
    }
  };
  
  // removes all superkeys
  module.Relation.prototype.removeSuperKeys = function(keys) {
    var fix = function() {
        for (var i = 0; i < keys.length; i++) {
          for (var j = 0; j < keys.length; j++) {
            if (i != j && keys[j].contains(keys[i])) {
              keys.splice(j, 1);
              return true;
            }
          }
        }
        return false;
      };
      while (fix());
  };
  
  module.Relation.prototype.calculateKey = function(superKey) {
    this.resolveTransFD();
    
    var resolve = function(scheme, deps) {
      var results = [];
      for (var i = 0; i < deps.length; i++) {
        var dep = deps[i];
        
        if (scheme.contains(dep.from)) {
          var newScheme = scheme.clone();
          var newDeps = deps.slice(0);
          newDeps.splice(i, 1); // delete current
          newScheme.remove(dep.to.minus(dep.from)); // remove dep from scheme
          
          results = results.concat(resolve(newScheme, newDeps));
        } 
      }
      
      if (results.length === 0) {
        return [ scheme ];
      } else {
        return results;
      }
    };
    var result = resolve(this.scheme, this.deps);
    
    if (!superKey) {
      this.removeSuperKeys(result);
    } else {
      
    }
    
    return result;
  };
  
  // checks whether given key is really a key
  module.Relation.prototype.isKey = function(key) {
    key = 0;
  };
  
  // checks whether given key is really a superkey
  module.Relation.prototype.isSuperKey = function(key) {
    key = 0;
  };
  
  module.Relation.prototype.calculateAttrHull = function(attr) {
    attr = 0;
    return {
      result: '',
      description: []
    };
  };
  
  
  module.Relation.prototype.checkArmstrongAxioms = function(fromAttr, toAttr) {
    fromAttr = 0; toAttr = 0;
    return {
      result: '',
      description: []
    };
  };
  
  module.Relation.prototype.checkEquivalent = function(withRelation) {
    withRelation = 0;
    return {
      result: '',
      description: []
    };
  };
  
  module.Relation.prototype.canonicalOverlap = function() {
    
    return {
      result: '',
      description: []
    };
  };
  
  module.Relation.prototype.calculateAttrHull = function() {
    
    return {
      result: '',
      description: []
    };
  };
  
  module.Relation.prototype.calculateSyntheticAlgorithm = function() {
    
    return {
      result: '',
      description: []
    };
  };
  
  module.Relation.prototype.isInNF = function() {
    
    return {
      result: '',
      description: []
    };
  };
  
  module.Relation.prototype.calculateDecompositionAlgorithm = function() {
    
    return {
      result: '',
      description: []
    };
  };
  
  return module;
});
