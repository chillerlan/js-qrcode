/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QRCodeException from '../QRCodeException.js';
import PHPJS from './PHPJS.js';
import {MODES} from './constants.js';

/**
 * ISO/IEC 18004:2000 Annex E, Table E.1 - Row/column coordinates of center module of Alignment Patterns
 *
 * version -> pattern
 *
 * @type {int[][]}
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
 * @type {int[]}
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
 * ISO/IEC 18004:2000 Tables 7-11 - Number of symbol characters and input data capacity for versions 1 to 40
 *
 * @see http://www.qrcode.com/en/about/version.html
 *
 * @type {int[][][]}
 * @private
 */
const MAX_LENGTH =[
	null, // version count starts at 1
	// v  => [NUMERIC => [L, M, Q, H], ALPHANUM => [L, M, Q, H], BINARY => [L, M, Q, H], KANJI => [L, M, Q, H]]
	[[  41,   34,   27,   17], [  25,   20,   16,   10], [  17,   14,   11,    7], [  10,    8,    7,    4]],
	[[  77,   63,   48,   34], [  47,   38,   29,   20], [  32,   26,   20,   14], [  20,   16,   12,    8]],
	[[ 127,  101,   77,   58], [  77,   61,   47,   35], [  53,   42,   32,   24], [  32,   26,   20,   15]],
	[[ 187,  149,  111,   82], [ 114,   90,   67,   50], [  78,   62,   46,   34], [  48,   38,   28,   21]],
	[[ 255,  202,  144,  106], [ 154,  122,   87,   64], [ 106,   84,   60,   44], [  65,   52,   37,   27]],
	[[ 322,  255,  178,  139], [ 195,  154,  108,   84], [ 134,  106,   74,   58], [  82,   65,   45,   36]],
	[[ 370,  293,  207,  154], [ 224,  178,  125,   93], [ 154,  122,   86,   64], [  95,   75,   53,   39]],
	[[ 461,  365,  259,  202], [ 279,  221,  157,  122], [ 192,  152,  108,   84], [ 118,   93,   66,   52]],
	[[ 552,  432,  312,  235], [ 335,  262,  189,  143], [ 230,  180,  130,   98], [ 141,  111,   80,   60]],
	[[ 652,  513,  364,  288], [ 395,  311,  221,  174], [ 271,  213,  151,  119], [ 167,  131,   93,   74]],
	[[ 772,  604,  427,  331], [ 468,  366,  259,  200], [ 321,  251,  177,  137], [ 198,  155,  109,   85]],
	[[ 883,  691,  489,  374], [ 535,  419,  296,  227], [ 367,  287,  203,  155], [ 226,  177,  125,   96]],
	[[1022,  796,  580,  427], [ 619,  483,  352,  259], [ 425,  331,  241,  177], [ 262,  204,  149,  109]],
	[[1101,  871,  621,  468], [ 667,  528,  376,  283], [ 458,  362,  258,  194], [ 282,  223,  159,  120]],
	[[1250,  991,  703,  530], [ 758,  600,  426,  321], [ 520,  412,  292,  220], [ 320,  254,  180,  136]],
	[[1408, 1082,  775,  602], [ 854,  656,  470,  365], [ 586,  450,  322,  250], [ 361,  277,  198,  154]],
	[[1548, 1212,  876,  674], [ 938,  734,  531,  408], [ 644,  504,  364,  280], [ 397,  310,  224,  173]],
	[[1725, 1346,  948,  746], [1046,  816,  574,  452], [ 718,  560,  394,  310], [ 442,  345,  243,  191]],
	[[1903, 1500, 1063,  813], [1153,  909,  644,  493], [ 792,  624,  442,  338], [ 488,  384,  272,  208]],
	[[2061, 1600, 1159,  919], [1249,  970,  702,  557], [ 858,  666,  482,  382], [ 528,  410,  297,  235]],
	[[2232, 1708, 1224,  969], [1352, 1035,  742,  587], [ 929,  711,  509,  403], [ 572,  438,  314,  248]],
	[[2409, 1872, 1358, 1056], [1460, 1134,  823,  640], [1003,  779,  565,  439], [ 618,  480,  348,  270]],
	[[2620, 2059, 1468, 1108], [1588, 1248,  890,  672], [1091,  857,  611,  461], [ 672,  528,  376,  284]],
	[[2812, 2188, 1588, 1228], [1704, 1326,  963,  744], [1171,  911,  661,  511], [ 721,  561,  407,  315]],
	[[3057, 2395, 1718, 1286], [1853, 1451, 1041,  779], [1273,  997,  715,  535], [ 784,  614,  440,  330]],
	[[3283, 2544, 1804, 1425], [1990, 1542, 1094,  864], [1367, 1059,  751,  593], [ 842,  652,  462,  365]],
	[[3517, 2701, 1933, 1501], [2132, 1637, 1172,  910], [1465, 1125,  805,  625], [ 902,  692,  496,  385]],
	[[3669, 2857, 2085, 1581], [2223, 1732, 1263,  958], [1528, 1190,  868,  658], [ 940,  732,  534,  405]],
	[[3909, 3035, 2181, 1677], [2369, 1839, 1322, 1016], [1628, 1264,  908,  698], [1002,  778,  559,  430]],
	[[4158, 3289, 2358, 1782], [2520, 1994, 1429, 1080], [1732, 1370,  982,  742], [1066,  843,  604,  457]],
	[[4417, 3486, 2473, 1897], [2677, 2113, 1499, 1150], [1840, 1452, 1030,  790], [1132,  894,  634,  486]],
	[[4686, 3693, 2670, 2022], [2840, 2238, 1618, 1226], [1952, 1538, 1112,  842], [1201,  947,  684,  518]],
	[[4965, 3909, 2805, 2157], [3009, 2369, 1700, 1307], [2068, 1628, 1168,  898], [1273, 1002,  719,  553]],
	[[5253, 4134, 2949, 2301], [3183, 2506, 1787, 1394], [2188, 1722, 1228,  958], [1347, 1060,  756,  590]],
	[[5529, 4343, 3081, 2361], [3351, 2632, 1867, 1431], [2303, 1809, 1283,  983], [1417, 1113,  790,  605]],
	[[5836, 4588, 3244, 2524], [3537, 2780, 1966, 1530], [2431, 1911, 1351, 1051], [1496, 1176,  832,  647]],
	[[6153, 4775, 3417, 2625], [3729, 2894, 2071, 1591], [2563, 1989, 1423, 1093], [1577, 1224,  876,  673]],
	[[6479, 5039, 3599, 2735], [3927, 3054, 2181, 1658], [2699, 2099, 1499, 1139], [1661, 1292,  923,  701]],
	[[6743, 5313, 3791, 2927], [4087, 3220, 2298, 1774], [2809, 2213, 1579, 1219], [1729, 1362,  972,  750]],
	[[7089, 5596, 3993, 3057], [4296, 3391, 2420, 1852], [2953, 2331, 1663, 1273], [1817, 1435, 1024,  784]],
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
 * @type {int[]}
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
	 * @type {int}
	 * @private
	 */
	version;

	/**
	 * Version constructor.
	 *
	 * @param {int} $version
	 *
	 * @throws \chillerlan\QRCode\QRCodeException
	 */
	constructor($version){

		if($version < 1 || $version > 40){
			throw new QRCodeException('invalid version number');
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
	 * @returns {int}
	 */
	getVersionNumber(){
		return this.version;
	}

	/**
	 * the matrix size for the given version
	 *
	 * @returns {int}
	 */
	getDimension(){
		return this.version * 4 + 17;
	}

	/**
	 * the version pattern for the given version
	 *
	 * @returns {int|null}
	 */
	getVersionPattern(){
		return VERSION_PATTERN[this.version] || null;
	}

	/**
	 * the alignment patterns for the current version
	 *
	 * @returns {int[]}
	 */
	getAlignmentPattern(){
		return ALIGNMENT_PATTERN[this.version];
	}

	/**
	 * the maximum character count for the given $mode and $eccLevel
	 *
	 * @param {int} $mode
	 * @param {EccLevel} $eccLevel
	 *
	 * @returns {int|null}
	 * @throws \chillerlan\QRCode\QRCodeException
	 */
	getMaxLengthForMode($mode, $eccLevel){

		let $dataModes = PHPJS.array_combine(MODES, [
			0, // Numeric
			1, // AlphaNum
			2, // Byte
			3, // Kanji
		]);

		if(!$dataModes[$mode]){
			throw new QRCodeException('invalid $mode');
		}

		return MAX_LENGTH[this.version][$dataModes[$mode]][$eccLevel.getOrdinal()] ?? null;
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
	 * @returns {int}
	 */
	getTotalCodewords(){
		return TOTAL_CODEWORDS[this.version];
	}

}