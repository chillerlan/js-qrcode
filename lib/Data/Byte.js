/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QRDataModeAbstract from './QRDataModeAbstract.js';
import PHPJS from '../Common/PHPJS.js';
import {MODE_BYTE} from '../Common/constants.js';

/**
 * Byte mode, ISO-8859-1 or UTF-8
 *
 * ISO/IEC 18004:2000 Section 8.3.4
 * ISO/IEC 18004:2000 Section 8.4.4
 */
export default class Byte extends QRDataModeAbstract{

	/**
	 * @inheritDoc
	 */
	datamode = MODE_BYTE;

	/**
	 * @inheritDoc
	 */
	getLengthInBits(){
		return this.getCharCount() * 8;
	}

	/**
	 * @inheritDoc
	 */
	static validateString($string){
		return typeof $string === 'string' && !!$string.length;
	}

	/**
	 * @inheritDoc
	 */
	validateStringI($string){
		return Byte.validateString($string);
	}

	/**
	 * @inheritDoc
	 */
	write($bitBuffer, $versionNumber){
		let $len  = this.getCharCount();
		let $data = this.data.split('');

		$bitBuffer
			.put(this.datamode, 4)
			.put($len, this.getLengthBitsForVersion($versionNumber))
		;

		let $i = 0;

		while($i < $len){
			$bitBuffer.put(PHPJS.ord($data[$i]), 8);
			$i++;
		}

	}

}
