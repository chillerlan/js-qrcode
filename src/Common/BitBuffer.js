/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import PHPJS from './PHPJS.js';
import QRCodeException from '../QRCodeException.js';

/**
 * Holds the raw binary data
 */
export default class BitBuffer{

	/**
	 * The buffer content
	 *
	 * @type {Array}
	 */
	buffer = [];

	/**
	 * Length of the content (bits)
	 *
	 * @type {int}
	 */
	length = 0;

	/**
	 * BitBuffer constructor.
	 *
	 * @param {int[]|null} $bytes
	 */
	constructor($bytes = null){
		this.buffer = $bytes || [];
		this.length = this.buffer.length;
	}

	/**
	 * appends a sequence of bits
	 *
	 * @param {int} $bits
	 * @param {int} $length
	 *
	 * @returns {BitBuffer}
	 */
	put($bits, $length){

		for(let $i = 0; $i < $length; $i++){
			this.putBit((($bits >> ($length - $i - 1)) & 1) === 1);
		}

		return this;
	}

	/**
	 * appends a single bit
	 *
	 * @param {boolean} $bit
	 *
	 * @returns {BitBuffer}
	 */
	putBit($bit){
		let $bufIndex = PHPJS.intval(Math.floor(this.length / 8));

		if(this.buffer.length <= $bufIndex){
			this.buffer.push(0);
		}

		if($bit === true){
			this.buffer[$bufIndex] |= (0x80 >> (this.length % 8));
		}

		this.length++;

		return this;
	}

	/**
	 * returns the current buffer length
	 *
	 * @returns {int}
	 */
	getLength(){
		return this.length;
	}

	/**
	 * returns the buffer content
	 *
	 * @returns {Array}
	 */
	getBuffer(){
		return this.buffer;
	}

	/**
	 * clears the buffer
	 *
	 * @returns {BitBuffer}
	 */
	clear(){
		this.buffer    = [];
		this.length    = 0;

		return this;
	}

}
