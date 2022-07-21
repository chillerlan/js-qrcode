/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

'use strict';

// root
import QRCode from './QRCode';
import QRCodeException from './QRCodeException';
import QROptions from './QROptions';
// Common
import {EccLevel, ECC_L, ECC_M, ECC_Q, ECC_H} from './Common/EccLevel';
import {
	MaskPattern, MASK_PATTERN_AUTO, PATTERNS, PATTERN_000, PATTERN_001, PATTERN_010,
	PATTERN_011, PATTERN_100, PATTERN_101, PATTERN_110, PATTERN_111
} from './Common/MaskPattern';
import {Version, VERSION_AUTO} from './Common/Version';
// Data
import AlphaNum from './Data/AlphaNum';
import Byte from './Data/Byte';
//import Kanji from './Data/Kanji';
import Numeric from './Data/Numeric';
import QRCodeDataException from './Data/QRCodeDataException';
import QRDataModeInterface from './Data/QRDataModeInterface';
import {
	QRMatrix, M_NULL, M_DARKMODULE, M_DATA, M_FINDER, M_SEPARATOR, M_ALIGNMENT, M_TIMING,
	M_FORMAT, M_VERSION, M_QUIETZONE, M_LOGO, M_FINDER_DOT, M_TEST, IS_DARK,
	MATRIX_NEIGHBOUR_FLAGS, MATRIX_NEIGHBOURS
} from './Data/QRMatrix';
// Output
import QRCanvas from './Output/QRCanvas';
import QRCodeOutputException from './Output/QRCodeOutputException';
import QRMarkup from './Output/QRMarkup';
import QRMarkupHTML from './Output/QRMarkupHTML';
import QRMarkupSVG from './Output/QRMarkupSVG';
import {QROutputAbstract} from './Output/QROutputAbstract';
import {
	QROutputInterface, DEFAULT_MODULE_VALUES, OUTPUT_MODES, OUTPUT_MODE_INTERFACES,
	OUTPUT_MARKUP_SVG, OUTPUT_MARKUP_HTML, OUTPUT_STRING_JSON, OUTPUT_STRING_TEXT, OUTPUT_CUSTOM,
} from './Output/QROutputInterface';
import QRString from './Output/QRString';


export {
	QRCode,
	QRCodeException,
	QROptions,
	EccLevel, ECC_L, ECC_M, ECC_Q, ECC_H,
	MaskPattern, MASK_PATTERN_AUTO, PATTERNS, PATTERN_000, PATTERN_001, PATTERN_010,
		PATTERN_011, PATTERN_100, PATTERN_101, PATTERN_110, PATTERN_111,
	Version, VERSION_AUTO,
	AlphaNum,
	Byte,
	/* Kanji, */
	Numeric,
	QRCodeDataException,
	QRDataModeInterface,
	QRMatrix, M_NULL, M_DARKMODULE, M_DATA, M_FINDER, M_SEPARATOR, M_ALIGNMENT, M_TIMING, M_FORMAT, M_VERSION,
		M_QUIETZONE, M_LOGO, M_FINDER_DOT, M_TEST, IS_DARK, MATRIX_NEIGHBOUR_FLAGS, MATRIX_NEIGHBOURS,
	QRCanvas,
	QRCodeOutputException,
	QRMarkup,
	QRMarkupHTML,
	QRMarkupSVG,
	QROutputAbstract,
	QROutputInterface, DEFAULT_MODULE_VALUES, OUTPUT_MODES, OUTPUT_MODE_INTERFACES, OUTPUT_MARKUP_SVG,
		OUTPUT_MARKUP_HTML, OUTPUT_STRING_JSON, OUTPUT_STRING_TEXT, OUTPUT_CUSTOM,
	QRString
};
