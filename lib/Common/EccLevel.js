/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QRCodeException from '../QRCodeException.js';
import PHPJS from './PHPJS.js';
import {ECC_H, ECC_L, ECC_M, ECC_Q} from './constants.js';

const ECC_LEVELS = [ECC_L, ECC_M, ECC_Q, ECC_H];

/**
 * ISO/IEC 18004:2000 Tables 7-11 - Number of symbol characters and input data capacity for versions 1 to 40
 *
 * @type {int[][]}
 *
 * @private
 */
const MAX_BITS = [
	//  version  => [L, M, Q, H]  // modules
	[ null,  null,  null,  null], // empty element, count starts at 1
	[  152,   128,   104,    72], //  21
	[  272,   224,   176,   128], //  25
	[  440,   352,   272,   208], //  29
	[  640,   512,   384,   288], //  33
	[  864,   688,   496,   368], //  37
	[ 1088,   864,   608,   480], //  41
	[ 1248,   992,   704,   528], //  45
	[ 1552,  1232,   880,   688], //  49
	[ 1856,  1456,  1056,   800], //  53
	[ 2192,  1728,  1232,   976], //  57
	[ 2592,  2032,  1440,  1120], //  61
	[ 2960,  2320,  1648,  1264], //  65
	[ 3424,  2672,  1952,  1440], //  69 NICE!
	[ 3688,  2920,  2088,  1576], //  73
	[ 4184,  3320,  2360,  1784], //  77
	[ 4712,  3624,  2600,  2024], //  81
	[ 5176,  4056,  2936,  2264], //  85
	[ 5768,  4504,  3176,  2504], //  89
	[ 6360,  5016,  3560,  2728], //  93
	[ 6888,  5352,  3880,  3080], //  97
	[ 7456,  5712,  4096,  3248], // 101
	[ 8048,  6256,  4544,  3536], // 105
	[ 8752,  6880,  4912,  3712], // 109
	[ 9392,  7312,  5312,  4112], // 113
	[10208,  8000,  5744,  4304], // 117
	[10960,  8496,  6032,  4768], // 121
	[11744,  9024,  6464,  5024], // 125
	[12248,  9544,  6968,  5288], // 129
	[13048, 10136,  7288,  5608], // 133
	[13880, 10984,  7880,  5960], // 137
	[14744, 11640,  8264,  6344], // 141
	[15640, 12328,  8920,  6760], // 145
	[16568, 13048,  9368,  7208], // 149
	[17528, 13800,  9848,  7688], // 153
	[18448, 14496, 10288,  7888], // 157
	[19472, 15312, 10832,  8432], // 161
	[20528, 15936, 11408,  8768], // 165
	[21616, 16816, 12016,  9136], // 169
	[22496, 17728, 12656,  9776], // 173
	[23648, 18672, 13328, 10208], // 177
];

/**
 * ISO/IEC 18004:2000 Section 8.9 - Format Information
 *
 * ECC level -> mask pattern
 *
 * @type {int[][]}
 *
 * @private
 */
const FORMAT_PATTERN = [
	[ // L
		0b111011111000100,
		0b111001011110011,
		0b111110110101010,
		0b111100010011101,
		0b110011000101111,
		0b110001100011000,
		0b110110001000001,
		0b110100101110110,
	],
	[ // M
		0b101010000010010,
		0b101000100100101,
		0b101111001111100,
		0b101101101001011,
		0b100010111111001,
		0b100000011001110,
		0b100111110010111,
		0b100101010100000,
	],
	[ // Q
		0b011010101011111,
		0b011000001101000,
		0b011111100110001,
		0b011101000000110,
		0b010010010110100,
		0b010000110000011,
		0b010111011011010,
		0b010101111101101,
	],
	[ // H
		0b001011010001001,
		0b001001110111110,
		0b001110011100111,
		0b001100111010000,
		0b000011101100010,
		0b000001001010101,
		0b000110100001100,
		0b000100000111011,
	],
];


/**
 * This class encapsulates the four error correction levels defined by the QR code standard.
 */
export default class EccLevel{

	/**
	 * The current ECC level value
	 *
	 * L: 0b01
	 * M: 0b00
	 * Q: 0b11
	 * H: 0b10
	 *
	 * @type {int}
	 * @private
	 */
	eccLevel;

	/**
	 * @param {int} $eccLevel containing the two bits encoding a QR Code's error correction level
	 *
	 * @throws \chillerlan\QRCode\QRCodeException
	 */
	constructor($eccLevel){

		if((0b11 & $eccLevel) !== $eccLevel){
			throw new QRCodeException('invalid ECC level');
		}

		this.eccLevel = $eccLevel;
	}

	/**
	 * returns the string representation of the current ECC level
	 *
	 * @returns {string}
	 */
	toString(){
		return PHPJS.array_combine(ECC_LEVELS, ['L', 'M', 'Q', 'H'])[this.eccLevel];
	}

	/**
	 * returns the current ECC level
	 *
	 * @returns {int}
	 */
	getLevel(){
		return this.eccLevel;
	}

	/**
	 * returns the ordinal value of the current ECC level
	 *
	 * references to the keys of the following tables:
	 *
	 * @see \chillerlan\QRCode\Common\EccLevel::MAX_BITS
	 * @see \chillerlan\QRCode\Common\EccLevel::FORMAT_PATTERN
	 * @see \chillerlan\QRCode\Common\Version::RSBLOCKS
	 */
	getOrdinal(){
		return PHPJS.array_combine(ECC_LEVELS, [0, 1, 2, 3])[this.eccLevel];
	}

	/**
	 * returns the format pattern for the given $eccLevel and $maskPattern
	 *
	 * @param {MaskPattern} $maskPattern
	 *
	 * @returns {int}
	 */
	getformatPattern($maskPattern){
		return FORMAT_PATTERN[this.getOrdinal()][$maskPattern.getPattern()];
	}

	/**
	 * @returns {int[]} an array with the max bit lengths for version 1-40 and the current ECC level
	 */
	getMaxBits(){
		let $v = [];
		let $c = this.getOrdinal();

		for(let $k in MAX_BITS){
			$v.push(MAX_BITS[$k][$c]);
		}

		return $v;
	}

}
