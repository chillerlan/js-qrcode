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
	 * generates the output, optionally dumps it to a file, and returns it
	 *
	 * @param {string|null} $file
	 * @return mixed
	 * @abstract
	 */
	dump($file = null){}

}
