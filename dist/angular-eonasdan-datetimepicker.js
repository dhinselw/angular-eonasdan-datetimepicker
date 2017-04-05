(function () {
    'use strict';

    var module = angular.module('ae-datetimepicker', []);

    module.directive('datetimepicker', [
        '$timeout',
        function ($timeout) {
            return {
                restrict: 'EA',
                require: 'ngModel',
                scope: {
                    options: '=?',
                    onChange: '&?',
                    onClick: '&?'
                },
                link: function ($scope, $element, $attrs, ngModel) {
                    var dpElement = $element.parent().hasClass('input-group') ? $element.parent() : $element;

                    $scope.$watch('options', function (newValue) {
                        // If no option set, prevent js exception being thrown in map function.
                    	if (newValue === undefined) {
                    		return;
                    	}
                        var dtp = dpElement.data('DateTimePicker');
                        $.map(newValue, function (value, key) {
                            dtp[key](value);
                        });
                    }, true);

                    ngModel.$render = function () {
                        // if value is undefined/null do not do anything, unless some date was set before
                        var currentDate = dpElement.data('DateTimePicker').date();
                        if (!ngModel.$viewValue && currentDate) {
                            dpElement.data('DateTimePicker').clear();
                        } else if (ngModel.$viewValue) {
                            // Model format may be a date representation that is not a moment object, 
                            // e.g a string "2001-01-01". 
                            // Transformations from model->view should not mark field as dirty.
                            // Using $setViewValue here would mark the field as dirty, and any 
                            // parent form also as dirty, which is undesired behaviour in our case.
                            // We want to use the dirty state of forms and fields to detect actual
                            // changes.
                            // We can achieve the same effect with a custom formatter: see below.
                            
                            // otherwise make sure it is moment object
                            //if (!moment.isMoment(ngModel.$viewValue)) {
                            //    ngModel.$setViewValue(moment(ngModel.$viewValue));
                            //}
                            dpElement.data('DateTimePicker').date(ngModel.$viewValue);
                        }
                    };

                    // Use formatter to set view value, as it does not have the side-effect of
                    // setting the view element 'dirty'.
                    ngModel.$formatters.unshift(function(modelValue) {
                        var returnValue;
                        if (modelValue) {
                            if (!moment.isMoment(modelValue)) {
                                returnValue = moment(modelValue);
                            }
                        }
                        return (returnValue) ? returnValue : modelValue;
                    });
                    
                    var isDateEqual = function (d1, d2) {
                        return moment.isMoment(d1) && moment.isMoment(d2) && d1.valueOf() === d2.valueOf();
                    };

                    dpElement.on('dp.change', function (e) {
                        if (!isDateEqual(e.date, ngModel.$viewValue)) {
                            var newValue = e.date === false ? null : e.date;
                            ngModel.$setViewValue(newValue);

                            $timeout(function () {
                                if (typeof $scope.onChange === 'function') {
                                    $scope.onChange();
                                }
                            });
                        }
                    });


                    dpElement.on('click', function () {
                        $timeout(function () {
                            if (typeof $scope.onClick === 'function') {
                                $scope.onClick();
                            }
                        });
                    });

                    dpElement.datetimepicker($scope.options);
                }
            };
        }
    ]);
})();
