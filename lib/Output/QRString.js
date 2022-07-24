/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QROutputAbstract from './QROutputAbstract.js';
import {OUTPUT_STRING_JSON, OUTPUT_STRING_TEXT} from '../Common/constants.js';

/**
 * Converts the matrix data into string types
 */
export default class QRString extends QROutputAbstract{

	/**
	 * @inheritDoc
	 */
	dump($file){
		let $data;

		switch(this.options.outputType){
			case OUTPUT_STRING_TEXT:
				$data = this.text();
				break;
			case OUTPUT_STRING_JSON:
			default:
				$data = this.json();
		}

		return $data;
	}

	/**
	 * @inheritDoc
	 */
	getDefaultModuleValue($isDark){
		return $isDark ? this.options.textDark : this.options.textLight;
	}

	/**
	 * @inheritDoc
	 */
	getModuleValue($value){
		return $value;
	}

	/**
	 * @inheritDoc
	 */
	moduleValueIsValid($value){
		return typeof $value === 'string';
	}

	/**
	 * JSON output
	 */
	json(){
		return JSON.stringify(this.matrix.matrix());
	}

	/**
	 * string output
	 */
	text(){
		let $str = [];

		for(let $y = 0; $y < this.moduleCount; $y++){
			let $row = [];

			for(let $x = 0; $x < this.moduleCount; $x++){
				$row.push(this.moduleValues[this.matrix.get($x, $y)]);
			}

			$str.push($row.join(''));
		}

		return $str.join(this.options.eol);
	}
}
