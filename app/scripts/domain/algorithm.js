'use strict';

angular.module('FDAlgorithm', [])
.factory('algorithm', function() {
  var module = { };
  
  module.toScheme = function(scheme) {
    if (!scheme) return scheme;
    
    if (scheme instanceof Array) {
      for (var i = 0; i < scheme.length; i++) {
        module.toScheme(scheme[i]);
      }
    } else {
      scheme.__proto__ = module.Scheme.prototype;
    }
    return scheme;
  };
  
  module.toRelation = function(relation) {
    if (!relation) return relation;
    
    if (relation instanceof Array) {
      for (var i = 0; i < relation.length; i++) {
        module.toRelation(relation[i]);
      }
    } else {
      relation.__proto__ = module.Relation.prototype;
      module.toScheme(relation.scheme);
      module.toFDep(relation.deps);
    }
    return relation;
  };
  
  module.toFDep = function(dep) {
    if (!dep) return dep;
    
    if (dep instanceof Array) {
      for (var i = 0; i < dep.length; i++) {
        module.toFDep(dep[i]);
      }
    } else {
      dep.__proto__ = module.FDep.prototype;
      module.toScheme(dep.from);
      module.toScheme(dep.to);
    }
    return dep;
  };
  
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
  };
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
  
  module.Scheme.prototype.findApplicableDeps = function(deps) {
    // find all deps that share the same attributes
    var tmpDeps = [];
    for (var j = 0; j < deps.length; j++) {
      var tmpDep = deps[j];
      if (this.contains(tmpDep.from.union(tmpDep.to))) {
        tmpDeps.push(tmpDep);
      }
    }
    return tmpDeps;
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
  module.FDep.prototype.clone = function() {
    return new module.FDep(this.from.clone().scheme, this.to.clone().scheme);
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
  module.Relation.prototype.clone = function() {
    return new module.Relation(this.scheme.clone(), this.cloneDeps());
  };
  module.Relation.prototype.cloneDeps = function(oldDeps) {
    if (!oldDeps) oldDeps = this.deps;
    var deps = [];
    for (var i = 0; i < oldDeps.length; i++) {
      deps.push(oldDeps[i].clone());
    }
    return deps;
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
    deps = this.cloneDeps(deps);
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
  
  module.Relation.prototype.calculateCanonicalOverlap = function() {
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
    var deps = this.calculateCanonicalOverlap();
    var keys = this.calculateKey();
    
    var relations = [];
    for (var i = 0; i < deps.length; i++) {
      var dep = deps[i];
      // create scheme
      var scheme = dep.from.union(dep.to);
      
      // find all deps that share the same attributes
      var tmpDeps = scheme.findApplicableDeps(deps);
      
      // create it bitch
      var relation = new module.Relation(scheme, tmpDeps);
      relations.push(relation);
    }
    
    var keyExists = false;
    for (var i = 0; i < relations.length && !keyExists; i++) {
      for (var j = 0; j < keys.length; j++) {
        if (relations[i].scheme.contains(keys[j])) {
          keyExists = true;
          break;
        }
      }
    }
    if (!keyExists) {
      // :( => define own scheme, in order to ensure verlustlosigkeit
      relations.push(new module.Relation(keys[0], new module.Scheme([])));
    }
    
    // eliminate redundant schemes
    var result = [];
    
    for (var i = 0; i < relations.length; i++) {
      var redundant = false;
      for (var j = 0; j < relations.length && !redundant; j++) {
        if (i != j && relations[j].scheme.contains(relations[i].scheme)) {
          redundant = true;
        }
      }
      if (!redundant) {
        result.push(relations[i]);
      }
    }
    
    return result;
  };
  
  module.Relation.prototype.isInNF = function() {
    var isInBCNF = true, isIn3NF = true;
    var deps = this.deps;
    
    deps = this.removeTrivialFD(deps);
    deps = this.fdDecomposition(deps);
    
    var keys = this.calculateKey();
    
    var breakingBCNF = [], breakingNF = [];
    for (var i = 0; i < deps.length; i++) {
      var dep = deps[i];
      
      var isInKey = false, isSuperKey = false;
      for (var j = 0; j < keys.length && (!isInKey || !isSuperKey); j++) {
        if (keys[j].contains(dep.from)) {
          isInKey = true;
        }
        if (dep.from.contains(keys[j])) {
          isSuperKey = true;
        }
      }
      
      if (isIn3NF) {
        isIn3NF = isInKey || isSuperKey;
      }
      if (isInBCNF) {
        isInBCNF = isSuperKey;
      }
      
      if (!isInKey && !isSuperKey) {
        breakingNF.push(dep);
      }
      
      if (!isSuperKey) {
        breakingBCNF.push(dep);
      }
    }
    return {
      'isInBCNF': isInBCNF,
      'isIn3NF': isIn3NF,
      'breakingBCNF': breakingBCNF,
      'breakingNF': breakingNF
    }
  };
  
  module.Relation.prototype.calculateDecompositionAlgorithm = function() {
    var normalform = this.isInNF();
    if (!normalform.isInBCNF) {
      var results = [];
      var deps = this.calculateCanonicalOverlap(); // just to be sure ;)
      
      for (var i = 0; i < normalform.breakingBCNF.length; i++) {
        var result = [];
        var dep = normalform.breakingBCNF[i];
                
        var R1Scheme = dep.from.union(dep.to);
        var R2Scheme = this.scheme.minus(dep.to);
        
        var RScheme = this.scheme.minus(R1Scheme.union(R2Scheme));
        
        var R1Deps = R1Scheme.findApplicableDeps(deps);
        var R2Deps = R2Scheme.findApplicableDeps(deps);
        var RDeps  = RScheme .findApplicableDeps(deps);
        
        var R1 = new module.Relation(R1Scheme, R1Deps);
        var R2 = new module.Relation(R2Scheme, R2Deps);
        
        result = result.concat(R1.calculateDecompositionAlgorithm());
        result = result.concat(R2.calculateDecompositionAlgorithm());
        result.push(new module.Relation(RScheme, RDeps));
        
        results.push(result);
      }
      
      return results;
    } else {
      return [ this ];
    }
  };
  
  return module;
});
