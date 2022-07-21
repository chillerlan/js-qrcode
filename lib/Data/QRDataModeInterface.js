/**
 * @created      14.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

/**
 * @interface
 */
export default class QRDataModeInterface{

	/**
	 * returns the current data mode constant
	 *
	 * @inheritDoc
	 *
	 * @returns {int}
	 * @abstract
	 */
	getDataMode(){}

	/**
	 * retruns the length in bits of the data string
	 *
	 * @returns {int}
	 * @abstract
	 */
	getLengthInBits(){}

	/**
	 * writes the actual data string to the BitBuffer, uses the given version to determine the length bits
	 *
	 * @see \chillerlan\QRCode\Data\QRData::writeBitBuffer()
	 *
	 * @param {BitBuffer} $bitBuffer
	 * @param {int} $versionNumber
	 *
	 * @returns {void}
	 * @abstract
	 */
	write($bitBuffer, $versionNumber){}

	/**
	 * checks if the given string qualifies for the encoder module
	 *
	 * @param {string} $string
	 *
	 * @returns {boolean}
	 * @abstract
	 */
	static validateString($string){}

	/**
	 * same as validateString, but instanced mode because JS is dumb
	 *
	 * @param $string
	 * @returns {boolean}
	 */
	validateStringI($string){}

}
