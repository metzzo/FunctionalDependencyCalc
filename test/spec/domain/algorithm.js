'use strict';

describe('Algorithm', function () {
  var schemes = [
    {
      scheme: ['B', 'D', 'E', 'F', 'H', 'J'],
      deps: [ [['B'], ['D']], [['E', 'H'], ['F']], [['E', 'H'], ['E', 'J']], [['D', 'J'], ['B']], [['J'], ['F', 'J']] ],
      synthetic: [
        ['E', 'H', 'J'],
        ['D', 'J', 'B'],
        ['J', 'F'],
        ['B', 'E', 'H']
      ]
    },
    {
      scheme: ['A', 'B', 'C', 'D', 'E', 'F'],
      deps: [ [['A', 'B'], ['B', 'E']], [['A', 'B'], ['D']], [['E', 'F'], ['C']], [['E'], ['D', 'E']], [['C'], ['F']] ],
      synthethic: [
        ['A', 'B', 'E'],
        ['E', 'F', 'C'],
        ['E', 'D'],
        ['A', 'B', 'F']
      ]
    },
    {
      scheme: ['A', 'B', 'C', 'D', 'E', 'F'],
      deps: [ [['A'], ['E', 'C']], [['B', 'C'], ['F']], [['D'], ['B']] ],
      synthetic: [
        ['A', 'E', 'C'],
        ['B', 'C', 'F'],
        ['D', 'B'],
        ['A', 'D']
      ]
    },
    {
      scheme: ['A', 'B', 'C', 'D', 'E', 'F'],
      deps: [ [['A', 'B', 'C'], ['D']], [['A', 'F'], ['B']], [['C'], ['F', 'E']], [['E'], ['F']], [['F'], ['B']], [['E'], ['B']], [['A', 'F'], ['F']] ],
      canonical: [ [['A', 'C'], ['D']], [['C'], ['E']], [['E'], ['F']], [['F'], ['B']] ]
    },
    {
      scheme: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      deps: [[['B'], ['B', 'F', 'G']], [['A', 'B', 'G'], ['A', 'D', 'E']], [['B', 'G'], ['B', 'D']], [['B'], ['C']], [['C'], ['G', 'F', 'C']]],
      canonical: [[['A', 'B'], ['E']], [['B'], ['C', 'D']], [['C'], ['F', 'G']]]
    },
    {
      scheme: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      deps: [[['A', 'C', 'D'], ['E']], [['E', 'F'], ['E']], [['A', 'D'], ['C', 'G']], [['D', 'E'], ['F']], [['B'], ['B', 'C']], [['A', 'D'], ['F']],
[['B', 'D', 'C'], ['G']]],
      canonical: [[['A', 'D'], ['C', 'E', 'G']], [['B'], ['C']], [['B', 'D'], ['G']], [['D', 'E'], ['F']]]
    },
    {
      scheme: ['A', 'B', 'C', 'D', 'E'],
      deps: [ [['A'], ['B', 'D']], [['A', 'C'], ['E']], [['C', 'D'], ['E']], [['E'], ['A']], [['D'], ['C']] ],
      canonical: [ [['A'], ['B', 'D']], [['D'],['E', 'C']], [['E'], ['A']] ]
    },
    {
      scheme: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      deps: [ [['A'], ['B', 'C']], [['C'], ['D']], [['A', 'C'], ['E']], [['B'], ['A']], [['E'], ['B', 'C']] ],
      keys: [['A', 'F', 'G'], ['B', 'F', 'G'], ['E', 'F', 'G']],
      superkeys: [['A', 'F', 'G'], ['B', 'F', 'G'],['E', 'F', 'G'], ['A', 'B', 'C', 'D', 'E', 'F', 'G'], ['A', 'B', 'F', 'G'], ['B', 'E', 'F', 'G'], ['A', 'E', 'F', 'G'], ['A', 'B', 'E', 'F', 'G'], ['A', 'C', 'F', 'G'], ['B', 'C', 'F', 'G'], ['A', 'B', 'C', 'F', 'G'], ['C', 'E', 'F', 'G'], ['A', 'C', 'E', 'F', 'G'], ['B', 'C', 'E', 'F', 'G'], ['A', 'B', 'C', 'E', 'F', 'G'], ['A', 'D', 'F', 'G'], ['B', 'D', 'F', 'G'], ['A', 'B', 'D', 'F', 'G'], ['D', 'E', 'F', 'G'], ['A', 'D', 'E', 'F', 'G'], ['B', 'D', 'E', 'F', 'G'], ['A', 'B', 'D', 'E', 'F', 'G'], ['A', 'C', 'D', 'F', 'G'], ['B', 'C', 'D', 'F', 'G'], ['A', 'B', 'C', 'D', 'F', 'G'], ['C', 'D', 'E', 'F', 'G'], ['A', 'C', 'D', 'E', 'F', 'G'], ['B', 'C', 'D', 'E', 'F', 'G'] ]
    },
    {
      scheme: ['A', 'B', 'C'],
      deps: [ [ ['A'], ['B'] ] ],
      keys: [ ['A', 'C'] ],
      superkeys: [ ['A', 'C'], ['A', 'B', 'C'] ],
    },
    {
      scheme: ['A', 'B', 'C', 'D', 'E'],
      deps: [ [['A', 'C'], ['B', 'D']], [['A', 'D'], ['B', 'C'] ], [['C'], ['D']] ],
      keys: [['A', 'C', 'E'], ['A', 'D', 'E']],
      superkeys: [['A', 'C', 'E'], ['A', 'C', 'E', 'B'],['A', 'C', 'E', 'D'], ['A', 'C', 'E', 'B', 'D'], ['A', 'D', 'E'],['A', 'D', 'E', 'B'], ['A', 'D', 'E', 'C'], ['A', 'D', 'E', 'B', 'C'],['A', 'B', 'C', 'D', 'E'] ],
    },
    {
      scheme: ['A', 'B', 'C', 'D', 'E'],
      deps: [ [['A'], ['B', 'C']], [['C'], ['D']], [['A'], ['D']]],
      keys: [['A', 'E']],
      superkeys: [['A', 'E'], ['A', 'B', 'E'], ['A', 'C', 'E'], ['A', 'D', 'E'], ['A', 'B', 'C', 'E'], ['A', 'B', 'D', 'E'], ['A', 'C', 'D', 'E'], ['A', 'B', 'C', 'D', 'E']],
    }
  ];
  
  var injector = angular.injector(['FDAlgorithm']);
  var algo = injector.get('algorithm');
  
  var schemeEquals = function(a, b) {
    if (a instanceof Array) {
      var tmp = { };
      for (var i = 0; i < a.length; i++) {
        tmp[a[i].name ? a[i].name() : a[i].sort().join('')] = true;
      }
      a = tmp;
    }
    if (b instanceof Array) {
      var tmp = { };
      for (var i = 0; i < b.length; i++) {
        tmp[b[i].name ? b[i].name() : b[i].sort().join('')] = true;
      }
      b = tmp;
    }
    expect(a).toEqual(b);
  };
  
  var fdEquals = function(a, b) {
    if (a instanceof Array) {
      var tmp = [];
      for (var i = 0; i < a.length; i++) {
        tmp.push((a[i] instanceof algo.FDep) ? a[i] : new algo.FDep(a[i][0], a[i][1]));
      }
      a = tmp;
    }
    if (b instanceof Array) {
      var tmp = [];
      for (var i = 0; i < b.length; i++) {
        tmp.push((b[i] instanceof algo.FDep) ? b[i] : new algo.FDep(b[i][0], b[i][1]));
      }
      b = tmp;
    }
    return schemeEquals(a, b);
  };
  
  var relEquals = function(a, b) {
    for (var i = 0; i < a.length; i++) {
      if (a[i] instanceof algo.Relation) {
        a[i] = a[i].scheme
      } else {
        a[i] = new algo.Scheme(a[i]);
      }
    }
    
    for (var i = 0; i < b.length; i++) {
      if (b[i] instanceof algo.Relation) {
        b[i] = b[i].scheme
      } else {
        b[i] = new algo.Scheme(b[i]);
      }
    }
    
    schemeEquals(a, b);
  };
  
  var prepareRelations = function(gotOne) {
    for (var i = 0; i < schemes.length; i++) {
      var s = schemes[i];
      (function(s) {
        var scheme = new algo.Scheme(s.scheme);
        var deps = [];
        for (var j = 0; j < s.deps.length; j++) {
          var dep = s.deps[j];
          deps.push(new algo.FDep(dep[0], dep[1]));
        }
        
        var relation = new algo.Relation(scheme, deps);
      
        describe(relation.name(), function() {
          gotOne(relation, s);
        });
      })(s);
    }
  };
  prepareRelations(function(relation, data) {
    var original = relation.clone();
    
    if (data.keys) {
      it('calculates key properly', function () {
        // arrange
        var key      = null;
        var expctKey = data.keys;
        
        // act
        key = relation.calculateKey();
        
        // assert
        schemeEquals(key, expctKey);
        expect(relation.name()).toEqual(original.name());
      });
    }
    
    if (data.superkeys) {
      it('calculates super key properly', function () {
        // arrange
        var key      = null;
        var expctKey = data.superkeys;
        
        // act
        key = relation.calculateSuperKey();
        
        // assert
        schemeEquals(key, expctKey);
        expect(relation.name()).toEqual(original.name());
      });
    }
    
    if (data.canonical) {
      it('calculates canonical overlap', function () {
        // arrange
        var deps      = null;
        var expctDeps = data.canonical;
        
        // act
        deps = relation.calculateCanonicalOverlap();
        
        // assert
        fdEquals(deps, expctDeps);
        expect(relation.name()).toEqual(original.name());
      });
    }
    
    if (data.synthetic) {
      it('calculates synthetic algorithm', function() {
        // arrange
        var relations = null;
        var expctRels = data.synthetic;
        
        // act
        relations = relation.calculateSyntheticAlgorithm();
        
        // assert
        relEquals(relations, expctRels);
        expect(relation.name()).toEqual(original.name());
      });
    }
    
    it('isSuperKey works', function() {
       // arrange
      var superKey      = relation.calculateSuperKey();
      var key           = relation.calculateKey();
      
      
      // act / assert
      for (var i = 0; i < superKey.length; i++) {
        expect(relation.isSuperKey(superKey[i].scheme)).toBe(true);
      }
      
      for (var i = 0; i < key.length; i++) {
        expect(relation.isSuperKey(key[i].scheme)).toBe(true);
        if (!key[i].scheme.length > 1) {
          key[i].scheme.splice(0, 1);
          expect(relation.isSuperKey(key[i].scheme)).toBe(false);
        } else if (key[i].scheme.length == 0) {
          fail('Key cannot be empty.');
        }
      }
      
      expect(relation.name()).toEqual(original.name());
    })
  });
});
