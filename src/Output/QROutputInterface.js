/**
 * @created      14.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

/**
 * @interface
 */
export default class QROutputInterface{

	/**
	 * @type {string}
	 * @protected
	 * @see QROutputAbstract.toBase64DataURI()
	 */
	mimeType;


	/**
	 * Determines whether the given value is valid
	 *
	 * @param {*} $value
	 * @returns {boolean}
	 * @abstract
	 */
	static moduleValueIsValid($value){}

	/**
	 * generates the output, optionally dumps it to a file, and returns it
	 *
	 * @param {string|null} $file
	 * @return {*}
	 * @abstract
	 */
	dump($file = null){}

}
