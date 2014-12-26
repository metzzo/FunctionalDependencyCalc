'use strict';

angular.module('FDAlgorithm', [])
.factory('algorithm', function() {
  var module = { };
  
  module.Scheme = function(scheme) {
    var set;
    if (scheme instanceof Array) {
      this.scheme = scheme;
      set = this.asSet();
    } else {
      set = scheme;
    }
    
    this.scheme = [];
    for (var key in set) {
      this.scheme.push(key);
    }
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
    if (scheme && scheme.scheme && scheme.scheme.length === this.scheme.length) {
      var set = scheme.asSet();
      for (var i = 0; i < this.scheme.length; i++) {
        if (!set[this.scheme[i]]) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }
  module.Scheme.prototype.isEmpty = function() {
    return this.scheme.length == 0;
  };
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
  module.Scheme.prototype.union = function(scheme) {
    var set = this.asSet();
    var set2 = scheme.asSet();
    for (var key in set2) {
      set[key] = true;
    }
    
    return new module.Scheme(set);
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
  module.Scheme.prototype.name = function() {
    return this.scheme.sort().join('');
  };
  
  module.FDep = function(from, to) {
    this.from = new module.Scheme(from);
    this.to   = new module.Scheme(to);
  };
  module.FDep.prototype.name = function() {
    return this.from.name() + ' → ' + this.to.name();
  };
  // removes the FDef and every FDef that is equivalent from the array and returns a new one
  module.FDep.prototype.removeMyself = function(arr) {
    var newArr = [];
    for (var i = 0; i < arr.length; i++) {
      var def = arr[i];
      if (!(def.from.equals(this.from) && def.to.equals(this.to))) {
        newArr.push(def);
      }
    }
    return newArr;
  };
  
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
  module.Relation.prototype.resolveTransFD = function(deps) {
    var newDeps = deps.slice(0);
    for (var i = 0; i < deps.length; i++) {
      for (var j = 0; j < deps.length; j++) {
        if (i != j && deps[j].from.equals(deps[i].to)) {
          newDeps.push(new module.FDep(deps[i].from.scheme, deps[j].to.scheme));
        }
      }
    }
    return newDeps;
  };
  
  // removes trivial FDs
  module.Relation.prototype.removeTrivialFD = function(deps) {
    for (var i = 0; i < deps.length; i++) {
      deps[i].to = deps[i].to.minus(deps[i].from);
      if (deps[i].to.isEmpty()) {
        deps.splice(i, 1);
        i--;
      }
    }
    return deps;
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
  
  module.Relation.prototype.calculateKey = function() {
    var deps = this.resolveTransFD(this.deps);
    
    var resolve = function(scheme, deps) {
      var results = [];
      for (var i = 0; i < deps.length; i++) {
        var dep = deps[i];
        
        if (scheme.contains(dep.from)) {
          var newScheme = scheme.minus(dep.to.minus(dep.from));
          var newDeps = deps.slice(0);
          newDeps.splice(i, 1); // delete current
          
          results = results.concat(resolve(newScheme, newDeps));
        } 
      }
      
      if (results.length === 0) {
        return [ scheme ];
      } else {
        return results;
      }
    };
    var result = resolve(this.scheme, deps);
    
    this.removeSuperKeys(result);
    
    return result;
  };
  
  module.Relation.prototype.calculateSuperKey = function() {
    var result = this.calculateKey();
    
    // add missing superkeys
    var addSuper = function(scheme) {
      if (scheme.isEmpty()) return;
      
      // does this scheme already exist?
      for(var i = 0; i < result.length; i++) {
        if (result[i].equals(scheme)) return;
      }
      
      result.push(scheme);
      for (var i = 0; i < scheme.scheme.length; i++) {
        var attr = new module.Scheme([ scheme.scheme[i] ]);
        for (var j = 0; j < result.length; j++) {
          var newScheme = result[j].union(attr);
          addSuper(newScheme);
        }
      }
    };
    addSuper(this.scheme);
    
    return result;
  };
  
  module.Relation.prototype.isSuperKey = function(key) {
    var keyScheme = new module.Scheme(key);
    var hull = this.calculateAttrHull(keyScheme);
    return this.scheme.equals(hull);
  };
  
  module.Relation.prototype.calculateAttrHull = function(attr, deps) {
    if (!deps) deps = this.deps;
    
    var hull = attr;
    var original;
    do {
      original = hull;
      for (var i = 0; i < deps.length; i++) {
        var dep = deps[i];
        if (hull.contains(dep.from) && !hull.contains(dep.to)) {
          hull = hull.union(dep.to);
        }
      }
    } while (!hull.equals(original));
    
    return hull;
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
  
  module.Relation.prototype.fdDecomposition = function(deps) {
    var newDeps = [];
    for (var i = 0; i < deps.length; i++) {
      var dep = deps[i];
      for (var j = 0; j < dep.to.scheme.length; j++) {
        var attr = dep.to.scheme[j];
        newDeps.push(new module.FDep(dep.from.scheme, [ attr ]));
      }
    }
    return newDeps;
  };
  
  module.Relation.prototype.fdUnite = function(deps) {
    var newDeps = [];
    
    for (var i = 0; i < deps.length; i++) {
      var dep = deps[i];
      for (var j = 0; j < deps.length; j++) {
        if (i != j && dep.from.equals(deps[j].from)) {
          dep.to = dep.to.union(deps[j].to);
          deps.splice(j, 1);
          j--;
        }
      }
      newDeps.push(dep);
    }
    
    return newDeps;
  };
  
  module.Relation.prototype.canonicalOverlap = function() {
    var deps = this.deps;
    
    deps = this.removeTrivialFD(deps);
    deps = this.fdDecomposition(deps);
    
    // left reduction
    for (var i = 0; i < deps.length; i++) {
      var dep = deps[i];
      if (dep.from.scheme.length > 1) { // only deps with 2 or more attribues can be removed by left reduction
        for (var j = 0; j < dep.from.scheme.length; j++) {
          var currentScheme = new module.Scheme([ dep.from.scheme[j] ]);
          var hull = this.calculateAttrHull(dep.from.minus(currentScheme), deps);
          if (hull.contains(dep.to)) {
            dep.from = dep.from.minus(currentScheme);
          }
        }
      }
    }
    
    // right reduction
    var newDeps = [];
    for (var i = 0; i < deps.length; i++) {
      var dep = deps[i];
      var tmpDeps = dep.removeMyself(deps);
      
      var hull = this.calculateAttrHull(dep.from, tmpDeps);
      if (!hull.contains(dep.to)) {
        newDeps.push(dep);
      }
    }
    deps = newDeps;
    
    deps = this.fdUnite(deps);
    
    return deps;
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
