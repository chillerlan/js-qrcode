/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QRDataModeAbstract from './QRDataModeAbstract.js';
import {MODE_ALPHANUM} from '../Common/constants.js';

/**
 * ISO/IEC 18004:2000 Table 5
 *
 * @type {{}}
 */
const CHAR_TO_ORD = {
	'0':  0, '1':  1, '2':  2, '3':  3, '4':  4, '5':  5, '6':  6, '7':  7,
	'8':  8, '9':  9, 'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15,
	'G': 16, 'H': 17, 'I': 18, 'J': 19, 'K': 20, 'L': 21, 'M': 22, 'N': 23,
	'O': 24, 'P': 25, 'Q': 26, 'R': 27, 'S': 28, 'T': 29, 'U': 30, 'V': 31,
	'W': 32, 'X': 33, 'Y': 34, 'Z': 35, ' ': 36, '$': 37, '%': 38, '*': 39,
	'+': 40, '-': 41, '.': 42, '/': 43, ':': 44,
};

/**
 * Alphanumeric mode: 0 to 9, A to Z, space, $ % * + - . / :
 *
 * ISO/IEC 18004:2000 Section 8.3.3
 * ISO/IEC 18004:2000 Section 8.4.3
 */
export default class AlphaNum extends QRDataModeAbstract{

	/**
	 * @inheritDoc
	 */
	datamode = MODE_ALPHANUM;

	/**
	 * @inheritDoc
	 */
	getLengthInBits(){
		return Math.ceil(this.getCharCount() * (11 / 2));
	}

	/**
	 * @inheritDoc
	 */
	static validateString($string){

		if(typeof $string !== 'string' || !$string.length){
			return false;
		}

		let $chars = $string.split('');

		for(let $chr of $chars){
			if(typeof CHAR_TO_ORD[$chr] === 'undefined'){
				return false;
			}
		}

		return true;
	}

	/**
	 * @inheritDoc
	 */
	validateStringI($string){
		return AlphaNum.validateString($string);
	}

	/**
	 * @inheritDoc
	 */
	write($bitBuffer, $versionNumber){
		let $len = this.getCharCount();
		let $i;

		$bitBuffer
			.put(this.datamode, 4)
			.put($len, this.getLengthBitsForVersion($versionNumber))
		;

		// encode 2 characters in 11 bits
		for($i = 0; $i + 1 < $len; $i += 2){
			$bitBuffer.put(CHAR_TO_ORD[this.data[$i]] * 45 + CHAR_TO_ORD[this.data[$i + 1]], 11);
		}

		// encode a remaining character in 6 bits
		if($i < $len){
			$bitBuffer.put(CHAR_TO_ORD[this.data[$i]], 6);
		}
	}

}
