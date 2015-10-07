'use strict';
(function (module) {
  try {
    module = angular.module('tink.datepicker');
  } catch (e) {
    module = angular.module('tink.datepicker', ['tink.datehelper', 'tink.safeApply', 'tink.formathelper']);
  }
  module.directive('tinkDatepicker', ['$q', '$templateCache', '$http', '$compile', 'dateCalculator', 'calView', 'safeApply', '$window', '$sce', '$timeout', function ($q, $templateCache, $http, $compile, dateCalculator, calView, safeApply, $window, $sce, setTimeout) {
    return {
      restrict: 'E',
      require: ['ngModel', '?^form'],
      replace: true,
      templateUrl: 'templates/tinkDatePickerInput.html',
      scope: {
        ngModel: '=?',
        minDate: '=?',
        maxDate: '=?',
        isDisabled: '=?',
        name: '=',
        ngChange: '&',
        alignsRight: '=?'
      },
      compile: function (template, $attr) {
        if ($attr.required) {
          $attr.required = false;
          template.find('input').attr('data-require', true);
          template.find('input').attr('name', template.attr('name'));
        }
        if ($attr.ngChange) {
          //template.find('input').attr('ng-change',template.attr('ng-change'));
        }

        return {
          pre: function () { },
          post: function (scope, element, attr) {
            scope.name = attr.name;
            scope.opts = attr;
            /*
            * Define the variables we need trough the code.
            *
            */

            var $directive = {
              viewDate: new Date(),
              pane: {},
              open: 0,
              mode: 0,
              appended: 0,
              selectedDate: null,
              disabled: undefined
            };

            //The clicable icon to open and close the datepicker
            var clickable = element.find('.datepicker-icon');
            //To hold a copy of the compiled template of the datepicker
            var copyEl;
            //The editable div.
            var content = element.find('div.faux-input');
            //To hold all the liseners to close them later
            var Listeners = {};

            /*
            * Function to open the datepicker.
            */
            scope.$show = function () {
              //take the compiled version of the template and put it in our variable
              copyEl = templateElem;
              // Check if the datepicker content isn't already added
              if ($directive.appended !== 1) {
                  //add the compiled version of the template to the dom
                  element.append(copyEl);
                  //Raise the vlag
                  $directive.appended = 1;
                }
              //Aria: let aria know we have opend a element.
              copyEl.attr('aria-hidden', 'false');
              //Change the css values to show the datepicker.
              copyEl.css({ position: 'absolute', display: 'block' });
              //Bind all the liseners of the datepicker
              bindListeners();
              //Init variables when you open the datepicker.
              $directive.pane.month = 1;
              $directive.open = 1;
              //Build all the date what we need to show.
              scope.build();
            };

            function disableElements(el) {
              for (var i = 0; i < el.length; i++) {
                $(el[i]).attr('disabled', 'disabled');
                $(el[i]).attr('tabindex', '-1');
                disableElements(el[i].children);
              }
            }

            function enableElements(el) {
              for (var i = 0; i < el.length; i++) {
                $(el[i]).removeAttr('disabled', 'disabled');
                $(el[i]).removeAttr('tabindex', '-1');
                disableElements(el[i].children);
              }
            }

            scope.$watch('isDisabled', function (newV) {
              $directive.disabled = newV;
              if (newV) {
                disableElements(content);
              } else {
                enableElements(content);
              }
            });

            scope.$watch('ngModel', function (valueNew,valueOld) {
              if (angular.isDefined(valueNew) && valueNew !== null) {
                //scope.ngModel = addTime(valueNew,valueOld);
                if (!(valueNew instanceof Date)) {
                  //Change to Date object
                  scope.ngModel = new Date(valueNew);
                }
                if(valueNew instanceof Date && valueOld instanceof Date && valueNew.getTime() !== valueOld.getTime()){
                  scope.ngChange();
                }else if(valueNew instanceof Date &&  !(valueOld instanceof Date)){
                  scope.ngChange();
                }else if(valueOld instanceof Date){
                  scope.ngModel.setMinutes(valueOld.getMinutes());
                  scope.ngModel.setHours(valueOld.getHours());
                  scope.ngModel.setMilliseconds(valueOld.getMilliseconds());
                }
              }else{
                scope.ngChange();
              }
            });

            /*
            * Lisen to a value change
            */
            content.bind('valueChanged', function (e, val) {
              //We put this in a safeaply because we are out of the angular scope !
              safeApply(scope, function () {
                //Check if the date we received is a valid date.
                if (validFormat(val, 'dd/mm/yyyy')) {
                  //Convert the String Date to a Date object and put it as the selected date.
                  $directive.selectedDate = dateCalculator.getDate(val, 'dd/mm/yyyy');
                  //addTime($directive.selectedDate,scope.ngModel);
                  //change the view date to the date we have selected.
                  $directive.viewDate = $directive.selectedDate;
                  //Build the datepicker again because we have changed the variables.
                  scope.build();
                } else {
                  $directive.selectedDate = null;
                  scope.build();
                }
              });
            });

             function addTime(date1,date2){
               if(angular.isDate(date1) && angular.isDate(date2)){
                 date1.setMinutes(date2.getMinutes());
                 date1.setHours(date2.getHours());
                 date1.setMilliseconds(date2.getMilliseconds());
               }
               return date1;
            }

            /*
            * Function that starts all the liserners.
            */
            function bindListeners() {

              function childOf(c, p) { //returns boolean
                while ((c = c.parentNode) && c !== p) {
                }
                return !!c;
              }

              /*
              * Window click lister
              * will be called when there is a click
              */
              Listeners.windowClick = function (event) {
                //only do this if the datepicker is open
                if ($directive.open) {
                  //If you do not click on the datepicker the datepicker will close.
                  if (!childOf(event.target, copyEl.get(0)) && !childOf(event.target, element.get(0)) && !$directive.click) {
                    //close the datepicker.
                    scope.hide();
                  }
                  $directive.click = 0;
                }
              };

              /*
              * Window Keypress
              */
              Listeners.windowKeydown = function (event) {
                //only do this if the datepicker is open
                if ($directive.open) {
                  //We use a safeapply because we are out of the scope.
                  safeApply(scope, function () {
                    //Aria: When there is a elment selected inside the datepicker and we use the keyboard arrows
                    if (currentSelected && (event.which === 38 || event.which === 37 || event.which === 39 || event.which === 40)) {
                      //prevent the default behaviour
                      event.preventDefault();
                      //Change the focus of the buttons
                      calcFocus(event.which);
                      //If the user presses the tab button
                    } else if (event.keyCode === 9) {
                      //Disable the blur function !
                      content.bindFirst('blur.disable', function (e) {
                        e.stopImmediatePropagation();
                        return false;
                      });

                      event.preventDefault();
                      //Aria: focus the proper button for aria usage.
                      setFocusButton();
                      //Aria: if a aria button is selected and the previous tests failed and we didn't pressed the enter button
                    } else if (currentSelected && event.keyCode !== 13) {
                      //Focus the content
                      content.focus();
                      //reset the selected button
                      currentSelected = null;
                    }
                  });
                }
              };
              //Bind the window click
              $($window).bind('click', Listeners.windowClick);
              //bind the window keydown
              $($window).bind('keydown', Listeners.windowKeydown);
              }

              //Aria: on content focus reset the selected aria focus.
              content.bind('focus', function () {
                currentSelected = null;
              });

              /*
              * function to add a lisener that wil be called first in the call event.
              */
              $.fn.bindFirst = function (name, fn) {
                // bind as you normally would
                // don't want to miss out on any jQuery magic
                this.on(name, fn);

                // Thanks to a comment by @Martin, adding support for
                // namespaced events too.
                this.each(function () {
                  var handlers = $._data(this, 'events')[name.split('.')[0]];
                  // take out the handler we just inserted from the end
                  var handler = handlers.pop();
                  // move it at the beginning
                  handlers.splice(0, 0, handler);
                });
              };

              /*
              * Check if the date has the correct format.
              */
              function validFormat(date, format) {
                var dateObject;
                //Check if the date is not null and defined
                if (angular.isDefined(date) && date !== null) {
                  //check if de date is in a string form;
                  if (typeof date === 'string') {
                    //check if the length of the string has de proper length.
                    if (date.length !== 10) { return false; }
                    //if we are on touch we do not have to check
                    if (!isTouch && !/^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/.test(date)) { return false; }
                    //get a date object
                    dateObject = dateCalculator.getDate(date, format);
                  } else if (angular.isDate(date)) {
                    //if we already got a date object use that one
                    dateObject = date;
                  } else if (typeof date === 'function') {
                    //if it is a function call the function and recheck the data;
                    return validFormat(date(), format);
                  } else {
                    //in all other cases false !
                    return false;
                  }
                  //check if we got a valid date.
                  return dateObject.toString() !== 'Invalid Date';
                }
              }

              /*
              * function to remove the acive liseners.
              */
              function removeListeners() {
                $($window).unbind('click', Listeners.windowClick);

                $($window).unbind('keydown', Listeners.windowKeydown);
              }

              scope.elemFocus = function (ev) {
                setFocusButton($(ev.target), false);
              };

              /*
              * Aria: Function to change the focus for the buttons
              */
              function setFocusButton(btn, focus) {
                //wait 10 miliseconds because of the focus delay.
                setTimeout(function () {
                  //Aria: if a button is slected set the selected aria value to false;
                  if (currentSelected) {
                    currentSelected.attr('aria-selected', 'false');
                  }
                  //if we got a button set it selected;
                  if (btn) {
                    //Aria: select the button with aria
                    btn.attr('aria-selected', 'true');
                    //If we got a focus false do not focus!
                    if (focus !== false) {
                      btn.focus();
                    }
                    //change the current selected button.
                    currentSelected = btn;
                  } else {
                    //we got no button zo lets calculate a button to select
                    if ($(copyEl.find('.btn-today')).length !== 0) {
                      $(copyEl.find('.btn-today')).attr('aria-selected', 'true');
                      $(copyEl.find('.btn-today')).focus();
                      currentSelected = $(copyEl.find('.btn-today'));
                    } else {
                      var firstTb = $(copyEl.find('tbody button:not(.btn-grayed):first'));
                      firstTb.attr('aria-selected', 'true');
                      firstTb.focus();
                      currentSelected = firstTb;
                    }
                  }
                }, 10);
              }

              /*
              * function to check if we do not exceed the minimum date
              */
              function calcLast() {
                var viewDate = $directive.viewDate;
                var firstdate = scope.minDate;
                var lastNum = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0, 0, 0, 0);
                return !dateCalculator.isSameDate(lastNum, firstdate);
              }

              /*
              * function to check if we do not exceed the maximum date
              */
              function calcFirst() {
                var viewDate = $directive.viewDate;
                var lastdate = scope.maxDate;
                var firstNum = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1, 0, 0, 0);
                var current = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0, 0, 0, 0);
                return !(dateCalculator.isSameDate(firstNum, lastdate) || dateCalculator.isSameDate(current, lastdate));
              }

              /*
              * function to change the focus of the buttons when you use aria.
              */
              function calcFocus(e) {
                var calcPos;
                var btn;
                var rijen = copyEl.find('tbody').children();
                var rijIndex = rijen.index(currentSelected.closest('tr'));
                if (rijIndex !== -1) {
                  var kolommen = $(rijen[rijIndex]).children();
                  var kolomIndex = kolommen.index(currentSelected.closest('td'));

                  if (e === 37) {
                    //left Arrow
                    if (rijIndex === 0 && kolomIndex === 0) {
                      if (!angular.isDate(scope.minDate) || calcLast()) {
                        scope.$selectPane(-1, true);
                      }
                    } else if (kolomIndex > 0) {
                      btn = $($(kolommen[kolomIndex - 1]).find('button'));
                      if (btn.hasClass('btn-grayed') && !btn.is(':disabled')) {
                        scope.$selectPane(-1, true);
                      } else {
                        calcPos = btn;
                      }
                    } else {
                      calcPos = $($(rijen[rijIndex - 1]).children()[$(rijen[rijIndex - 1]).children().length - 1]).find('button');
                    }
                  } else if (e === 39) {
                    //right arrow
                    if (rijIndex === rijen.length - 1 && kolomIndex === $(rijen[rijIndex]).children().length - 1) {
                      if (calcFirst()) {
                        scope.$selectPane(+1, true);
                      }
                    } else if (kolomIndex < kolommen.length - 1) {
                      btn = $($(kolommen[kolomIndex + 1]).find('button'));
                      if (btn.hasClass('btn-grayed') && !btn.is(':disabled')) {
                        scope.$selectPane(+1, true);
                      } else {
                        calcPos = btn;
                      }
                    } else {
                      calcPos = $($(rijen[rijIndex + 1]).children()[0]).find('button');
                    }
                  } else if (e === 38) {
                    if (rijIndex > 0) {
                      btn = $($(rijen[rijIndex - 1]).children()[kolomIndex]).find('button');
                      if (btn.hasClass('btn-grayed') && !btn.is(':disabled')) {
                        scope.$selectPane(-1, true);
                      } else {
                        calcPos = btn;
                      }
                    } else {
                      scope.$selectPane(-1, true);
                    }
                  } else if (e === 40) {
                    if (rijIndex < rijen.length - 1) {
                      btn = $($(rijen[rijIndex + 1]).children()[kolomIndex]).find('button');
                      if (btn.hasClass('btn-grayed') && !btn.is(':disabled')) {
                        scope.$selectPane(+1, true);
                      } else {
                        calcPos = btn;
                      }
                    } else {
                      if (calcFirst()) {
                        scope.$selectPane(+1, true);
                      }
                    }
                  }
                  if (calcPos && !calcPos.is(':disabled')) {
                    setFocusButton(calcPos);
                  }
                }
              }

              /*
              * when trigger is focus we open the datepicker on focus.
              */

              if (attr.trigger && attr.trigger === 'focus') {
                content.bind('focus', function () {
                  safeApply(scope, function () {
                    scope.$show();
                  });
                });
              }

              /*
              * function to check if the ngmodel is changed.
              */
              /* scope.$watch('$parent.'+ attr.ngModel, function(newVal,oldval) {
                 if(angular.isDate(newVal) && newVal != 'Invalid Date'){
                   if(!dateCalculator.isSameDate(new Date(newVal),new Date(oldval))){
                     addTime(newVal,oldval);
                   }
                   //content.trigger('valueChanged',[dateCalculator.format(newVal, 'dd/mm/yyyy')]);
                   $directive.selectedDate =  newVal;
                   $directive.viewDate = newVal;
                 }
               }, true);*/



              // labels for the days you can make this variable //
              var dayLabels = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
              // -- create the labels  --/
              scope.labels = [];
              // Add a watch to know when input changes from the outside //

              // -- check if we are using a touch device  --/
              var isDateSupported = function () {
                var i = document.createElement('input');
                i.setAttribute('type', 'date');
                return i.type !== 'text';
              };

              var isNative = /(ip(a|o)d|iphone|android)/ig.test($window.navigator.userAgent);
              var isTouch = ('createTouch' in $window.document) && isNative && isDateSupported();

              clickable.bind('mousedown touch', function () {
                safeApply(scope, function () {
                  if ($directive.disabled !== true) {
                    if (isTouch) {
                      element.find('input[type=date]:first').focus();
                      element.find('input[type=date]:first').click();
                    } else {
                      currentSelected = null;
                      if ($directive.open) {
                        scope.hide();
                      } else {
                        scope.$show();
                        content.focus();
                      }
                    }
                  }
                });
                return false;
              });

              var options = {
                yearTitleFormat: 'mmmm yyyy',
                dateFormat: 'dd/mm/yyyy'
              };


              scope.$selectPane = function (value, keyboard) {
                $directive.viewDate = new Date(Date.UTC($directive.viewDate.getFullYear() + (($directive.pane.year || 0) * value), $directive.viewDate.getMonth() + (($directive.pane.month || 0) * value), 1));
                scope.build();
                if (keyboard) {
                  setTimeout(function () {
                    var rijen = copyEl.find('tbody').children();
                    if (value === +1) {
                      setFocusButton($(rijen[0]).find('button:not(.btn-grayed):first'));
                    } else if (value === -1) {
                      setFocusButton($(rijen[rijen.length - 1]).find('button:not(.btn-grayed):last'));
                    }
                  }, 50);
                }
              };

              if ($attr.alignsRight) {
                scope.$alignsright = $attr.alignsRight;
              }


              scope.$toggleMode = function () {

                if ($directive.mode >= 0 && $directive.mode <= 1) {
                  $directive.mode += 1;
                } else {
                  $directive.mode = 0;
                }
                setMode($directive.mode);
                scope.build();
              };

              function setMode(mode) {
                if (mode >= 0 && mode <= 2) {
                  $directive.mode = mode;
                } else {
                  $directive.mode = 0;
                }
                $directive.pane = {};
                switch ($directive.mode) {
                  case 0: $directive.pane.month = 1; break;
                  case 1: $directive.pane.month = 12; break;
                  case 2: $directive.pane.year = 12; break;
                }
              }

              /*
              * function to hide the datepicker
              */

              scope.hide = function () {
                if (copyEl) {
                  copyEl.css({ display: 'none' });
                  copyEl.attr('aria-hidden', 'true');
                  $directive.open = 0;
                  copyEl = null;
                  removeListeners();
                  safeApply(scope, function () {
                    // content.click();
                    //content.focus();
                    $directive.open = 0;
                    content.unbind('blur.disable');
                  });
                }
              };

              scope.$disable = function ($event) {
                $event.preventDefault(); return false;
              };

            

              scope.$select = function (date) {
                //addTime(date,scope.ngModel);
                $directive.click = 1;
                $directive.viewDate = date;
                if ($directive.mode === 0) {
                  scope.ngModel = addTime(date,scope.ngModel);
                  scope.hide();
                  setTimeout(function () { content.blur(); }, 0);
                } else if ($directive.mode > 0) {
                  $directive.mode -= 1;
                  setMode($directive.mode);
                  scope.build();
                }
                return false;
              };

              var currentSelected;

              scope.pane = { prev: false, next: false };
              scope.build = function () {
                if ($directive.viewDate === null || $directive.viewDate === undefined) {
                  $directive.viewDate = new Date();
                }

                if (checkBefore($directive.viewDate, scope.minDate)) {
                  scope.pane.prev = true;
                  $directive.viewDate = new Date(scope.minDate);
                } else {
                  scope.pane.prev = false;
                }
                if (checkAfter($directive.viewDate, scope.maxDate)) {
                  scope.pane.next = true;
                  $directive.viewDate = new Date(scope.maxDate);
                } else {
                  scope.pane.next = false;
                }
                scope.labels = [];
                if ($directive.mode === 1) {
                  scope.title = dateCalculator.format($directive.viewDate, 'yyyy');
                  scope.rows = calView.monthInRows($directive.viewDate, scope.minDate, scope.maxDate);
                  scope.showLabels = 0;
                }
                if ($directive.mode === 0) {
                  scope.title = dateCalculator.format($directive.viewDate, options.yearTitleFormat);
                  scope.rows = calView.daysInRows($directive.viewDate, $directive.selectedDate, scope.minDate, scope.maxDate);
                  scope.labels = $sce.trustAsHtml('<th>' + dayLabels.join('</th><th>') + '</th>');
                }
                if ($directive.mode === 2) {
                  var currentYear = parseInt(dateCalculator.format($directive.viewDate, 'yyyy'));
                  scope.title = (currentYear - 11) + '-' + currentYear;
                  scope.rows = calView.yearInRows($directive.viewDate, scope.minDate, scope.maxDate);
                    //setMode(1);
                  }
                };

                function checkBefore(date, before) {
                  if (!angular.isDate(date)) {
                    return false;
                  }
                  if (!angular.isDate(before)) {
                    return false;
                  }
                  var copyDate = new Date(date.getFullYear(), date.getMonth(), 1);
                  var copyBefore = new Date(before.getFullYear(), before.getMonth(), 1);

                  if (dateCalculator.dateBeforeOther(copyBefore, copyDate)) {
                    return true;
                  }
                  return false;
                }

                function checkAfter(date, after) {
                  if (!angular.isDate(date)) {
                    return false;
                  }
                  if (!angular.isDate(after)) {
                    return false;
                  }
                  var copyDate = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0);
                  var copyafter = new Date(after.getFullYear(), after.getMonth(), 1, 0, 0, 0);

                  if (!dateCalculator.dateBeforeOther(copyafter, copyDate) || copyafter.getTime() === copyDate.getTime()) {
                    return true;
                  }
                  return false;
                }

                var fetchPromises = [];
                // -- To load the template for the popup but we can change this ! no html file is better
                // if it is finished we can but it in the javascript file with $cacheTemplate --/
                function haalTemplateOp(template) {
                  // --- if the template already is in our app cache return it. //
                  if (fetchPromises[template]) {
                    return fetchPromises[template];
                  }
                  // --- If not get the template from templatecache or http. //
                  return (fetchPromises[template] = $q.when($templateCache.get(template) || $http.get(template))
                    .then(function (res) {
                      // --- When the template is retrieved return it. //
                      if (angular.isObject(res)) {
                        $templateCache.put(template, res.data);
                        return res.data;
                      }
                      return res;
                  }));
                }

                var templateElem;
                var promise = haalTemplateOp('templates/tinkDatePickerField.html');

                // --- when the data is loaded //
                promise.then(function (template) {
                  if (angular.isObject(template)) {
                    template = template.data;
                  }
                  // --- store the html we retrieved //
                  templateElem = $compile(template);
                  templateElem = templateElem(scope, function () { });
                });
              }
            };
          }
        };
      }]);
    })();