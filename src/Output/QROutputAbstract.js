/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QROutputInterface from './QROutputInterface.js';
import PHPJS from '../Common/PHPJS.js';
import {IS_DARK, M_DATA, DEFAULT_MODULE_VALUES} from '../Common/constants.js';
import QRCodeOutputException from './QRCodeOutputException.js';

/**
 * common output abstract
 * @abstract
 */
export default class QROutputAbstract extends QROutputInterface{

	/**
	 * the current size of the QR matrix
	 *
	 * @see QRMatrix.getSize()
	 * @type {number|int}
	 * @protected
	 */
	moduleCount;

	/**
	 * an (optional) array of color values for the several QR matrix parts
	 * @type {Object.<number, *>}
	 * @protected
	 */
	moduleValues = {};

	/**
	 * the current scaling for a QR pixel
	 *
	 * @see QROptions.$scale
	 * @type {number|int}
	 * @protected
	 */
	scale;

	/**
	 * the side length of the QR image (modules * scale)
	 * @type {number|int}
	 * @protected
	 */
	length;

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
		this.moduleCount = this.matrix.getSize();
		this.scale       = this.options.scale;
		this.length      = this.moduleCount * this.scale;
	}

	/**
	 * Returns a 2 element array with the current output width and height
	 *
	 * The type and units of the values depend on the output class. The default value is the current module count * scale.
	 *
	 * @returna {array}
	 * @protected
	 */
	getOutputDimensions(){
		return [this.length, this.length];
	}

	/**
	 * Sets the initial module values
	 *
	 * @returns {void}
	 * @protected
	 */
	setModuleValues(){
		let $M_TYPE;

		for($M_TYPE in DEFAULT_MODULE_VALUES){
			this.moduleValues[$M_TYPE] = this.getDefaultModuleValue(DEFAULT_MODULE_VALUES[$M_TYPE]);
		}

		for($M_TYPE in this.options.moduleValues){
			let $value = this.options.moduleValues[$M_TYPE];

			if(this.moduleValueIsValid($value)){
				this.moduleValues[$M_TYPE] = this.prepareModuleValue($value);
			}
		}

	}

	/**
	 * Determines whether the given value is valid
	 *
	 * @param {*} $value
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
	prepareModuleValue($value){}

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
	 * Returns the prepared value for the given $M_TYPE
	 *
	 * @throws {QRCodeOutputException} if $moduleValues[$M_TYPE] doesn't exist
	 * @param {number|int} $M_TYPE
	 * @returna {*}
	 * @protected
	 */
	getModuleValue($M_TYPE){

		if(!PHPJS.isset(() => this.moduleValues[$M_TYPE])){
			throw new QRCodeOutputException(`$M_TYPE "${$M_TYPE.toString(2).padStart(12, '0')}" not found in module values map`);
		}

		return this.moduleValues[$M_TYPE];
	}

	/**
	 * Returns the prepared module value at the given coordinate [$x, $y] (convenience)
	 *
	 * @param {number|int} $x
	 * @param {number|int} $y
	 * @returna {*}
	 * @protected
	 */
	getModuleValueAt($x, $y){
		return this.getModuleValue(this.matrix.get($x, $y));
	}

	/**
	 * Returns a base64 data URI for the given string and mime type
	 *
	 * @param {string} $data
	 * @param {string} $mime
	 * @returna {string}
	 * @throws {QRCodeOutputException}
	 * @protected
	 */
	toBase64DataURI($data, $mime){
		$mime = ($mime ?? this.mimeType).trim();

		if($mime === ''){
			throw new QRCodeOutputException('invalid mime type given');
		}

		return `data:${$mime};base64,${btoa($data)}`;
	}

	/**
	 * saves the qr data to a file
	 *
	 * @see file_put_contents()
	 * @see QROptions.cachefile
	 *
	 * @param {string} $data
	 * @param {string} $file
	 * @returns {void}
	 * @throws QRCodeOutputException
	 * @protected
	 */
	saveToFile($data, $file){

		if($file === null){
			return;
		}

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
	 * @returns {Object<{}>}
	 * @protected
	 */
	collectModules($transform){
		let $paths = {};
		let $matrix = this.matrix.getMatrix();
		let $y = 0;

		// collect the modules for each type
		for(let $row of $matrix){
			let $x = 0;

			for(let $M_TYPE of $row){
				let $M_TYPE_LAYER = $M_TYPE;

				if(this.options.connectPaths && !this.matrix.checkTypeIn($x, $y, this.options.excludeFromConnect)){
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
