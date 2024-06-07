# chillerlan/js-qrcode

A javascript port of [chillerlan/php-qrcode](https://github.com/chillerlan/php-qrcode), a QR Code library based on the [implementation](https://github.com/kazuhikoarase/qrcode-generator) by Kazuhiko Arase.

[![License][license-badge]][license]
[![CodeCov][coverage-badge]][coverage]
[![Build][gh-action-badge]][gh-action]

[license-badge]: https://img.shields.io/github/license/chillerlan/js-qrcode.svg
[license]: https://github.com/chillerlan/js-qrcode/blob/main/LICENSE
[coverage-badge]: https://img.shields.io/codecov/c/github/chillerlan/js-qrcode?logo=codecov&logoColor=ccc
[coverage]: https://codecov.io/github/chillerlan/js-qrcode
[gh-action-badge]: https://img.shields.io/github/actions/workflow/status/chillerlan/js-qrcode/build.yml?branch=main&logo=github&logoColor=ccc
[gh-action]: https://github.com/chillerlan/js-qrcode/actions/workflows/build.yml?query=branch%3Amain

## Documentation

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
