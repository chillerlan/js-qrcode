/**
 * @created      14.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {IS_DARK, M_ALIGNMENT, M_FINDER, M_FINDER_DOT, QRCode, QROptions} from '../dist/js-qrcode-node-src.cjs';

let $options = new QROptions();

$options.imageBase64 = false;
// if set to true, the light modules won't be rendered
$options.imageTransparent = false;
// empty the default value to remove the fill* attributes from the <path> elements
$options.markupDark = '';
$options.markupLight = '';
// draw the modules as circles isntead of squares
$options.drawCircularModules = true;
$options.circleRadius = 0.4;
// connect paths
$options.connectPaths = true;
// keep modules of thhese types as square
$options.keepAsSquare = [
	M_FINDER|IS_DARK,
	M_FINDER_DOT,
	M_ALIGNMENT|IS_DARK,
];
// https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient
$options.svgDefs = '<linearGradient id="rainbow" x1="100%" y2="100%">\n'
                   + '<stop stop-color="#e2453c" offset="2.5%"/>\n'
                   + '<stop stop-color="#e07e39" offset="21.5%"/>\n'
                   + '<stop stop-color="#e5d667" offset="40.5%"/>\n'
                   + '<stop stop-color="#51b95b" offset="59.5%"/>\n'
                   + '<stop stop-color="#1e72b7" offset="78.5%"/>\n'
                   + '<stop stop-color="#6f5ba7" offset="97.5%"/>\n'
                   + '</linearGradient>\n'
                   + '<style><![CDATA[\n'
                   + '.dark{fill: url(#rainbow);}\n'
                   + '.light{fill: #eee;}\n'
                   + ']]></style>';

let $qrcode  = new QRCode($options);

console.log($qrcode.render('https://www.youtube.com/watch?v=dQw4w9WgXcQ'));
