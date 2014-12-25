'use strict';

describe('Algorithm', function () {
  var schemes = [
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
      superkeys: [ ['A', 'C'], ['A', 'B', 'C'] ]
    },
    {
      scheme: ['A', 'B', 'C', 'D', 'E'],
      deps: [ [['A', 'C'], ['B', 'D']], [['A', 'D'], ['B', 'C'] ], [['C'], ['D']] ],
      keys: [['A', 'C', 'E'], ['A', 'D', 'E']],
      superkeys: [['A', 'C', 'E'], ['A', 'C', 'E', 'B'],['A', 'C', 'E', 'D'], ['A', 'C', 'E', 'B', 'D'], ['A', 'D', 'E'],['A', 'D', 'E', 'B'], ['A', 'D', 'E', 'C'], ['A', 'D', 'E', 'B', 'C'],['A', 'B', 'C', 'D', 'E'] ]
    },
    {
      scheme: ['A', 'B', 'C', 'D', 'E'],
      deps: [ [['A'], ['B', 'C']], [['C'], ['D']], [['A'], ['D']]],
      keys: [['A', 'E']],
      superkeys: [['A', 'E'], ['A', 'B', 'E'], ['A', 'C', 'E'], ['A', 'D', 'E'], ['A', 'B', 'C', 'E'], ['A', 'B', 'D', 'E'], ['A', 'C', 'D', 'E'], ['A', 'B', 'C', 'D', 'E']]
    }
  ];
  
  var schemeEquals = function(a, b) {
    if (a instanceof Array) {
      var tmp = { };
      for (var i = 0; i < a.length; i++) {
        tmp[a[i].name ? a[i].name() : a.sort().join('')] = true;
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
  
  var injector = angular.injector(['FDAlgorithm']);
  var algo = injector.get('algorithm');
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
    it('calculates key properly', function () {
      // arrange
      var key      = null;
      var expctKey = data.keys;
      
      // act
      key = relation.calculateKey(false);
      
      // assert
      schemeEquals(key, expctKey);
    });
    
    it('calculates super key properly', function () {
      // arrange
      var key      = null;
      var expctKey = data.superkeys;
      
      // act
      key = relation.calculateSuperKey(true);
      
      // assert
      schemeEquals(key, expctKey);
    });
  });
});
