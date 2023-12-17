/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QRCodeException from '../QRCodeException.js';

/**
 * ISO/IEC 18004:2000 Annex E, Table E.1 - Row/column coordinates of center module of Alignment Patterns
 *
 * version -> pattern
 *
 * @type {number[][]|int[][]}
 * @private
 */
const ALIGNMENT_PATTERN = [
	null, // version count starts at 1
	[],
	[6, 18],
	[6, 22],
	[6, 26],
	[6, 30],
	[6, 34],
	[6, 22, 38],
	[6, 24, 42],
	[6, 26, 46],
	[6, 28, 50],
	[6, 30, 54],
	[6, 32, 58],
	[6, 34, 62],
	[6, 26, 46, 66],
	[6, 26, 48, 70],
	[6, 26, 50, 74],
	[6, 30, 54, 78],
	[6, 30, 56, 82],
	[6, 30, 58, 86],
	[6, 34, 62, 90],
	[6, 28, 50, 72,  94],
	[6, 26, 50, 74,  98],
	[6, 30, 54, 78, 102],
	[6, 28, 54, 80, 106],
	[6, 32, 58, 84, 110],
	[6, 30, 58, 86, 114],
	[6, 34, 62, 90, 118],
	[6, 26, 50, 74,  98, 122],
	[6, 30, 54, 78, 102, 126],
	[6, 26, 52, 78, 104, 130],
	[6, 30, 56, 82, 108, 134],
	[6, 34, 60, 86, 112, 138],
	[6, 30, 58, 86, 114, 142],
	[6, 34, 62, 90, 118, 146],
	[6, 30, 54, 78, 102, 126, 150],
	[6, 24, 50, 76, 102, 128, 154],
	[6, 28, 54, 80, 106, 132, 158],
	[6, 32, 58, 84, 110, 136, 162],
	[6, 26, 54, 82, 110, 138, 166],
	[6, 30, 58, 86, 114, 142, 170],
];

/**
 * ISO/IEC 18004:2000 Annex D, Table D.1 - Version information bit stream for each version
 *
 * no version pattern for QR Codes < 7
 *
 * @type {number[]|int[]}
 * @private
 */
const VERSION_PATTERN = [
	null, null, null, null, null, null, null, // no version info patterns < version 7
	0b000111110010010100,
	0b001000010110111100,
	0b001001101010011001,
	0b001010010011010011,
	0b001011101111110110,
	0b001100011101100010,
	0b001101100001000111,
	0b001110011000001101,
	0b001111100100101000,
	0b010000101101111000,
	0b010001010001011101,
	0b010010101000010111,
	0b010011010100110010,
	0b010100100110100110,
	0b010101011010000011,
	0b010110100011001001,
	0b010111011111101100,
	0b011000111011000100,
	0b011001000111100001,
	0b011010111110101011,
	0b011011000010001110,
	0b011100110000011010,
	0b011101001100111111,
	0b011110110101110101,
	0b011111001001010000,
	0b100000100111010101,
	0b100001011011110000,
	0b100010100010111010,
	0b100011011110011111,
	0b100100101100001011,
	0b100101010000101110,
	0b100110101001100100,
	0b100111010101000001,
	0b101000110001101001,
];

/**
 * ISO/IEC 18004:2000 Tables 13-22
 *
 * @see http://www.thonky.com/qr-code-tutorial/error-correction-table
 *
 * @type {Array}
 * @private
 */
const RSBLOCKS = [
	null, // version count starts at 1
	[[ 7, [[ 1,  19], [ 0,   0]]], [10, [[ 1, 16], [ 0,  0]]], [13, [[ 1, 13], [ 0,  0]]], [17, [[ 1,  9], [ 0,  0]]]],
	[[10, [[ 1,  34], [ 0,   0]]], [16, [[ 1, 28], [ 0,  0]]], [22, [[ 1, 22], [ 0,  0]]], [28, [[ 1, 16], [ 0,  0]]]],
	[[15, [[ 1,  55], [ 0,   0]]], [26, [[ 1, 44], [ 0,  0]]], [18, [[ 2, 17], [ 0,  0]]], [22, [[ 2, 13], [ 0,  0]]]],
	[[20, [[ 1,  80], [ 0,   0]]], [18, [[ 2, 32], [ 0,  0]]], [26, [[ 2, 24], [ 0,  0]]], [16, [[ 4,  9], [ 0,  0]]]],
	[[26, [[ 1, 108], [ 0,   0]]], [24, [[ 2, 43], [ 0,  0]]], [18, [[ 2, 15], [ 2, 16]]], [22, [[ 2, 11], [ 2, 12]]]],
	[[18, [[ 2,  68], [ 0,   0]]], [16, [[ 4, 27], [ 0,  0]]], [24, [[ 4, 19], [ 0,  0]]], [28, [[ 4, 15], [ 0,  0]]]],
	[[20, [[ 2,  78], [ 0,   0]]], [18, [[ 4, 31], [ 0,  0]]], [18, [[ 2, 14], [ 4, 15]]], [26, [[ 4, 13], [ 1, 14]]]],
	[[24, [[ 2,  97], [ 0,   0]]], [22, [[ 2, 38], [ 2, 39]]], [22, [[ 4, 18], [ 2, 19]]], [26, [[ 4, 14], [ 2, 15]]]],
	[[30, [[ 2, 116], [ 0,   0]]], [22, [[ 3, 36], [ 2, 37]]], [20, [[ 4, 16], [ 4, 17]]], [24, [[ 4, 12], [ 4, 13]]]],
	[[18, [[ 2,  68], [ 2,  69]]], [26, [[ 4, 43], [ 1, 44]]], [24, [[ 6, 19], [ 2, 20]]], [28, [[ 6, 15], [ 2, 16]]]],
	[[20, [[ 4,  81], [ 0,   0]]], [30, [[ 1, 50], [ 4, 51]]], [28, [[ 4, 22], [ 4, 23]]], [24, [[ 3, 12], [ 8, 13]]]],
	[[24, [[ 2,  92], [ 2,  93]]], [22, [[ 6, 36], [ 2, 37]]], [26, [[ 4, 20], [ 6, 21]]], [28, [[ 7, 14], [ 4, 15]]]],
	[[26, [[ 4, 107], [ 0,   0]]], [22, [[ 8, 37], [ 1, 38]]], [24, [[ 8, 20], [ 4, 21]]], [22, [[12, 11], [ 4, 12]]]],
	[[30, [[ 3, 115], [ 1, 116]]], [24, [[ 4, 40], [ 5, 41]]], [20, [[11, 16], [ 5, 17]]], [24, [[11, 12], [ 5, 13]]]],
	[[22, [[ 5,  87], [ 1,  88]]], [24, [[ 5, 41], [ 5, 42]]], [30, [[ 5, 24], [ 7, 25]]], [24, [[11, 12], [ 7, 13]]]],
	[[24, [[ 5,  98], [ 1,  99]]], [28, [[ 7, 45], [ 3, 46]]], [24, [[15, 19], [ 2, 20]]], [30, [[ 3, 15], [13, 16]]]],
	[[28, [[ 1, 107], [ 5, 108]]], [28, [[10, 46], [ 1, 47]]], [28, [[ 1, 22], [15, 23]]], [28, [[ 2, 14], [17, 15]]]],
	[[30, [[ 5, 120], [ 1, 121]]], [26, [[ 9, 43], [ 4, 44]]], [28, [[17, 22], [ 1, 23]]], [28, [[ 2, 14], [19, 15]]]],
	[[28, [[ 3, 113], [ 4, 114]]], [26, [[ 3, 44], [11, 45]]], [26, [[17, 21], [ 4, 22]]], [26, [[ 9, 13], [16, 14]]]],
	[[28, [[ 3, 107], [ 5, 108]]], [26, [[ 3, 41], [13, 42]]], [30, [[15, 24], [ 5, 25]]], [28, [[15, 15], [10, 16]]]],
	[[28, [[ 4, 116], [ 4, 117]]], [26, [[17, 42], [ 0,  0]]], [28, [[17, 22], [ 6, 23]]], [30, [[19, 16], [ 6, 17]]]],
	[[28, [[ 2, 111], [ 7, 112]]], [28, [[17, 46], [ 0,  0]]], [30, [[ 7, 24], [16, 25]]], [24, [[34, 13], [ 0,  0]]]],
	[[30, [[ 4, 121], [ 5, 122]]], [28, [[ 4, 47], [14, 48]]], [30, [[11, 24], [14, 25]]], [30, [[16, 15], [14, 16]]]],
	[[30, [[ 6, 117], [ 4, 118]]], [28, [[ 6, 45], [14, 46]]], [30, [[11, 24], [16, 25]]], [30, [[30, 16], [ 2, 17]]]],
	[[26, [[ 8, 106], [ 4, 107]]], [28, [[ 8, 47], [13, 48]]], [30, [[ 7, 24], [22, 25]]], [30, [[22, 15], [13, 16]]]],
	[[28, [[10, 114], [ 2, 115]]], [28, [[19, 46], [ 4, 47]]], [28, [[28, 22], [ 6, 23]]], [30, [[33, 16], [ 4, 17]]]],
	[[30, [[ 8, 122], [ 4, 123]]], [28, [[22, 45], [ 3, 46]]], [30, [[ 8, 23], [26, 24]]], [30, [[12, 15], [28, 16]]]],
	[[30, [[ 3, 117], [10, 118]]], [28, [[ 3, 45], [23, 46]]], [30, [[ 4, 24], [31, 25]]], [30, [[11, 15], [31, 16]]]],
	[[30, [[ 7, 116], [ 7, 117]]], [28, [[21, 45], [ 7, 46]]], [30, [[ 1, 23], [37, 24]]], [30, [[19, 15], [26, 16]]]],
	[[30, [[ 5, 115], [10, 116]]], [28, [[19, 47], [10, 48]]], [30, [[15, 24], [25, 25]]], [30, [[23, 15], [25, 16]]]],
	[[30, [[13, 115], [ 3, 116]]], [28, [[ 2, 46], [29, 47]]], [30, [[42, 24], [ 1, 25]]], [30, [[23, 15], [28, 16]]]],
	[[30, [[17, 115], [ 0,   0]]], [28, [[10, 46], [23, 47]]], [30, [[10, 24], [35, 25]]], [30, [[19, 15], [35, 16]]]],
	[[30, [[17, 115], [ 1, 116]]], [28, [[14, 46], [21, 47]]], [30, [[29, 24], [19, 25]]], [30, [[11, 15], [46, 16]]]],
	[[30, [[13, 115], [ 6, 116]]], [28, [[14, 46], [23, 47]]], [30, [[44, 24], [ 7, 25]]], [30, [[59, 16], [ 1, 17]]]],
	[[30, [[12, 121], [ 7, 122]]], [28, [[12, 47], [26, 48]]], [30, [[39, 24], [14, 25]]], [30, [[22, 15], [41, 16]]]],
	[[30, [[ 6, 121], [14, 122]]], [28, [[ 6, 47], [34, 48]]], [30, [[46, 24], [10, 25]]], [30, [[ 2, 15], [64, 16]]]],
	[[30, [[17, 122], [ 4, 123]]], [28, [[29, 46], [14, 47]]], [30, [[49, 24], [10, 25]]], [30, [[24, 15], [46, 16]]]],
	[[30, [[ 4, 122], [18, 123]]], [28, [[13, 46], [32, 47]]], [30, [[48, 24], [14, 25]]], [30, [[42, 15], [32, 16]]]],
	[[30, [[20, 117], [ 4, 118]]], [28, [[40, 47], [ 7, 48]]], [30, [[43, 24], [22, 25]]], [30, [[10, 15], [67, 16]]]],
	[[30, [[19, 118], [ 6, 119]]], [28, [[18, 47], [31, 48]]], [30, [[34, 24], [34, 25]]], [30, [[20, 15], [61, 16]]]],
];

/**
 * @type {number[]|int[]}
 */
const TOTAL_CODEWORDS = [
	null, // version count starts at 1
	26,
	44,
	70,
	100,
	134,
	172,
	196,
	242,
	292,
	346,
	404,
	466,
	532,
	581,
	655,
	733,
	815,
	901,
	991,
	1085,
	1156,
	1258,
	1364,
	1474,
	1588,
	1706,
	1828,
	1921,
	2051,
	2185,
	2323,
	2465,
	2611,
	2761,
	2876,
	3034,
	3196,
	3362,
	3532,
	3706,
];

/**
 *
 */
export default class Version{

	/**
	 * QR Code version number
	 *
	 * @type {number|int}
	 * @private
	 */
	version;

	/**
	 * Version constructor.
	 *
	 * @param {number|int} $version
	 *
	 * @throws QRCodeException
	 */
	constructor($version){

		if($version < 1 || $version > 40){
			throw new QRCodeException('invalid version given');
		}

		this.version = $version;
	}

	/**
	 * returns the current version number as string
	 *
	 * @returns {string}
	 */
	toString(){
		return this.version + '';
	}

	/**
	 * returns the current version number
	 *
	 * @returns {number|int}
	 */
	getVersionNumber(){
		return this.version;
	}

	/**
	 * the matrix size for the given version
	 *
	 * @returns {number|int}
	 */
	getDimension(){
		return this.version * 4 + 17;
	}

	/**
	 * the version pattern for the given version
	 *
	 * @returns {number|int|null}
	 */
	getVersionPattern(){
		return VERSION_PATTERN[this.version] ?? null;
	}

	/**
	 * the alignment patterns for the current version
	 *
	 * @returns {number[]|int[]}
	 */
	getAlignmentPattern(){
		return ALIGNMENT_PATTERN[this.version];
	}

	/**
	 * returns ECC block information for the given $version and $eccLevel
	 *
	 * @param {EccLevel} $eccLevel
	 *
	 * @returns {Array}
	 */
	getRSBlocks($eccLevel){
		return RSBLOCKS[this.version][$eccLevel.getOrdinal()];
	}

	/**
	 * returns the maximum codewords for the current version
	 *
	 * @returns {number|int}
	 */
	getTotalCodewords(){
		return TOTAL_CODEWORDS[this.version];
	}

}