# Tink datepicker Angular directive

v1.1.2

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

3. Add `tink.datepicker` to your app module's dependency.

  `angular.module('myApp', ['tink.datepicker']);`


----------


## How to use

### tink-datepicker

### Component

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

## Contribution guidelines

* If you're not sure, drop us a note
* Fork this repo
* Do your thing
* Create a pull request

## Who do I talk to?

* Jasper Van Proeyen - jasper.vanproeyen@digipolis.be - Lead front-end
* Tom Wuyts - tom.wuyts@digipolis.be - Lead UX
* [The hand](https://www.youtube.com/watch?v=_O-QqC9yM28)

## License

The MIT License (MIT)

Copyright (c) 2014 Stad Antwerpen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
