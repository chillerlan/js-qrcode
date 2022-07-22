/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QRCodeDataException from './QRCodeDataException.js';
import QRDataModeInterface from './QRDataModeInterface.js';

/**
 * @abstract
 */
export default class QRDataModeAbstract extends QRDataModeInterface{

	/**
	 * the current data mode: Num, Alphanum, Kanji, Byte
	 *
	 * @type {int}
	 * @abstract
	 */
	datamode;

	/**
	 * The data to write
	 *
	 * @type {string}
	 */
	data;

	/**
	 * QRDataModeAbstract constructor.
	 *
	 * @param {string} $data
	 *
	 * @throws \chillerlan\QRCode\Data\QRCodeDataException
	 */
	constructor($data){
		super(); // JS dum

		if(!this.validateStringI($data)){
			throw new QRCodeDataException('invalid data');
		}

		this.data = $data;
	}

	/**
	 * returns the character count of the $data string
	 *
	 * @returns {int}
	 */
	getCharCount(){
		return this.data.length;
	}

	/**
	 * returns the current data mode constant
	 *
	 * @inheritDoc
	 *
	 * @returns {int}
	 */
	getDataMode(){
		return this.datamode;
	}

}
