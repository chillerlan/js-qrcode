/**
 * @created      14.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {
	QRCode, QROptions, QRStringJSON,
} from '../src/index.js';


let $options = new QROptions;

$options.outputInterface  = QRStringJSON;
$options.version          = 5;
$options.drawLightModules = false;

let $qrcode  = new QRCode($options);

let jsonString = $qrcode.render('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

// object per schema https://raw.githubusercontent.com/chillerlan/php-qrcode/main/src/Output/qrcode.schema.json
console.log(JSON.parse(jsonString));
