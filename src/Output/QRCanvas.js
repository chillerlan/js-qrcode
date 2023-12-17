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
	 * @private
	 */
	_canvas;

	/**
	 * @type {CanvasRenderingContext2D}
	 * @private
	 */
	_context;

	/**
	 * @todo: validate css value
	 * @inheritDoc
	 */
	moduleValueIsValid($value){

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

		return this._canvas.toDataURL($mime, this.options.canvasImageQuality)
	}

	/**
	 * @inheritDoc
	 *
	 * @returns {HTMLCanvasElement|string|*}
	 * @throws {QRCodeOutputException}
	 */
	dump($file = null){
		this._canvas = (this.options.canvasElement || document.createElement('canvas'));

		// @todo: test if instance check also works with nodejs canvas modules etc.
		if(!this._canvas || !(this._canvas instanceof HTMLCanvasElement) || (typeof this._canvas.getContext !== 'function')){
			throw new QRCodeOutputException('invalid canvas element');
		}

		this._drawImage();

		if(this.options.returnAsDomElement){
			return this._canvas;
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
	 * @private
	 */
	_drawImage(){
		this._canvas.width  = this.length;
		this._canvas.height = this.length;
		this._context       = this._canvas.getContext('2d', {alpha: this.options.imageTransparent})

		if(this.options.bgcolor && this.moduleValueIsValid(this.options.bgcolor)){
			this._context.fillStyle = this.options.bgcolor;
			this._context.fillRect(0, 0, this.length, this.length);
		}

		for(let $y = 0; $y < this.moduleCount; $y++){
			for(let $x = 0; $x < this.moduleCount; $x++){
				this._module($x, $y, this.matrix.get($x, $y))
			}
		}

	}

	/**
	 * @returns {void}
	 * @private
	 */
	_module($x, $y, $M_TYPE){

		if(!this.options.drawLightModules && !this.matrix.check($x, $y)){
			return;
		}

		this._context.fillStyle = this.getModuleValue($M_TYPE);

		if(this.options.drawCircularModules && !this.matrix.checkTypeIn($x, $y, this.options.keepAsSquare)){
			this._context.beginPath();

			this._context.arc(
				($x + 0.5) * this.scale,
				($y + 0.5) * this.scale,
				(this.options.circleRadius * this.scale),
				0,
				2 * Math.PI
			)

			this._context.fill();

			return;
		}

		this._context.fillRect($x * this.scale, $y * this.scale, this.scale, this.scale);
	}

}
