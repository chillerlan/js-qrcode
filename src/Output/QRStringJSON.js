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
export default class QRStringJSON extends QROutputAbstract{

	/**
	 * @inheritDoc
	 */
	mimeType = 'application/json';

	/**
	 * @inheritDoc
	 */
	dump($file){
		let $data = JSON.stringify(this.matrix.getMatrix(this.options.jsonAsBooleans));

		this.saveToFile($data, $file);

		return $data;
	}

	/**
	 * unused - required by interface
	 *
	 * @inheritDoc
	 * @codeCoverageIgnore
	 */
	getDefaultModuleValue($isDark){
		return null;
	}

	/**
	 * unused - required by interface
	 *
	 * @inheritDoc
	 * @codeCoverageIgnore
	 */
	prepareModuleValue($value){
		return null;
	}

	/**
	 * unused - required by interface
	 *
	 * @inheritDoc
	 * @codeCoverageIgnore
	 */
	moduleValueIsValid($value){
		return true;
	}

}
