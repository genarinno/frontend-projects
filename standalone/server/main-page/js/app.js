// Create the module
var angularRoutingApp = angular.module("angularRoutingApp", ["ui.router"]);

// Create routes
angularRoutingApp.config( function($stateProvider, $urlRouterProvider, $locationProvider) {
    
    $stateProvider
        .state("index", {
            url: "/",
            views:{
                "page":{
                     templateUrl: "pages/home.html"
                },
                "menu":{
                     templateUrl: "pages/menu.html"
                }
            }
        })
        .state("cartodb", {
            url: "/cartodb",
            views:{
                "page":{
                     templateUrl: "pages/cartodb.html"
                },
                "menu":{
                     templateUrl: "pages/menu.html"
                }
            }
        })
        .state("loader", {
            url: "/loader",
            views:{
                "page":{
                     templateUrl: "pages/loader.html"
                },
                "menu":{
                     templateUrl: "pages/menu.html"
                }
            }
        })
        .state("modal", {
            url: "/modal",
            views:{
                "page":{
                     templateUrl: "pages/modal.html"
                },
                "menu":{
                     templateUrl: "pages/menu.html"
                }
            }
        })
        .state("paginator", {
            url: "/paginator",
            views:{
                "page":{
                     templateUrl: "pages/paginator.html"
                },
                "menu":{
                     templateUrl: "pages/menu.html"
                }
            }
        })
        .state("paginator-demo", {
            url: "/paginator/demo",
            views:{
                "page":{
                     templateUrl: "pages/paginator/demo.html"
                },
                "menu":{
                     templateUrl: "pages/menu.html"
                }
            }
        })
        .state("textwrapper", {
            url: "/textwrapper",
            views:{
                "page":{
                     templateUrl: "pages/textWrapper.html"
                },
                "menu":{
                     templateUrl: "pages/menu.html"
                }
            }
        });

        $locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise("/");
});
