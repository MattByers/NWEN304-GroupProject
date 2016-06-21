var ProductsService = angular.module('ProductsService', ["ngResource", "ngRoute"]);

ProductsService.config(function ($routeProvider) {
  $routeProvider.when("/products", {
    templateUrl: "products.html",
    controller: "ProductsIndexController"
  }).when("/products/:id", {
    templateUrl: "product.html",
    controller: "ProductsShowController"
  });
});

ProductsService.controller('ProductsIndexController', ['$scope', '$resource', '$location',
  function ($scope, $resource, $location, Product) {
    var Product = $resource("/api/products/:id", { id: "@id" });

    Product.query(function(data) {
      $scope.products = data;
    });

    $scope.goToProduct = function(event, productId) {
      if(!!event)
        event.preventDefault();

      $location.path("/products/" + productId);
    };
  }
]);

ProductsService.controller('ProductsShowController', ['$scope', '$resource', "$routeParams",
  function ($scope, $resource, $routeParams) {
    var Product = $resource("/api/products/:id", { id: "@id" });

    Product.get({ id: $routeParams.id }, function(data) {
      $scope.product = data;
    });
  }
]);
