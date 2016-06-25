var ProductsService = angular.module('ProductsService', ["ngResource", "ngRoute", "ngCookies"]);

ProductsService.config(function ($httpProvider) {
  $httpProvider.interceptors.push(['$q', '$location', '$cookieStore', '$rootScope',
    function ($q, $location, $cookieStore, $rootScope) {
      return {
        'request': function (config) {
          config.headers = config.headers || {};
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
          return config;
        },
        'responseError': function (response) {
          if (response.status === 401 || response.status === 403) {
              // $rootScope.message = "You're not signed in";
              $location.path('/');
          }
          return $q.reject(response);
        }
      };
  }]);
});

ProductsService.config(function ($routeProvider) {
  $routeProvider.when("/products", {
    templateUrl: "products.html",
    controller: "ProductsIndexController"
  }).when("/products/:id", {
    templateUrl: "product.html",
    controller: "ProductsShowController"
  }).when("/cart", {
    templateUrl: "cart.html",
    controller: "CartController"
  }).when("/login", {
    templateUrl: "login.html",
    controller: "LoginController"
  }).when("/signup", {
    templateUrl: "signup.html",
    controller: "SignupController"
  });
});

ProductsService.controller('SignupController', ['$scope', '$rootScope', '$resource', '$location', '$cookieStore',
  function ($scope, $rootScope, $resource, $location, $cookieStore) {
    $scope.signup = function() {
      var Register = $resource("/register");
      var registration = new Register({
        username: this.username,
        password: this.password,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName
      });

      registration.$save(function (model, response) {
          $cookieStore.put('token', model.data);
          $rootScope.loggedIn = !!$cookieStore.get('token');
          $location.path("/");
        }, function(model, response) {
          $rootScope.message = model.message;
        }
      );
    }
  }
]);

ProductsService.controller('CartController', ['$scope', '$rootScope', '$resource',
  function ($scope, $rootScope, $resource) {
    var CartItem = $resource("/cart/:id", {id: "@id"});

    queryAllCartItems = function () {
      CartItem.query(function(data) {
        $rootScope.cartItems = data;
        $rootScope.totalCartValue = _.reduce(data, function(totalValue, item) {
          return totalValue + parseFloat(item.totalprice);
        }, 0);
      });
    }

    queryAllCartItems();

    $scope.removeItemFromCart = function (itemId) {
      CartItem.delete({"id" : itemId});
      queryAllCartItems();
    }

    $scope.purchaseAllItems = function () {
      _.each($rootScope.cartItems, function(item){
        CartItem.delete({"id" : item.productid});
      })

      queryAllCartItems();

      $scope.successMessage = "Thanks for purchasing!";
    }
  }
]);

ProductsService.controller('ProductsIndexController', ['$scope', '$resource', '$location',
  function ($scope, $resource, $location, Product) {
    var Product = $resource("/products/:id", { id: "@id" });

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

ProductsService.controller('ProductsShowController', ['$scope','$rootScope', '$resource', "$routeParams",
  function ($scope, $rootScope, $resource, $routeParams) {
    var Product = $resource("/products/:id", { id: "@id" });
    var CartItem = $resource("/cart/:id", {id: "@id"});

    Product.get({ id: $routeParams.id }, function(data) {
      $scope.product = data;
    });

    $scope.addItemToCart = function (product) {
      var cartItem = new CartItem({productId: product.productid});
      cartItem.$save();
    }
  }
]);

ProductsService.controller('LoginController', ['$scope', '$rootScope', '$http', '$cookieStore', '$location',
  function ($scope, $rootScope, $http, $cookieStore, $location) {
    $rootScope.loggedIn = !!$cookieStore.get('token');

    $scope.logout = function() {
      $cookieStore.remove('token');
      $rootScope.loggedIn = !!$cookieStore.get('token');
      $location.path("/login");
    }

    $scope.login = function() {
      $http.put("/login", {username: this.username, password: this.password}).then(function(resp) {
        if(resp.data.data) {
          $cookieStore.put('token', resp.data.data);
          $rootScope.loggedIn = !!$cookieStore.get('token');
          $location.path("/");
        }
      });
    }
  }
]);

