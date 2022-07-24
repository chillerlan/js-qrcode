/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QRDataModeAbstract from './QRDataModeAbstract.js';
import {MODE_KANJI} from '../Common/constants.js';

export default class Kanji extends QRDataModeAbstract{

	/**
	 * @inheritDoc
	 */
	datamode = MODE_KANJI;

	/**
	 * @inheritDoc
	 */
	validateStringI($string){
		return Kanji.validateString($string);
	}


}
