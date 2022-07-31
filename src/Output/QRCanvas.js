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
		return typeof $value === 'string' && $value.trim().length > 0;
	}

	/**
	 * @inheritDoc
	 */
	getModuleValue($value){
		return $value.trim();
	}

	/**
	 * @inheritDoc
	 */
	getDefaultModuleValue($isDark){
		return $isDark ? this.options.markupDark : this.options.markupLight;
	}

	/**
	 * @inheritDoc
	 *
	 * @returns {HTMLCanvasElement|*}
	 */
	dump($file = null){
		this._canvas  = this.options.canvasElement;

		// @todo: test if instance check also works with nodejs canvas modules etc.
		// otherwise check for this._canvas.getContext
		if(!this._canvas || !(this._canvas instanceof HTMLCanvasElement)){
			throw new QRCodeOutputException('invalid canvas element');
		}

		$file           = $file || this.options.cachefile;
		let $saveToFile = $file !== null;
		let data        = null;

		this._drawImage();

		if($saveToFile){
			data = this._canvasToBase64();

			this.saveToFile(atob(data.substring(data.indexOf(',') + 1)), $file);
		}

		if(this.options.imageBase64){
			return data || this._canvasToBase64();
		}

		return this._canvas;
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
				this._setPixel($x, $y, this.matrix.get($x, $y))
			}
		}

	}

	/**
	 * @returns {void}
	 * @private
	 */
	_setPixel($x, $y, $M_TYPE){

		if(!this.options.drawLightModules && !this.matrix.check($x, $y)){
			return;
		}

		this._context.fillStyle = this.moduleValues[$M_TYPE];

		if(this.options.drawCircularModules && this.matrix.checkTypeNotIn($x, $y, this.options.keepAsSquare)){
			this._context.beginPath();

			this._context.arc(
				($x + 0.5) * this.scale,
				($y + 0.5) * this.scale,
				(this.options.circleRadius * this.scale),
				0,
				2 * Math.PI
			)

			this._context.fill();
		}
		else{
			this._context.fillRect($x * this.scale, $y * this.scale, this.scale, this.scale);
		}

	}

	/**
	 * @returns {string}
	 * @private
	 */
	_canvasToBase64(){
		return this._canvas.toDataURL(`image/${this.options.canvasImageType}`, this.options.canvasImageQuality)
	}

}
