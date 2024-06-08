/**
 * @created      14.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {
	QRCode, QROptions, QRStringText,
	M_FINDER_DARK, M_FINDER, M_FINDER_DOT, M_ALIGNMENT_DARK, M_ALIGNMENT, M_TIMING_DARK, M_TIMING,
	M_FORMAT_DARK, M_FORMAT, M_VERSION_DARK, M_VERSION, M_DARKMODULE, M_DATA_DARK, M_DATA, M_QUIETZONE, M_SEPARATOR,
} from '../src/index.js';


let mv = {};

mv[M_FINDER_DARK]    = QRStringText.ansi8('██', 124);
mv[M_FINDER]         = QRStringText.ansi8('░░', 124);
mv[M_FINDER_DOT]     = QRStringText.ansi8('██', 124);
mv[M_ALIGNMENT_DARK] = QRStringText.ansi8('██', 2);
mv[M_ALIGNMENT]      = QRStringText.ansi8('░░', 2);
mv[M_TIMING_DARK]    = QRStringText.ansi8('██', 184);
mv[M_TIMING]         = QRStringText.ansi8('░░', 184);
mv[M_FORMAT_DARK]    = QRStringText.ansi8('██', 200);
mv[M_FORMAT]         = QRStringText.ansi8('░░', 200);
mv[M_VERSION_DARK]   = QRStringText.ansi8('██', 21);
mv[M_VERSION]        = QRStringText.ansi8('░░', 21);
mv[M_DARKMODULE]     = QRStringText.ansi8('██', 53);
mv[M_DATA_DARK]      = QRStringText.ansi8('██', 166);
mv[M_DATA]           = QRStringText.ansi8('░░', 166);
mv[M_QUIETZONE]      = QRStringText.ansi8('░░', 253);
mv[M_SEPARATOR]      = QRStringText.ansi8('░░', 253);


let $options = new QROptions;

$options.outputInterface = QRStringText;
$options.version         = 3;
$options.quietzoneSize   = 2;
$options.moduleValues    = mv;

let $qrcode  = new QRCode($options);

console.log($qrcode.render('https://www.youtube.com/watch?v=dQw4w9WgXcQ'));
