/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QRCodeException from './QRCodeException.js';
import PHPJS from './Common/PHPJS.js';
import {
	ECC_H, ECC_L, ECC_M, ECC_Q, MASK_PATTERN_AUTO, VERSION_AUTO,
} from './Common/constants.js';
import QRMarkupSVG from './Output/QRMarkupSVG.js';

/**
 * The QRCode plug-in settings & setter functionality
 */
export default class QROptions{

	/**
	 * QR Code version number
	 *
	 * [1 ... 40] or QRCode.VERSION_AUTO
	 *
	 * @type {number|int}
	 * @protected
	 */
	_version = VERSION_AUTO;

	/**
	 * Minimum QR version
	 *
	 * if $version = QRCode.VERSION_AUTO
	 *
	 * @type {number|int}
	 * @protected
	 */
	_versionMin = 1;

	/**
	 * Maximum QR version
	 *
	 * @type {number|int}
	 * @protected
	 */
	_versionMax = 40;

	/**
	 * Error correct level
	 *
	 * QRCode::ECC_X where X is:
	 *
	 *   - L =>  7%
	 *   - M => 15%
	 *   - Q => 25%
	 *   - H => 30%
	 *
	 * @type {number|int}
	 * @protected
	 */
	_eccLevel = ECC_L;

	/**
	 * Mask Pattern to use (no value in using, mostly for unit testing purposes)
	 *
	 * [0...7] or QRCode::MASK_PATTERN_AUTO
	 *
	 * @type {number|int}
	 * @protected
	 */
	_maskPattern = MASK_PATTERN_AUTO;

	/**
	 * Add a "quiet zone" (margin) according to the QR code spec
	 *
	 * @see https://www.qrcode.com/en/howto/code.html
	 *
	 * @type {boolean}
	 */
	addQuietzone = true;

	/**
	 * Size of the quiet zone
	 *
	 * internally clamped to [0 ... $moduleCount / 2], defaults to 4 modules
	 *
	 * @type {number|int}
	 * @protected
	 */
	_quietzoneSize = 4;

	/**
	 * the FQCN of the custom QROutputInterface if $outputType is set to QRCode::OUTPUT_CUSTOM
	 *
	 * @type {string|null}
	 */
	outputInterface = QRMarkupSVG;

	/**
	 * /path/to/cache.file
	 *
	 * @type {string|null}
	 */
	cachefile = null;

	/**
	 * newline string [HTML, SVG, TEXT]
	 *
	 * @type {string}
	 */
	eol = '\n';

	/**
	 * size of a QR code pixel [SVG, IMAGE_*], HTML via CSS
	 *
	 * @type {number|int}
	 */
	scale = 5;

	/**
	 * a common css class
	 *
	 * @type {string}
	 */
	cssClass = 'qrcode';

	/**
	 * SVG opacity
	 *
	 * @type {number|float}
	 */
	svgOpacity = 1.0;

	/**
	 * anything between <defs>
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs
	 *
	 * @type {string}
	 */
	svgDefs = '';

	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
	 *
	 * @type {string}
	 */
	svgPreserveAspectRatio = 'xMidYMid';

	/**
	 * Whether to add an XML header line or not, e.g. to embed the SVG directly in HTML
	 *
	 * `<?xml version="1.0" encoding="UTF-8"?>`
	 *
	 * @type {boolean}
	 */
	svgAddXmlHeader = false;

	/**
	 * Whether to use the SVG `fill` attributes
	 *
	 * If set to `true` (default), the `fill` attribute will be set with the module value for the `<path>` element's `$M_TYPE`.
	 * When set to `false`, the module values map will be ignored and the QR Code may be styled via CSS.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill
	 *
	 * @type {boolean}
	 */
	svgUseFillAttributes = true;

	/**
	 * Whether to return matrix values in JSON as booleans or `$M_TYPE` integers
	 *
	 * @type {boolean}
	 */
	jsonAsBooleans = false;

	/**
	 * whether to connect the paths for the several module types to avoid weird glitches when using gradients etc.
	 *
	 * @see https://github.com/chillerlan/php-qrcode/issues/57
	 *
	 * @type {boolean}
	 */
	connectPaths = false;

	/**
	 * specify which paths/patterns to exclude from connecting if $svgConnectPaths is set to true
	 *
	 * @type {number[]|int[]}
	 */
	excludeFromConnect = [];

	/**
	 * specify whether to draw the modules as filled circles
	 *
	 * a note for GDImage output:
	 *
	 * if QROptions::$scale is less or equal than 20, the image will be upscaled internally, then the modules will be drawn
	 * using imagefilledellipse() and then scaled back to the expected size using IMG_BICUBIC which in turn produces
	 * unexpected outcomes in combination with transparency - to avoid this, set scale to a value greater than 20.
	 *
	 * @see https://github.com/chillerlan/php-qrcode/issues/23
	 * @see https://github.com/chillerlan/php-qrcode/discussions/122
	 *
	 * @type {boolean}
	 */
	drawCircularModules = false;

	/**
	 * specifies the radius of the modules when $svgDrawCircularModules is set to true
	 *
	 * @type {number|float}
	 * @protected
	 */
	_circleRadius = 0.45;

	/**
	 * specifies which module types to exclude when $svgDrawCircularModules is set to true
	 *
	 * @type {number[]|int[]}
	 */
	keepAsSquare = [];

	/**
	 * toggle base64 or raw image data
	 *
	 * @type {boolean}
	 */
	outputBase64 = true;

	/**
	 * toggle background transparency
	 *
	 * if transparency is disabled, a background color should be specified to avoid unexpected outcomes
	 *
	 * @see QROptions.bgcolor
	 *
	 * @type {boolean}
	 */
	imageTransparent = true;

	/**
	 * whether to draw the light (false) modules
	 *
	 * @type {boolean}
	 */
	drawLightModules = true;

	/**
	 * Module values map
	 *
	 *   - HTML, IMAGICK: #ABCDEF, cssname, rgb(), rgba()...
	 *   - IMAGE: [63, 127, 255] // R, G, B
	 *
	 * @type {Object.<number, *>|null}
	 */
	moduleValues = null;

	/**
	 * Toggles logo space creation
	 *
	 * @type {boolean}
	 */
	addLogoSpace = false;

	/**
	 * width of the logo space
	 *
	 * @type {number|int|null}
	 * @protected
	 */
	_logoSpaceWidth = null;

	/**
	 * height of the logo space
	 *
	 * @type {number|int|null}
	 * @protected
	 */
	_logoSpaceHeight = null;

	/**
	 * optional horizontal start position of the logo space (top left corner)
	 *
	 * @type {number|int|null}
	 * @protected
	 */
	_logoSpaceStartX = null;

	/**
	 * optional vertical start position of the logo space (top left corner)
	 *
	 * @type {number|int|null}
	 * @protected
	 */
	_logoSpaceStartY = null;

	/**
	 * whether to return the markup as DOM element
	 *
	 * @type {boolean}
	 */
	returnAsDomElement = true;

	/**
	 * background color
	 *
	 * supported in:
	 *
	 * - OUTPUT_CANVAS
	 *
	 * @type {*|null}
	 */
	bgcolor = null;

	/**
	 * the canvas HTML element (canvas output only)
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement
	 *
	 * @type {HTMLCanvasElement}
	 */
	canvasElement = null;

	/**
	 * canvas image mime type for bas64/file output
	 *
	 * the value may be one of the following (depends on browser/engine):
	 *
	 * - png
	 * - jpeg
	 * - bmp
	 * - webp
	 *
	 * the "image/" is prepended internally
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
	 *
	 * @type {string}
	 * @protected
	 */
	_canvasMimeType = 'image/png';

	/**
	 * canvas image quality
	 *
	 *  "A number between 0 and 1 indicating the image quality to be used when creating images
	 *   using file formats that support lossy compression (such as image/jpeg or image/webp).
	 *   A user agent will use its default quality value if this option is not specified,
	 *   or if the number is outside the allowed range."
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
	 *
	 * @type {number|float}
	 */
	canvasImageQuality = 0.85;

	/**
	 * because javascript is dumb, and we can't call getters and setters directly we have to this silly workaround.
	 * if your inherited options class uses magic getters and setters, add the relevant property names to this array
	 * and call _fromIterable() afterwards:
	 *
	 *     constructor($options = null){
	 *         super();
	 *         this.__workaround__.push('myMagicProp');
	 *         this._fromIterable($options)
	 *     }
	 *
	 *
	 *     let o = new MyExtendedOptions({myMagicProp: 'foo', ...});
	 *
	 * @protected
	 */
	__workaround__ = [
		'canvasMimeType',
		'circleRadius',
		'eccLevel',
		'logoSpaceHeight',
		'logoSpaceWidth',
		'logoSpaceStartX',
		'logoSpaceStartY',
		'maskPattern',
		'quietzoneSize',
		'version',
		'versionMin',
		'versionMax',
	];

	/**
	 * @param {Object<{}>|null} $options
	 */
	constructor($options = null){
		this._fromIterable($options);
	}

	/**
	 * @param {Object<{}>} $options
	 * @returns {void}
	 * @protected
	 */
	_fromIterable($options){

		if(Object.prototype.toString.call($options) !== '[object Object]'){
			return;
		}

		Object.keys($options).forEach($property => {
			if(this.__workaround__.includes($property)){
				this['_set_'+$property]($options[$property]);
			}
			// since Object.prototype.hasOwnProperty.call(this, $property) will cause issues with extended classes,
			// we'll just check if the property is defined. have i mentioned yet how much i loathe javascript?
			else if(this[$property] !== undefined){
				this[$property] = $options[$property];
			}
		});

	}

	/**
	 * clamp min/max version number
	 *
	 * @param {number|int} $versionMin
	 * @param {number|int} $versionMax
	 *
	 * @returns {void}
	 *
	 * @protected
	 */
	setMinMaxVersion($versionMin, $versionMax){
		let $min = Math.max(1, Math.min(40, $versionMin));
		let $max = Math.max(1, Math.min(40, $versionMax));

		this._versionMin = Math.min($min, $max);
		this._versionMax = Math.max($min, $max);
	}

	/**
	 * sets the minimum version number
	 *
	 * @param {number|int} $versionMin
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_versionMin($versionMin){
		this.setMinMaxVersion($versionMin, this._versionMax);
	}

	set versionMin($versionMin){
		this._set_versionMin($versionMin);
	}

	get versionMin(){
		return this._versionMin;
	}

	/**
	 * sets the maximum version number
	 *
	 * @param {number|int} $versionMax
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_versionMax($versionMax){
		this.setMinMaxVersion(this._versionMin, $versionMax);
	}

	set versionMax($versionMax){
		this._set_versionMax($versionMax);
	}

	get versionMax(){
		return this._versionMax;
	}

	/**
	 * sets/clamps the version number
	 *
	 * @param {number|int} $version
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_version($version){
		this._version = $version !== VERSION_AUTO ? Math.max(1, Math.min(40, $version)) : VERSION_AUTO;
	}

	set version($version){
		this._set_version($version);
	}

	get version(){
		return this._version;
	}

	/**
	 * sets the error correction level
	 *
	 * @param {number|int} $eccLevel
	 *
	 * @returns {void}
	 * @throws QRCodeException
	 * @protected
	 */
	_set_eccLevel($eccLevel){

		if(![ECC_L, ECC_M, ECC_Q, ECC_H].includes($eccLevel)){
			throw new QRCodeException(`Invalid error correct level: ${$eccLevel}`);
		}

		this._eccLevel = $eccLevel;
	}

	set eccLevel($eccLevel){
		this._set_eccLevel($eccLevel);
	}

	get eccLevel(){
		return this._eccLevel;
	}

	/**
	 * sets/clamps the mask pattern
	 *
	 * @param {number|int} $maskPattern
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_maskPattern($maskPattern){

		if($maskPattern !== MASK_PATTERN_AUTO){
			this._maskPattern = Math.max(0, Math.min(7, $maskPattern));
		}

	}

	set maskPattern($maskPattern){
		this._set_maskPattern($maskPattern);
	}

	get maskPattern(){
		return this._maskPattern;
	}

	/**
	 * sets/clamps the quiet zone size
	 *
	 * @param {number|int} $quietzoneSize
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_quietzoneSize($quietzoneSize){
		this._quietzoneSize = Math.max(0, Math.min($quietzoneSize, 75));
	}

	set quietzoneSize($quietzoneSize){
		this._set_quietzoneSize($quietzoneSize) ;
	}

	get quietzoneSize(){
		return this._quietzoneSize;
	}

	/**
	 * clamp the logo space values between 0 and maximum length (177 modules at version 40)
	 *
	 * @param {number|int} $value
	 *
	 * @returns {number|int}
	 * @protected
	 */
	clampLogoSpaceValue($value){
		$value = PHPJS.intval($value);

		return Math.max(0, Math.min(177, $value));
	}

	/**
	 * clamp/set logo space width
	 *
	 * @param {number|int} $width
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_logoSpaceWidth($width){
		this._logoSpaceWidth = this.clampLogoSpaceValue($width);
	}

	set logoSpaceWidth($width){
		this._set_logoSpaceWidth($width);
	}

	get logoSpaceWidth(){
		return this._logoSpaceWidth;
	}

	/**
	 * clamp/set logo space height
	 *
	 * @param {number|int} $height
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_logoSpaceHeight($height){
		this._logoSpaceHeight = this.clampLogoSpaceValue($height);
	}

	set logoSpaceHeight($height){
		this._set_logoSpaceHeight($height);
	}

	get logoSpaceHeight(){
		return this._logoSpaceHeight;
	}

	/**
	 * clamp/set horizontal logo space start
	 *
	 * @param {number|int|null} $startX
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_logoSpaceStartX($startX){
		this._logoSpaceStartX = (typeof $startX === 'undefined' || $startX === null) ? null : this.clampLogoSpaceValue($startX);
	}

	set logoSpaceStartX($startX){
		this._set_logoSpaceStartX($startX);
	}

	get logoSpaceStartX(){
		return this._logoSpaceStartX;
	}

	/**
	 * clamp/set vertical logo space start
	 *
	 * @param {number|int|null} $startY
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_logoSpaceStartY($startY){
		this._logoSpaceStartY = (typeof $startY === 'undefined' || $startY === null) ? null : this.clampLogoSpaceValue($startY);
	}

	set logoSpaceStartY($startY){
		this._set_logoSpaceStartY($startY);
	}

	get logoSpaceStartY(){
		return this._logoSpaceStartY;
	}

	/**
	 * clamp/set SVG circle radius
	 *
	 * @param {number|float} $circleRadius
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_circleRadius($circleRadius){
		this._circleRadius = Math.max(0.1, Math.min(0.75, $circleRadius));
	}

	set circleRadius($circleRadius){
		this._set_circleRadius($circleRadius);
	}

	get circleRadius(){
		return this._circleRadius;
	}

	/**
	 * set canvas image type
	 *
	 * @param {string} $canvasImageType
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_canvasMimeType($canvasImageType){
		$canvasImageType = $canvasImageType.toLowerCase();

		if(!['bmp', 'jpeg', 'png', 'webp'].includes($canvasImageType)){
			throw new QRCodeException(`Invalid canvas image type: ${$canvasImageType}`);
		}

		this._canvasMimeType = `image/${$canvasImageType}`;
	}

	set canvasMimeType($canvasImageType){
		this._set_canvasMimeType($canvasImageType);
	}

	get canvasMimeType(){
		return this._canvasMimeType;
	}

}
