/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QROutputInterface from './QROutputInterface.js';
import PHPJS from '../Common/PHPJS.js';
import {IS_DARK, M_DATA, DEFAULT_MODULE_VALUES} from '../Common/constants.js';

/**
 * common output abstract
 * @abstract
 */
export default class QROutputAbstract extends QROutputInterface{

	/**
	 * the current size of the QR matrix
	 *
	 * @see \chillerlan\QRCode\Data\QRMatrix.size()
	 * @type {int}
	 * @protected
	 */
	moduleCount;

	/**
	 * the current scaling for a QR pixel
	 *
	 * @see \chillerlan\QRCode\QROptions.$scale
	 * @type {int}
	 * @protected
	 */
	scale;

	/**
	 * the side length of the QR image (modules * scale)
	 * @type {int}
	 * @protected
	 */
	length;

	/**
	 * an (optional) array of color values for the several QR matrix parts
	 * @type {{}}
	 * @protected
	 */
	moduleValues = {};

	/**
	 * the (filled) data matrix object
	 * @type {QRMatrix}
	 * @protected
	 */
	matrix;

	/**
	 * @type {QROptions}
	 * @protected
	 */
	options;

	/**
	 * QROutputAbstract constructor.
	 * @param {QROptions} $options
	 * @param {QRMatrix} $matrix
	 */
	constructor($options, $matrix){
		super();

		this.options = $options;
		this.matrix  = $matrix;

		this.setMatrixDimensions();
		this.setModuleValues();
	}

	/**
	 * Sets/updates the matrix dimensions
	 *
	 * Call this method if you modify the matrix from within your custom module in case the dimensions have been changed
	 *
	 * @returns {void}
	 * @protected
	 */
	setMatrixDimensions(){
		this.moduleCount = this.matrix.size();
		this.scale       = this.options.scale;
		this.length      = this.moduleCount * this.scale;
	}

	/**
	 * Determines whether the given value is valid
	 *
	 * @param {*|null} $value
	 * @returns {boolean}
	 * @abstract
	 * @protected
	 */
	moduleValueIsValid($value){}

	/**
	 * Returns the final value for the given input (return value depends on the output module)
	 *
	 * @param {*} $value
	 * @returna {*}
	 * @abstract
	 * @protected
	 */
	getModuleValue($value){}

	/**
	 * Returns a defualt value for either dark or light modules (return value depends on the output module)
	 *
	 * @param {boolean} $isDark
	 * @returna {*}
	 * @abstract
	 * @protected
	 */
	getDefaultModuleValue($isDark){}

	/**
	 * Sets the initial module values
	 *
	 * @returns {void}
	 * @protected
	 */
	setModuleValues(){

		for(let $M_TYPE in DEFAULT_MODULE_VALUES){
			let $value = null;

			if(PHPJS.isset(() => this.options.moduleValues[$M_TYPE])){
				$value = this.options.moduleValues[$M_TYPE];
			}

			this.moduleValues[$M_TYPE] = this.moduleValueIsValid($value)
				? this.getModuleValue($value)
				: this.getDefaultModuleValue(DEFAULT_MODULE_VALUES[$M_TYPE]);
		}

	}

	/**
	 * Returns a base64 data URI for the given string and mime type
	 *
	 * @param {string} $data
	 * @param {string} $mime
	 * @returna {string}
	 * @protected
	 */
	base64encode($data, $mime){
		return 'data:' + $mime + ';base64,' + btoa($data);
	}

	/**
	 *
	 * @see https://stackoverflow.com/a/35385518
	 *
	 * @param {string} $html
	 * @returns {ChildNode}
	 */
	toHtmlElement($html){
		let template       = document.createElement('template');
		template.innerHTML = $html.trim();

		return template.content.firstChild;
	}

	/**
	 * saves the qr data to a file
	 *
	 * @see file_put_contents()
	 * @see \chillerlan\QRCode\QROptions.cachefile
	 *
	 * @param {string} $data
	 * @param {string} $file
	 * @returns {void}
	 * @throws \chillerlan\QRCode\Output\QRCodeOutputException
	 * @protected
	 */
	saveToFile($data, $file){
		// @todo
	}

	/**
	 * collects the modules per QRMatrix.M_* type and runs a $transform functio on each module and
	 * returns an array with the transformed modules
	 *
	 * The transform callback is called with the following parameters:
	 *
	 *   $x            - current column
	 *   $y            - current row
	 *   $M_TYPE       - field value
	 *   $M_TYPE_LAYER - (possibly modified) field value that acts as layer id
	 *
	 * @param {function} $transform
	 * @returns {{}}
	 * @protected
	 */
	collectModules($transform){
		let $paths = {};
		let $matrix = this.matrix.matrix();
		let $y = 0;

		// collect the modules for each type
		for(let $row of $matrix){
			let $x = 0;

			for(let $M_TYPE of $row){
				let $M_TYPE_LAYER = $M_TYPE;

				if(this.options.connectPaths && this.matrix.checkTypeNotIn($x, $y, this.options.excludeFromConnect)){
					// to connect paths we'll redeclare the $M_TYPE_LAYER to data only
					$M_TYPE_LAYER = M_DATA;

					if(this.matrix.check($x, $y)){
						$M_TYPE_LAYER |= IS_DARK;
					}
				}

				// collect the modules per $M_TYPE
				let $module = $transform($x, $y, $M_TYPE, $M_TYPE_LAYER);

				if($module){
					if(!$paths[$M_TYPE_LAYER]){
						$paths[$M_TYPE_LAYER] = [];
					}

					$paths[$M_TYPE_LAYER].push($module);
				}
				$x++;
			}
			$y++;
		}

		// beautify output
//		ksort($paths);

		return $paths;
	}

}
