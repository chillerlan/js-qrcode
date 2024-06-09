/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QROutputAbstract from './QROutputAbstract.js';
import QRCodeOutputException from './QRCodeOutputException.js';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas
 */
export default class QRCanvas extends QROutputAbstract{

	/**
	 * @inheritDoc
	 */
	mimeType = 'image/png';

	/**
	 * @type {HTMLCanvasElement}
	 * @protected
	 */
	canvas;

	/**
	 * @type {CanvasRenderingContext2D}
	 * @protected
	 */
	context;

	/**
	 * @inheritDoc
	 */
	static moduleValueIsValid($value){

		if(typeof $value !== 'string'){
			return false;
		}

		$value = $value.trim();

		// hex notation
		// #rgb(a)
		// #rrggbb(aa)
		if($value.match(/^#([\da-f]{3}){1,2}$|^#([\da-f]{4}){1,2}$/i)){
			return true;
		}

		// css: hsla/rgba(...values)
		if($value.match(/^(hsla?|rgba?)\([\d .,%\/]+\)$/i)){
			return true;
		}

		// predefined css color
		if($value.match(/^[a-z]+$/i)){
			return true;
		}

		return false;
	}

	/**
	 * @inheritDoc
	 */
	prepareModuleValue($value){
		return $value.trim();
	}

	/**
	 * @inheritDoc
	 */
	getDefaultModuleValue($isDark){
		return $isDark ? '#000' : '#fff';
	}

	/**
	 * @inheritDoc
	 */
	getOutputDimensions(){
		return [this.length, this.length];
	}

	/**
	 * @param {string} $data (ignored)
	 * @param {string} $mime (ignored)
	 * @returns {string}
	 * @protected
	 */
	toBase64DataURI($data, $mime){
		$mime = this.options.canvasMimeType.trim();

		if($mime === ''){
			$mime = this.mimeType;
		}

		return this.canvas.toDataURL($mime, this.options.canvasImageQuality)
	}

	/**
	 * @inheritDoc
	 *
	 * @returns {HTMLCanvasElement|string|*}
	 * @throws {QRCodeOutputException}
	 */
	dump($file = null){
		this.canvas = (this.options.canvasElement || document.createElement('canvas'));

		// @todo: test if instance check also works with nodejs canvas modules etc.
		if(!this.canvas || !(this.canvas instanceof HTMLCanvasElement) || (typeof this.canvas.getContext !== 'function')){
			throw new QRCodeOutputException('invalid canvas element');
		}

		this.drawImage();

		if(this.options.returnAsDomElement){
			return this.canvas;
		}

		let base64DataURI = this.toBase64DataURI();
		let rawImage      = atob(base64DataURI.split(',')[1]);

		this.saveToFile(rawImage, $file);

		if(this.options.outputBase64){
			return base64DataURI;
		}

		return rawImage;
	}

	/**
	 * @returns {void}
	 * @protected
	 */
	drawImage(){
		this.canvas.width  = this.length;
		this.canvas.height = this.length;
		this.context       = this.canvas.getContext('2d', {alpha: this.options.imageTransparent})

		if(this.options.bgcolor && this.constructor.moduleValueIsValid(this.options.bgcolor)){
			this.context.fillStyle = this.options.bgcolor;
			this.context.fillRect(0, 0, this.length, this.length);
		}

		for(let $y = 0; $y < this.moduleCount; $y++){
			for(let $x = 0; $x < this.moduleCount; $x++){
				this.module($x, $y, this.matrix.get($x, $y))
			}
		}

	}

	/**
	 * @returns {void}
	 * @protected
	 */
	module($x, $y, $M_TYPE){

		if(!this.options.drawLightModules && !this.matrix.check($x, $y)){
			return;
		}

		this.context.fillStyle = this.getModuleValue($M_TYPE);

		if(this.options.drawCircularModules && !this.matrix.checkTypeIn($x, $y, this.options.keepAsSquare)){
			this.context.beginPath();

			this.context.arc(
				($x + 0.5) * this.scale,
				($y + 0.5) * this.scale,
				(this.options.circleRadius * this.scale),
				0,
				2 * Math.PI
			)

			this.context.fill();

			return;
		}

		this.context.fillRect($x * this.scale, $y * this.scale, this.scale, this.scale);
	}

}
