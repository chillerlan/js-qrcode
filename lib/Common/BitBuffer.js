/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import PHPJS from './PHPJS';
import QRCodeException from '../QRCodeException';

/**
 * Holds the raw binary data
 */
export default class BitBuffer{

	/**
	 * The buffer content
	 *
	 * @type {[]}
	 */
	buffer = [];

	/**
	 * Length of the content (bits)
	 *
	 * @type {int}
	 */
	length = 0;

	/**
	 * Read count (bytes)
	 *
	 * @type {int}
	 */
	bytesRead = 0;

	/**
	 * Read count (bits)
	 *
	 * @type {int}
	 */
	bitsRead = 0;

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
	 * @returns {[]}
	 */
	getBuffer(){
		return this.buffer;
	}

	/**
	 * @returns {int} number of bits that can be read successfully
	 */
	available(){
		return 8 * (this.length - this.bytesRead) - this.bitsRead;
	}

	/**
	 * @author Sean Owen, ZXing
	 *
	 * @param {int} $numBits number of bits to read
	 *
	 * @returns {int} representing the bits read. The bits will appear as the least-significant bits of the int
	 * @throws \chillerlan\QRCode\QRCodeException if numBits isn't in [1,32] or more than is available
	 */
	read($numBits){

		if($numBits < 1 || $numBits > 32 || $numBits > this.available()){
			throw new QRCodeException('invalid $numBits: ' + $numBits);
		}

		let $result = 0;

		// First, read remainder from current byte
		if(this.bitsRead > 0){
			let $bitsLeft      = 8 - this.bitsRead;
			let $toRead        = Math.min($numBits, $bitsLeft);
			let $bitsToNotRead = $bitsLeft - $toRead;
			let $mask          = (0xff >> (8 - $toRead)) << $bitsToNotRead;
			$result            = (this.buffer[this.bytesRead] & $mask) >> $bitsToNotRead;
			$numBits          -= $toRead;
			this.bitsRead     += $toRead;

			if(this.bitsRead === 8){
				this.bitsRead = 0;
				this.bytesRead++;
			}
		}

		// Next read whole bytes
		if($numBits > 0){

			while($numBits >= 8){
				$result = ($result << 8) | (this.buffer[this.bytesRead] & 0xff);
				this.bytesRead++;
				$numBits -= 8;
			}

			// Finally read a partial byte
			if($numBits > 0){
				let $bitsToNotRead = 8 - $numBits;
				let $mask          = (0xff >> $bitsToNotRead) << $bitsToNotRead;
				$result            = ($result << $numBits) | ((this.buffer[this.bytesRead] & $mask) >> $bitsToNotRead);
				this.bitsRead     += $numBits;
			}
		}

		return $result;
	}

}
