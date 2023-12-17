/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QROptions from './QROptions.js';
import MaskPattern from './Common/MaskPattern.js';
import AlphaNum from './Data/AlphaNum.js';
import Byte from './Data/Byte.js';
//import Kanji from './Data/Kanji.js';
import Numeric from './Data/Numeric.js';
import QRData from './Data/QRData.js';
import QRCodeOutputException from './Output/QRCodeOutputException.js';
import QROutputInterface from './Output/QROutputInterface.js';
import PHPJS from './Common/PHPJS.js';
import {
	MASK_PATTERN_AUTO, MODE_ALPHANUM, MODE_BYTE, MODE_NUMBER
} from './Common/constants.js';

/**
 * Map of data mode => interface (detection order)
 *
 * @type {string[]}
 */
const MODE_INTERFACES = PHPJS.array_combine([
	MODE_NUMBER,
	MODE_ALPHANUM,
//	MODE_KANJI, // we ignore Kanji for now
	MODE_BYTE,
], [
	Numeric,
	AlphaNum,
//	Kanji,
	Byte,
]);

/**
 * Turns a text string into a Model 2 QR Code
 *
 * @see https://github.com/chillerlan/php-qrcode
 * @see https://github.com/kazuhikoarase/qrcode-generator/tree/master/php
 * @see http://www.qrcode.com/en/codes/model12.html
 * @see https://www.swisseduc.ch/informatik/theoretische_informatik/qr_codes/docs/qr_standard.pdf
 * @see https://en.wikipedia.org/wiki/QR_code
 * @see http://www.thonky.com/qr-code-tutorial/
 * @see https://jamie.build/const
 */
export default class QRCode{

	/**
	 * @type {QROptions}
	 * @protected
	 */
	options;

	/**
	 * @type {Array}
	 * @protected
	 */
	dataSegments = [];

	/**
	 * QRCode constructor.
	 *
	 * Sets the options instance
	 *
	 * @param {QROptions} $options
	 */
	constructor($options){

		if(!($options instanceof QROptions)){
			$options = new QROptions();
		}

		this.options = $options;
	}

	/**
	 * Renders a QR Code for the given $data and QROptions
	 *
	 * @returns {*}
	 */
	render($data = null, $file = null){

		if($data !== null){
			for(let $mode in MODE_INTERFACES){
				let $dataInterface = MODE_INTERFACES[$mode];

				if($dataInterface.validateString($data)){
					this.addSegment(new $dataInterface($data));

					break;
				}
			}
		}

		return this.renderMatrix(this.getQRMatrix(), $file);
	}

	/**
	 * Renders a QR Code for the given QRMatrix and QROptions, saves $file optionally
	 *
	 * @param {QRMatrix} $matrix
	 * @param {string|null} $file
	 * @returns {*}
	 */
	renderMatrix($matrix, $file = null){
		return this.initOutputInterface($matrix).dump($file ?? this.options.cachefile);
	}

	/**
	 * Returns a QRMatrix object for the given $data and current QROptions
	 *
	 * @returns {QRMatrix}
	 * @throws {QRCodeDataException}
	 */
	getQRMatrix(){
		let $matrix = new QRData(this.options, this.dataSegments).writeMatrix();

		let $maskPattern = this.options.maskPattern === MASK_PATTERN_AUTO
			? MaskPattern.getBestPattern($matrix)
			: new MaskPattern(this.options.maskPattern);

		$matrix.setFormatInfo($maskPattern).mask($maskPattern);

		return this.addMatrixModifications($matrix);
	}

	/**
	 * add matrix modifications after mask pattern evaluation and before handing over to output
	 *
	 * @param {QRMatrix} $matrix
	 * @returns {QRMatrix}
	 * @protected
	 */
	addMatrixModifications($matrix){

		if(this.options.addLogoSpace){
			let $logoSpaceWidth  = this.options.logoSpaceWidth;
			let $logoSpaceHeight = this.options.logoSpaceHeight;

			// check whether one of the dimensions was omitted
			if($logoSpaceWidth === null || $logoSpaceHeight === null){
				$logoSpaceWidth  = ($logoSpaceWidth ?? $logoSpaceHeight ?? 0);
				$logoSpaceHeight = null;
			}

			$matrix.setLogoSpace(
				$logoSpaceWidth,
				$logoSpaceHeight,
				this.options.logoSpaceStartX,
				this.options.logoSpaceStartY
			);
		}

		if(this.options.addQuietzone){
			$matrix.setQuietZone(this.options.quietzoneSize);
		}

		return $matrix;
	}

	/**
	 * initializes a fresh built-in or custom QROutputInterface
	 *
	 * @param {QRMatrix} $QRMatrix
	 * @returns {QROutputAbstract}
	 * @throws {QRCodeOutputException}
	 * @protected
	 */
	initOutputInterface($QRMatrix){

		if(typeof this.options.outputInterface !== 'function'){
			throw new QRCodeOutputException('invalid output class');
		}

		let $outputInterface = new this.options.outputInterface(this.options, $QRMatrix);

		if(!($outputInterface instanceof QROutputInterface)){
			throw new QRCodeOutputException('output class does not implement QROutputInterface');
		}

		return $outputInterface
	}

	/**
	 * Adds a data segment
	 *
	 * ISO/IEC 18004:2000 8.3.6 - Mixing modes
	 * ISO/IEC 18004:2000 Annex H - Optimisation of bit stream length
	 *
	 * @returns {QRCode}
	 */
	addSegment($segment){
		this.dataSegments.push($segment);

		return this;
	}

	/**
	 * Clears the data segments array
	 *
	 * @returns {QRCode}
	 */
	clearSegments(){
		this.dataSegments = [];

		return this;
	}

	/**
	 * Adds a numeric data segment
	 *
	 * ISO/IEC 18004:2000 8.3.2 - Numeric Mode
	 *
	 * @returns {QRCode}
	 */
	addNumericSegment($data){
		this.addSegment(new Numeric($data));

		return this;
	}

	/**
	 * Adds an alphanumeric data segment
	 *
	 * ISO/IEC 18004:2000 8.3.3 - Alphanumeric Mode
	 *
	 * @returns {QRCode}
	 */
	addAlphaNumSegment($data){
		this.addSegment(new AlphaNum($data));

		return this;
	}

	/**
	 * Adds a Kanji data segment
	 *
	 * ISO/IEC 18004:2000 8.3.5 - Kanji Mode
	 *
	 * @returns {QRCode}
	 */
//	addKanjiSegment($data){
//		this.addSegment(new Kanji($data));
//
//		return this;
//	}

	/**
	 * Adds an 8-bit byte data segment
	 *
	 * ISO/IEC 18004:2000 8.3.4 - 8-bit Byte Mode
	 *
	 * @returns {QRCode}
	 */
	addByteSegment($data){
		this.addSegment(new Byte($data));

		return this;
	}

}
