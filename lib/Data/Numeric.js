/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QRDataModeAbstract from './QRDataModeAbstract.js';
import PHPJS from '../Common/PHPJS.js';
import {MODE_NUMBER} from '../Common/constants.js';

const NUMBER_TO_ORD = {'0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9};

/**
 * Numeric mode: decimal digits 0 to 9
 *
 * ISO/IEC 18004:2000 Section 8.3.2
 * ISO/IEC 18004:2000 Section 8.4.2
 */
export default class Numeric extends QRDataModeAbstract{

	/**
	 * @inheritDoc
	 */
	datamode = MODE_NUMBER;

	/**
	 * @inheritDoc
	 */
	getLengthInBits(){
		return Math.ceil(this.getCharCount() * (10 / 3));
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
			if(typeof NUMBER_TO_ORD[$chr] === 'undefined'){
				return false;
			}
		}

		return true;
	}

	/**
	 * @inheritDoc
	 */
	validateStringI($string){
		return Numeric.validateString($string);
	}

	/**
	 * @inheritDoc
	 */
	write($bitBuffer, $versionNumber){
		let $len = this.getCharCount();

		$bitBuffer
			.put(this.datamode, 4)
			.put($len, this.getLengthBitsForVersion($versionNumber))
		;

		let $i = 0;

		// encode numeric triplets in 10 bits
		while($i + 2 < $len){
			$bitBuffer.put(this.parseInt(this.data.substring($i, 3)), 10);
			$i += 3;
		}

		if($i < $len){

			// encode 2 remaining numbers in 7 bits
			if(($len - $i) === 2){
				$bitBuffer.put(this.parseInt(this.data.substring($i, 2)), 7);
			}
			// encode one remaining number in 4 bits
			else if(($len - $i) === 1){
				$bitBuffer.put(this.parseInt(this.data.substring($i, 1)), 4);
			}

		}

	}

	/**
	 * get the code for the given numeric string
	 *
	 * @param {string} $string
	 * @returns {int}
	 * @private
	 */
	parseInt($string){
		let $num = 0;
		let $chars = $string.split('');

		for(let $chr of $chars){
			$num = $num * 10 + PHPJS.ord($chr) - 48;
		}

		return $num;
	}

}
