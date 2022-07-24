/**
 * @created      24.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 *
 * @see https://jamie.build/const
 */

import PHPJS from './PHPJS.js';

/**
 * from EccLevel
 */

// ISO/IEC 18004:2000 Tables 12, 25
const ECC_L = 0b01; // 7%.
const ECC_M = 0b00; // 15%.
const ECC_Q = 0b11; // 25%.
const ECC_H = 0b10; // 30%.

/**
 * from MaskPattern
 */

/** @type {int} */
const MASK_PATTERN_AUTO = -1;

const PATTERN_000 = 0b000;
const PATTERN_001 = 0b001;
const PATTERN_010 = 0b010;
const PATTERN_011 = 0b011;
const PATTERN_100 = 0b100;
const PATTERN_101 = 0b101;
const PATTERN_110 = 0b110;
const PATTERN_111 = 0b111;

/**
 * @type {int[]}
 * @private
 */
const PATTERNS = [
	PATTERN_000,
	PATTERN_001,
	PATTERN_010,
	PATTERN_011,
	PATTERN_100,
	PATTERN_101,
	PATTERN_110,
	PATTERN_111,
];

/**
 * from Mode
 */

// ISO/IEC 18004:2000 Table 2
const MODE_NUMBER   = 0b0001;
const MODE_ALPHANUM = 0b0010;
const MODE_BYTE     = 0b0100;
const MODE_KANJI    = 0b1000;

const MODES = [
	MODE_NUMBER,
	MODE_ALPHANUM,
	MODE_BYTE,
	MODE_KANJI,
];

/**
 * from Version
 */

/** @type {int} */
const VERSION_AUTO = -1;

/**
 * from QRMatrix
 */

/** @type {int} */
const M_NULL       = 0b000000000000;
/** @type {int} */
const M_DARKMODULE = 0b000000000001;
/** @type {int} */
const M_DATA       = 0b000000000010;
/** @type {int} */
const M_FINDER     = 0b000000000100;
/** @type {int} */
const M_SEPARATOR  = 0b000000001000;
/** @type {int} */
const M_ALIGNMENT  = 0b000000010000;
/** @type {int} */
const M_TIMING     = 0b000000100000;
/** @type {int} */
const M_FORMAT     = 0b000001000000;
/** @type {int} */
const M_VERSION    = 0b000010000000;
/** @type {int} */
const M_QUIETZONE  = 0b000100000000;
/** @type {int} */
const M_LOGO       = 0b001000000000;
/** @type {int} */
const M_FINDER_DOT = 0b010000000000;
/** @type {int} */
const M_TEST       = 0b011111111111;
/** @type {int} */
const IS_DARK      = 0b100000000000;

/** @type {int[]} */
const MATRIX_NEIGHBOUR_FLAGS = [
	0b00000001,
	0b00000010,
	0b00000100,
	0b00001000,
	0b00010000,
	0b00100000,
	0b01000000,
	0b10000000,
];

/**
 * Map of flag => coord
 *
 * @see \chillerlan\QRCode\Data\QRMatrix::checkNeighbours()
 *
 * @type {int[][]}
 * @protected
 */
const MATRIX_NEIGHBOURS = PHPJS.array_combine(MATRIX_NEIGHBOUR_FLAGS, [
	[-1, -1],
	[ 0, -1],
	[ 1, -1],
	[ 1,  0],
	[ 1,  1],
	[ 0,  1],
	[-1,  1],
	[-1,  0],
]);

/**
 * from QROutputInterface
 */

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

export {
	ECC_L, ECC_M, ECC_Q, ECC_H,
	MASK_PATTERN_AUTO, PATTERNS, PATTERN_000, PATTERN_001, PATTERN_010,
	PATTERN_011, PATTERN_100, PATTERN_101, PATTERN_110, PATTERN_111,
	MODES, MODE_NUMBER, MODE_ALPHANUM, MODE_BYTE, MODE_KANJI,
	VERSION_AUTO,
	M_NULL, M_DARKMODULE, M_DATA, M_FINDER, M_SEPARATOR, M_ALIGNMENT, M_TIMING,
	M_FORMAT, M_VERSION, M_QUIETZONE, M_LOGO, M_FINDER_DOT, M_TEST, IS_DARK,
	MATRIX_NEIGHBOUR_FLAGS, MATRIX_NEIGHBOURS,
	DEFAULT_MODULE_VALUES, OUTPUT_MODES, OUTPUT_CANVAS, OUTPUT_CUSTOM,
	OUTPUT_MARKUP_SVG, OUTPUT_MARKUP_HTML, OUTPUT_STRING_JSON, OUTPUT_STRING_TEXT,
};
