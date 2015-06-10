# Tink datepicker Angular directive

v1.1.3

## What is this repository for?

The Tink datepicker Angular directive gives your date input field a nice datepicker.

Tink is an in-house developed easy-to-use front-end framework for quick prototyping and simple deployment of all kinds of websites and apps, keeping a uniform and consistent look and feel.

## Setup

### Prerequisites

* nodeJS [http://nodejs.org/download/](http://nodejs.org/download/)
* bower: `npm install -g bower`

### Install

1. Go to the root of your project and type the following command in your terminal:

   `bower install tink-datepicker-angular --save`

2. Add the following files to your project:

   `<link rel="stylesheet" href="bower_components/tink-core/dist/tink.css" />` (or one of the Tink themes)

   `<script src="bower_components/tink-datepicker-angular/dist/tink-datepicker-angular.js"></script>`

   `<script src="bower_components/tink-helper-date-angular/dist/tink-helper-date-angular.js"></script>`

   `<script src="bower_components/tink-helper-format-angular/dist/tink-helper-format-angular.js"></script>`

   `<script src="bower_components/tink-helper-safe-apply-angular/dist/tink-helper-safe-apply-angular.js"></script>`

3. Add `tink.datepicker` to your app module's dependency.

   `angular.module('myApp', ['tink.datepicker']);`



----------



## How to use

### tink-datepicker

To use this directive you have to add `tink-datepicker` to the input field of your choice.
Do not forget to add a `data-ng-model` attribute to the input field. Otherwise it will not work.

To retrieve the selected date, retrieve the `data-ng-model value in the controller.

```html
<data-tink-datepicker data-ng-model="selectedDate"></data-tink-datepicker>
```

### Options

Attr | Type | Default | Details
--- | --- | --- | ---
data-max-date | `date` | `null` | When a date cannot be larger then the given max date.
data-min-date | `date` | `null` | When a date cannot be minor then the given min date.
data-ng-model | `date` | `null` | The date value.
data-is-disabled | `boolean` | `false` | When the input field is disabled.

###Example

A working example can be found in [the Tink documentation](http://tink.digipolis.be/#/docs/directives/datepicker#example).

## Contribution guidelines

* If you're not sure, drop us a note
* Fork this repo
* Do your thing
* Create a pull request

## Who do I talk to?

* Jasper Van Proeyen - jasper.vanproeyen@digipolis.be - Lead front-end
* Tom Wuyts - tom.wuyts@digipolis.be - Lead UX
* [The hand](https://www.youtube.com/watch?v=_O-QqC9yM28)
