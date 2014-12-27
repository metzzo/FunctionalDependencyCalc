'use strict';

describe('Directive: FDef', function () {

  // load the directive's module
  beforeEach(module('functionalDependencyApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<-f-def></-f-def>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the FDef directive');
  }));
});
