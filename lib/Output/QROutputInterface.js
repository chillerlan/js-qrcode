/**
 * @created      14.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QRCanvas from './QRCanvas.js';
import QRMarkupHTML from './QRMarkupHTML.js';
import QRMarkupSVG from './QRMarkupSVG.js';
import QRString from './QRString.js';
import PHPJS from '../Common/PHPJS.js';
import {
	IS_DARK, M_ALIGNMENT, M_DARKMODULE, M_DATA, M_FINDER, M_FINDER_DOT, M_FORMAT,
	M_LOGO, M_NULL, M_QUIETZONE, M_SEPARATOR, M_TEST, M_TIMING, M_VERSION,
} from '../Data/QRMatrix.js';

const OUTPUT_CUSTOM      = 'custom';

const OUTPUT_MARKUP_HTML = 'html';
const OUTPUT_MARKUP_SVG  = 'svg';
const OUTPUT_STRING_JSON = 'json';
const OUTPUT_STRING_TEXT = 'text';
const OUTPUT_CANVAS      = 'canvas';

const OUTPUT_MODES = [
	OUTPUT_MARKUP_SVG ,
	OUTPUT_MARKUP_HTML,
	OUTPUT_STRING_JSON,
	OUTPUT_STRING_TEXT,
	OUTPUT_CANVAS
];
/**
 * Map of built-in output modes => modules
 */
const OUTPUT_MODE_INTERFACES = PHPJS.array_combine(OUTPUT_MODES, [
	QRMarkupSVG,
	QRMarkupHTML,
	QRString,
	QRString,
	QRCanvas,
]);

/**
 * @type {int[]}
 * @internal
 */
const MODULE_VALUES_KEYS = [
	// light
	M_NULL,
	M_DATA,
	M_FINDER,
	M_SEPARATOR,
	M_ALIGNMENT,
	M_TIMING,
	M_FORMAT,
	M_VERSION,
	M_QUIETZONE,
	M_LOGO,
	M_TEST,
	// dark
	M_DARKMODULE | IS_DARK,
	M_DATA | IS_DARK,
	M_FINDER | IS_DARK,
	M_ALIGNMENT | IS_DARK,
	M_TIMING | IS_DARK,
	M_FORMAT | IS_DARK,
	M_VERSION | IS_DARK,
	M_FINDER_DOT | IS_DARK,
	M_TEST | IS_DARK,
];

const DEFAULT_MODULE_VALUES = PHPJS.array_combine(MODULE_VALUES_KEYS, [
	// light
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	false,
	// dark
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
	true,
]);


/**
 * @interface
 */
class QROutputInterface{

	/**
	 * generates the output, optionally dumps it to a file, and returns it
	 *
	 * @param {string|null} $file
	 * @return mixed
	 * @abstract
	 */
	dump($file = null){}

}

export {
	/*QROutputInterface,*/ DEFAULT_MODULE_VALUES, OUTPUT_MODES, OUTPUT_MODE_INTERFACES,
	OUTPUT_MARKUP_SVG, OUTPUT_MARKUP_HTML, OUTPUT_STRING_JSON, OUTPUT_STRING_TEXT, OUTPUT_CUSTOM,
}
