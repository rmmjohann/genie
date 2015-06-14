(function() {
  'use strict';

  var app = angular.module('genieApp', ['uxGenie', 'ga']);

  // Makes this modular if we don't just use the global instance and use it as a module instead  
  app.constant('genie', genie);

  app.controller('GenieCtrl', function($scope, genie, ga, $http) {
    $scope.demoContext = 'genie-demo';
    $scope.iconPrefix = 'fa fa-';
    genie.context($scope.demoContext);

    $scope.genieStyle = {
      color: 'light',
      size: 'large',
      animationSpeed: 'fast',
      template: 'default'
    };
    $scope.wishesMade = 0;
    
    $scope.lamp = {
      wishMade: function(wish) {
        $scope.wishesMade++;
        ga('send', 'event', 'wish', 'made', $scope.wishesMade);
      },
      genieVisible: false
    };

    // monkey patch directives makeWish method to call own function on click and return
    $scope.$evalAsync(function () {
      var originalLampMakeWishFn = $scope.lamp.makeWish;
      $scope.lamp.makeWish = function (wish) {
        if (typeof wish.data.uxGenie.makeAdditionalWish === 'function') {
          wish.data.uxGenie.makeAdditionalWish(wish);
        }
        originalLampMakeWishFn(wish);
      };
    });
    
    $scope.customLamp = angular.copy($scope.lamp);

    $scope.rubLamp = function($event, lampTemplate) {
      if (lampTemplate === 'default') {
        $scope.customLamp.genieVisible = !$scope.customLamp.genieVisible;
      } else {
        $scope.lamp.genieVisible = !$scope.lamp.genieVisible;
      }
      $event.stopPropagation();
    };
    
    $scope.wishMagicWords = '';

    $scope.addWishFromInput = function() {
      if ($scope.wishMagicWords) {
        ga('send', 'event', 'button', 'click', 'Create Wish: ' + $scope.wishMagicWords);
        addWish($scope.wishMagicWords, null, {
          uxGenie: {
            iIcon: 'glyphicon glyphicon-exclamation-sign'
          }
        });
        $scope.wishMagicWords = '';
      }
    };

    function addWish(magicWords, action, data) {
      if (typeof magicWords === 'string') {
        magicWords = magicWords.split(',');
      }
      return genie({
        magicWords: magicWords,
        action: action || function(wish) {
          alert('Your "' + wish.magicWords[0] + '" wish is my command!');
        },
        context: $scope.demoContext,
        data: data
      });
    }
    
    function addStyleWish(style, altStyle, property, iIcon, altiIcon, wishCalled) {
      var originalWish, altWish;
      function swapWishes(wish) {
        genie.removeContext(wish.context.all);
        genie.addContext(wish.data.otherWish.context.all);
      }
      function applyStyleAndSwapWishes(wish) {
        $scope.genieStyle[property] = wish.data.style.toLowerCase();
        swapWishes(wish);
        wishCalled && wishCalled(wish);
      }
      originalWish = genie({
        magicWords: 'Make lamp ' + style,
        context: {
          all: ['genie-style-' + property + '-' + style, $scope.demoContext]
        },
        action: applyStyleAndSwapWishes,
        data: {
          style: style,
          uxGenie: {
            iIcon: 'glyphicon glyphicon-' + iIcon
          }
        }
      });
      altWish = genie({
        magicWords: 'Make lamp ' + altStyle,
        context: {
          all: ['genie-style-' + property + '-' + altStyle, $scope.demoContext]
        },
        action: applyStyleAndSwapWishes,
        data: {
          style: altStyle,
          otherWish: originalWish,
          uxGenie: {
            iIcon: 'glyphicon glyphicon-' + altiIcon
          }
        }
      });
      originalWish.data.otherWish = altWish;
      $scope.$watch('genieStyle["' + property + '"]', function(newVal) {
        if (newVal === style.toLowerCase()) {
          swapWishes(originalWish);
        } else {
          swapWishes(altWish);
        }
      });
    }
    
    addStyleWish('Dark', 'Light', 'color', 'picture', 'picture');
    addStyleWish('Small', 'Large', 'size', 'resize-small', 'resize-full');
    addStyleWish('Slow', 'Fast', 'animationSpeed', 'fast-backward', 'fast-forward');
    addStyleWish('Custom', 'Default', 'template', 'random', 'random', function() {
      $scope.lamp.genieVisible = false;
      $scope.customLamp.genieVisible = false;
    });

    var genieTagline = encodeURIComponent('Genie: Better than keyboard shortcuts');
    var genieHome = encodeURIComponent('http://kent.doddsfamily.us/genie');

    function addNavigateWishWithoutPrefix(magicWord, shareUrl, iIcon) {
      addWish(magicWord, {
        destination: shareUrl,
        openNewTab: true
      }, {
        uxGenie: {
          iIcon: iIcon
        }
      });
    }

    genie({
      magicWords: "Produkt 666",
      data: {
        uxGenie: {

        }
      }
    });

    genie({
      magicWords: "deine mudda",
      data: {
        uxGenie: {
          subContext: "deine-mudda"
        }
      }
    });

    genie({
      magicWords: "ist dein vadder",
      context: {
        all: ["deine-mudda"]
      }
    });

    genie({
      magicWords: "ist nicht dein vadder",
      context: {
        all: ["deine-mudda"]
      }
    });

    addNavigateWishWithoutPrefix('Tweet #GenieJS', 'https://twitter.com/intent/tweet?hashtags=GenieJS&original_referer=' + genieHome + '&text=' + genieTagline + '&tw_p=tweetbutton&url=' + genieHome + '&via=kentcdodds', $scope.iconPrefix + 'share');
    addNavigateWishWithoutPrefix('Share #GenieJS on Google+', 'http://plus.google.com/share?&url=' + genieHome, $scope.iconPrefix + 'share');
    addNavigateWishWithoutPrefix('Email about GenieJS', 'mailto:?&subject=' + encodeURIComponent('Cool JavaScript Library: Genie') + '&body=' + genieTagline + encodeURIComponent('\nCheck it out here: ') + genieHome, $scope.iconPrefix + 'envelope');
    
    addNavigateWishWithoutPrefix('Code with @kentcdodds', 'http://www.github.com/kentcdodds', $scope.iconPrefix + 'github');
    addNavigateWishWithoutPrefix('Follow @kentcdodds', 'https://twitter.com/intent/follow?original_referer=' + genieHome + '&region=follow_link&screen_name=kentcdodds&tw_p=followbutton&variant=2.0', $scope.iconPrefix + 'twitter');
    addNavigateWishWithoutPrefix('Circle +KentCDodds', 'http://plus.google.com/+KentCDodds', $scope.iconPrefix + 'google-plus');
    addNavigateWishWithoutPrefix('Visit Kent\'s website', 'http://kent.doddsfamily.us', $scope.iconPrefix + 'globe');

    $scope.lamp.groupedAdditionalWishes = [];

    var additionalWishes = [
      {
        data: {
          uxGenie: {
            magicRegex: /Produkt\s+(\d+)/i,
            displayString: "Produkt [Produkt ID]",
            parsedDisplayString: "Produkt {{1}}",
            group: "Produkte",
            makeAdditionalWish: function (wish) {
              console.log('makeAdditionalWish with', wish);
            },
            getAdditionalWishes: function (productId) {
              return [
                {
                  data: {
                    uxGenie: {
                      displayText: "Titel des produkts 1",
                      "shortDescription": "kurze beschreibung des produkts 1",
                      group: "Produkt"
                    }
                  }
                },
                {
                  data: {
                    uxGenie: {
                      displayText: "Titel des produkts 2",
                      "shortDescription": "kurze beschreibung des produkts 2",
                      group: "Produkt"
                    }
                  }
                },

                {
                  data: {
                    uxGenie: {
                      displayText: "was ganz anderes 1",
                      "shortDescription": "kurze beschreibung des produkts 1",
                      group: "Was anderes"
                    }
                  }
                },
                {
                  data: {
                    uxGenie: {
                      displayText: "was ganz anderes 2",
                      "shortDescription": "kurze beschreibung des produkts 2",
                      group: "Was anderes"
                    }
                  }
                }
              ];
            }
          }
        }
      }
    ];

    $scope.$watch('lamp.input', function () {
      // eval async because we want to get $scope.lamp.matchingWishes set by the uxGenie directive
      $scope.$evalAsync(function () {
        $scope.lamp.matchingWishes = $scope.lamp.matchingWishes || [];

        // @todo: focus always first wish. now if a original is focused and additional get into result set, the original stays focused
        var originalMatchingWishes = $scope.lamp.matchingWishes;

        $scope.lamp.groupedAdditionalWishes = [];

        var wishInput = $scope.lamp.input;

        var matchingAdditionalWishes = additionalWishes.filter(function (additionalWish) {
          return additionalWish.data.uxGenie.magicRegex.test(wishInput);
        });

        var groupedMatchingAdditionalWishes = {};
        matchingAdditionalWishes.forEach(function (matchingAdditionalWish) {
          if (getUxGenieAttributeOrUndefined(matchingAdditionalWish, "magicRegex")) {
            var additionalWishParams = matchingAdditionalWish.data.uxGenie.magicRegex.exec(wishInput),
              additionalWishResult = matchingAdditionalWish.data.uxGenie.getAdditionalWishes.apply(undefined, additionalWishParams.slice(1));

            if (additionalWishResult.length) {
              var matchingWishGroup = getUxGenieAttributeOrUndefined(matchingAdditionalWish, "group");

              groupedMatchingAdditionalWishes[matchingWishGroup] = groupedMatchingAdditionalWishes[matchingWishGroup] || [];

              additionalWishResult = additionalWishResult.map(function (wish) {
                wish.data.uxGenie.makeAdditionalWish = matchingAdditionalWish.data.uxGenie.makeAdditionalWish;
                return wish;
              });

              groupedMatchingAdditionalWishes[matchingWishGroup] = groupedMatchingAdditionalWishes[matchingWishGroup].concat(additionalWishResult);
            }
          }
        });

        originalMatchingWishes.forEach(function (originalMatchingWish) {
          var group = getUxGenieAttributeOrUndefined(originalMatchingWish, "group");
          groupedMatchingAdditionalWishes[group] = groupedMatchingAdditionalWishes[group] || [];
          groupedMatchingAdditionalWishes[group].push(originalMatchingWish);
        });

        // @todo: rating of matched groups by search term when clicked on item of a group

        $scope.lamp.matchingWishes = [];
        for (var group in groupedMatchingAdditionalWishes) {
          $scope.lamp.matchingWishes = $scope.lamp.matchingWishes.concat(groupedMatchingAdditionalWishes[group]);
        }

        // focus first wish of result set
        if ($scope.lamp.matchingWishes.length) {
          $scope.lamp.focusedWish = $scope.lamp.matchingWishes[0];
        }
      });

      function getUxGenieAttributeOrUndefined(wish, attribute) {
        return wish.data && wish.data.uxGenie && wish.data.uxGenie[attribute] || undefined;
      }
    });

    window.scope = $scope;
  });

})();