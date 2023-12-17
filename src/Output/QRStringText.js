/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QROutputAbstract from './QROutputAbstract.js';

/**
 * Converts the matrix data into string types
 */
export default class QRStringText extends QROutputAbstract{

	/**
	 * @inheritDoc
	 */
	mimeType = 'text/plain';

	/**
	 * @inheritDoc
	 */
	getDefaultModuleValue($isDark){
		return $isDark ? '██' : '░░';
	}

	/**
	 * @inheritDoc
	 */
	prepareModuleValue($value){
		return $value;
	}

	/**
	 * @inheritDoc
	 */
	moduleValueIsValid($value){
		return typeof $value === 'string';
	}

	/**
	 * @inheritDoc
	 */
	dump($file){
		let $str = [];

		for(let $y = 0; $y < this.moduleCount; $y++){
			let $row = [];

			for(let $x = 0; $x < this.moduleCount; $x++){
				$row.push(this.moduleValues[this.matrix.get($x, $y)]);
			}

			$str.push($row.join(''));
		}

		let $data = $str.join(this.options.eol);

		this.saveToFile($data, $file);

		return $data;
	}

	/**
	 *
	 * @param {string} $str
	 * @param {number|int} $color
	 * @param {boolean} $background
	 * @returns {string}
	 */
	static ansi8($str, $color, $background = null){
		$color = Math.max(0, Math.min($color, 255));

		return `\x1b[${($background === true ? 48 : 38)};5;${$color}m${$str}\x1b[0m`;
	}
}
