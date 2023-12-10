/**
 * @created      14.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {
	QRCode, QROptions, OUTPUT_STRING_TEXT
} from '../dist/js-qrcode-node-src.cjs';

let $options = new QROptions;

$options.outputType = OUTPUT_STRING_TEXT;

let $qrcode  = new QRCode($options);

console.log($qrcode.render('https://www.youtube.com/watch?v=dQw4w9WgXcQ'));
