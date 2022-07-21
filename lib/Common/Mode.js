/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QRCodeException from '../QRCodeException';
import AlphaNum from '../Data/AlphaNum';
import Byte from '../Data/Byte';
//import Kanji from '../Data/Kanji';
import Numeric from '../Data/Numeric';
import PHPJS from './PHPJS';

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
 * mode length bits for the version breakpoints 1-9, 10-26 and 27-40
 *
 * ISO/IEC 18004:2000 Table 3 - Number of bits in Character Count Indicator
 */
const MODE_LENGTH_BITS = PHPJS.array_combine(MODES, [
	[10, 12, 14], // Numeric
	[9, 11, 13],  // AlphaNum
	[8, 16, 16],  // Byte
	[8, 10, 12],  // Kanji
]);

/**
 * Map of data mode => interface (detection order)
 *
 * @var string[]
 */
const MODE_INTERFACES = PHPJS.array_combine([
	MODE_NUMBER,
	MODE_ALPHANUM,
//	MODE_KANJI, // we ignore Kanji for now
	MODE_BYTE,
], [
	Numeric,
	AlphaNum,
//	Kanji,
	Byte,
]);


/**
 * ISO 18004:2006, 6.4.1, Tables 2 and 3
 */
class Mode{

	/**
	 * returns the length bits for the version breakpoints 1-9, 10-26 and 27-40
	 *
	 * @param {int} $mode
	 * @param {int} $version
	 *
	 * @throws \chillerlan\QRCode\QRCodeException
	 */
	static getLengthBitsForVersion($mode, $version){

		if(!MODE_LENGTH_BITS[$mode]){
			throw new QRCodeException('invalid mode given');
		}

		let $minVersion  = 0;
		let $breakpoints = [9, 26, 40];

		for(let $key = 0; $key < $breakpoints.length; $key++){
			let $breakpoint = $breakpoints[$key];

			if($version > $minVersion && $version <= $breakpoint){
				return MODE_LENGTH_BITS[$mode][$key];
			}

			$minVersion = $breakpoint;
		}

		throw new QRCodeException('invalid version number: ' + $version);
	}

	/**
	 * returns the array of length bits for the given mode
	 *
	 * @param {int} $mode
	 */
	static getLengthBitsForMode($mode){
		return MODE_LENGTH_BITS[$mode];
	}

}

export {Mode, MODES, MODE_INTERFACES, MODE_NUMBER, MODE_ALPHANUM, MODE_BYTE, MODE_KANJI,};
