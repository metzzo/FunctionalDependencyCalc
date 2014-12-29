'use strict';

/**
 * @ngdoc overview
 * @name functionalDependencyApp
 * @description
 * # functionalDependencyApp
 *
 * Main module of the application.
 */
angular
  .module('functionalDependencyApp', [
    'ngAnimate',
    'ngRoute',
    'ngSanitize',
    'FDAlgorithm'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
