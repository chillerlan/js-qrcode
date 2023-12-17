/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QROutputAbstract from './QROutputAbstract.js';

/**
 * Abstract for markup types: HTML, SVG, ... XML anyone?
 *
 * @abstract
 */
export default class QRMarkup extends QROutputAbstract{

	/**
	 * @inheritDoc
	 */
	moduleValueIsValid($value){
		return typeof $value === 'string' && $value.trim().length > 0;
	}

	/**
	 * @inheritDoc
	 */
	getModuleValue($value){
		return $value.replace(/(<([^>]+)>)/gi, '').replace(/([ '"\r\n\t]+)/g, '');
	}

	/**
	 * @inheritDoc
	 */
	getDefaultModuleValue($isDark){
		return $isDark ? '#000' : '#fff';
	}

	/**
	 * @inheritDoc
	 *
	 * @returns {String|*}
	 */
	dump($file = null){
		$file = $file || this.options.cachefile;
		let $saveToFile = $file !== null;

		let $data = this.createMarkup($saveToFile);

		if(!$saveToFile && this.options.returnMarkupAsHtmlElement){
			return this.toHtmlElement($data);
		}

		if($saveToFile){
			this.saveToFile($data, $file);
		}

		return $data;
	}

	/**
	 * returns a string with all css classes for the current element
	 *
	 * @param {Number<int>} $M_TYPE
	 * @returns {String}
	 * @abstract
	 * @protected
	 */
	getCssClass($M_TYPE){}

	/**
	 * @param {Boolean} $saveToFile
	 * @returns {String}
	 * @abstract
	 * @protected
	 */
	createMarkup($saveToFile){}

}