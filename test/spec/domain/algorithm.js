'use strict';

describe('Algorithm', function () {
  var schemes = [
    {
      scheme: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      deps: [ [['A'], ['B', 'C']], [['C'], ['D']], [['A', 'C'], ['E']], [['B'], ['A']], [['E'], ['B', 'C']] ],
      keys: [['A', 'F', 'G'], ['B', 'F', 'G'], ['E', 'F', 'G']]
    },
    {
      scheme: ['A', 'B', 'C'],
      deps: [ [ ['A'], ['B'] ] ],
      keys: [ ['A', 'C'] ]
    },
    {
      scheme: ['A', 'B', 'C', 'D', 'E'],
      deps: [ [['A', 'C'], ['B', 'D']], [['A', 'D'], ['B', 'C'] ], [['C'], ['D']] ],
      keys: [['A', 'C', 'E'], ['A', 'D', 'E']]
    },
    {
      scheme: ['A', 'B', 'C', 'D', 'E'],
      deps: [ [['A'], ['B', 'C']], [['C'], ['D']], [['A'], ['D']]],
      keys: [['A', 'E']]
    }
  ];
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
      
      var strKey = [ ];
      for (var i = 0; i < key.length; i++) {
        strKey.push(key[i].scheme);
      }
      
      
      // assert
      expect(strKey).toEqual(expctKey);
    });
  });
});
