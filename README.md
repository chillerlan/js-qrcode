# chillerlan/js-qrcode

A javascript port of [chillerlan/php-qrcode](https://github.com/chillerlan/php-qrcode), a QR Code library based on the [implementation](https://github.com/kazuhikoarase/qrcode-generator) by Kazuhiko Arase.

[![NPM version][npm-badge]][npm]
[![License][license-badge]][license]
[![CodeCov][coverage-badge]][coverage]
[![Build][gh-action-badge]][gh-action]

[npm-badge]: https://img.shields.io/github/package-json/v/chillerlan/js-qrcode?logo=npm&logoColor=ccc
[npm]: https://github.com/chillerlan/js-qrcode/pkgs/npm/qrcode
[license-badge]: https://img.shields.io/github/license/chillerlan/js-qrcode.svg
[license]: https://github.com/chillerlan/js-qrcode/blob/main/LICENSE
[coverage-badge]: https://img.shields.io/codecov/c/github/chillerlan/js-qrcode?logo=codecov&logoColor=ccc
[coverage]: https://codecov.io/github/chillerlan/js-qrcode
[gh-action-badge]: https://img.shields.io/github/actions/workflow/status/chillerlan/js-qrcode/build.yml?branch=main&logo=github&logoColor=ccc
[gh-action]: https://github.com/chillerlan/js-qrcode/actions/workflows/build.yml?query=branch%3Amain


# Overview

## Features

- Creation of [Model 2 QR Codes](https://www.qrcode.com/en/codes/model12.html), [Version 1 to 40](https://www.qrcode.com/en/about/version.html)
- [ECC Levels](https://www.qrcode.com/en/about/error_correction.html) L/M/Q/H supported
- Mixed mode support (encoding modes can be combined within a QR symbol). Supported modes:
	- numeric
	- alphanumeric
	- 8-bit binary
- Flexible, easily extensible output modules, built-in support for the following output formats:
	- Markup types: SVG, etc.
	- String types: JSON, plain text, etc.
    - Raster image types via [Canvas](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement)


## Documentation

The API is very similar to [the PHP version of this library](https://github.com/chillerlan/php-qrcode), and you can refer to its [documentation](https://php-qrcode.readthedocs.io/) and [examples](https://github.com/chillerlan/php-qrcode/tree/main/examples) for most parts.

Key differences:

- Class constants of the PHP version are regular constants here, e.g. `QRMatrix::M_DATA` becomes `M_DATA`, `Version::AUTO` is `VERSION_AUTO` and `EccLevel:L` to `ECC_L` - see [index.js](https://github.com/chillerlan/js-qrcode/blob/main/src/index.js) for the proper names of all symbols.
- No multimode support for Kanji and Hanzi character sets (handling/converting non-UTF8 strings in javascript is a mess), no [ECI](https://en.wikipedia.org/wiki/Extended_Channel_Interpretation) support for the same reason.
- save-to-file is not supported. You can re-implement the method `QROutputAbstract::saveToFile()` in case you need it. It's called internally, but it has no function.
- No QR Code reader included
- The usual javascript quirks:
	- the internal structure of some classes may deviate from their PHP counterparts
	- key-value arrays become objects, causing inconsistent return values in some cases, not to mention the inconsistent loop types for each (pun intended)
	- numbers may act strange
	- magic getters and setters come with downsides, [see this comment](https://github.com/chillerlan/js-qrcode/blob/76a7a8db1b6e39d09a09f2091a830dcd7d98e9ff/src/QROptions.js#L352-L412)

An API documentation created with [jsdoc](https://github.com/jsdoc/jsdoc) can be found at https://chillerlan.github.io/js-qrcode/ (WIP).


### Quickstart

Server-side, in nodejs:
```js
import {QRCode} from './dist/js-qrcode-node-src.cjs';

let data   = 'otpauth://totp/test?secret=B3JX4VCVJDVNXNZ5&issuer=chillerlan.net';
let qrcode = (new QRCode()).render(data);

// do stuff
console.log(qrcode);
```

Client-side, in a webbrowser:
```html
<div id="qrcode-container"></div>
<script type="module">
	import {QRCode} from './dist/js-qrcode-es6-src.js';
	
	// an SVG image as base64 data URI will be returned by default
	let qrcode = (new QRCode()).render('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

	// append it to the DOM
	let img = document.createElement('img');
	img.alt = 'QRCode';
	img.src = qrcode
	
	document.getElementById('qrcode-container').appendChild(img);
</script>
```
<p align="center">
	<img alt="QR codes are awesome!" style="width: auto; height: 530px;" src="https://raw.githubusercontent.com/chillerlan/php-qrcode/main/.github/images/example.svg">
</p>

Have a look [in the examples folder](https://github.com/chillerlan/js-qrcode/tree/main/examples) for some more usage examples.


#### License notice
Parts of this code are ported to js (via php) from the [ZXing project](https://github.com/zxing/zxing) and licensed under the [Apache License, Version 2.0](./NOTICE).


#### Trademark Notice

The word "QR Code" is a registered trademark of *DENSO WAVE INCORPORATED*<br>
https://www.qrcode.com/en/faq.html#patentH2Title
