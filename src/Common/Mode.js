/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import PHPJS from './PHPJS.js';
import QRCodeException from '../QRCodeException.js';
import {MODES} from './constants.js';

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
 * ISO 18004:2006, 6.4.1, Tables 2 and 3
 */
export default class Mode{

	/**
	 * returns the length bits for the version breakpoints 1-9, 10-26 and 27-40
	 *
	 * @param {int} $mode
	 * @param {int} $version
	 *
	 * @returns {int}
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

		if(PHPJS.isset(() => MODE_LENGTH_BITS[$mode])){
			return MODE_LENGTH_BITS[$mode];
		}

		throw new QRCodeException('invalid mode given');
	}

}
