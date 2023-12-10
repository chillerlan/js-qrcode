/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QRCodeException from './QRCodeException.js';
import PHPJS from './Common/PHPJS.js';
import {
	ECC_H, ECC_L, ECC_M, ECC_Q, MASK_PATTERN_AUTO, VERSION_AUTO, OUTPUT_MARKUP_SVG
} from './Common/constants.js';

/**
 * The QRCode plug-in settings & setter functionality
 */
export default class QROptions{

	/**
	 * QR Code version number
	 *
	 * [1 ... 40] or QRCode.VERSION_AUTO
	 *
	 * @type {Number<int>}
	 * @protected
	 */
	_version = VERSION_AUTO;

	/**
	 * Minimum QR version
	 *
	 * if $version = QRCode.VERSION_AUTO
	 *
	 * @type {Number<int>}
	 * @protected
	 */
	_versionMin = 1;

	/**
	 * Maximum QR version
	 *
	 * @type {Number<int>}
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
	 * @type {Number<int>}
	 * @protected
	 */
	_eccLevel = ECC_L;

	/**
	 * Mask Pattern to use (no value in using, mostly for unit testing purposes)
	 *
	 * [0...7] or QRCode::MASK_PATTERN_AUTO
	 *
	 * @type {Number<int>}
	 * @protected
	 */
	_maskPattern = MASK_PATTERN_AUTO;

	/**
	 * Add a "quiet zone" (margin) according to the QR code spec
	 *
	 * @see https://www.qrcode.com/en/howto/code.html
	 *
	 * @type {Boolean}
	 */
	addQuietzone = true;

	/**
	 * Size of the quiet zone
	 *
	 * internally clamped to [0 ... $moduleCount / 2], defaults to 4 modules
	 *
	 * @type {Number<int>}
	 * @protected
	 */
	_quietzoneSize = 4;

	/**
	 * The output type
	 *
	 *   - QRCode::OUTPUT_MARKUP_XXXX where XXXX = HTML, SVG
	 *   - QRCode::OUTPUT_IMAGE_XXX where XXX = PNG, GIF, JPG
	 *   - QRCode::OUTPUT_STRING_XXXX where XXXX = TEXT, JSON
	 *   - QRCode::OUTPUT_CUSTOM
	 *
	 * @type {String}
	 */
	outputType = OUTPUT_MARKUP_SVG;

	/**
	 * the FQCN of the custom QROutputInterface if $outputType is set to QRCode::OUTPUT_CUSTOM
	 *
	 * @type {String|null}
	 */
	outputInterface = null;

	/**
	 * /path/to/cache.file
	 *
	 * @type {String|null}
	 */
	cachefile = null;

	/**
	 * newline string [HTML, SVG, TEXT]
	 *
	 * @type {String}
	 */
	eol = '\n';

	/**
	 * size of a QR code pixel [SVG, IMAGE_*], HTML via CSS
	 *
	 * @type {Number<int>}
	 */
	scale = 5;

	/**
	 * a common css class
	 *
	 * @type {String}
	 */
	cssClass = 'qrcode';

	/**
	 * SVG opacity
	 *
	 * @type {Number<float>}
	 */
	svgOpacity = 1.0;

	/**
	 * anything between <defs>
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs
	 *
	 * @type {String}
	 */
	svgDefs = '';

	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
	 *
	 * @type {String}
	 */
	svgPreserveAspectRatio = 'xMidYMid';

	/**
	 * whether to connect the paths for the several module types to avoid weird glitches when using gradients etc.
	 *
	 * @see https://github.com/chillerlan/php-qrcode/issues/57
	 *
	 * @type {Boolean}
	 */
	connectPaths = false;

	/**
	 * specify which paths/patterns to exclude from connecting if $svgConnectPaths is set to true
	 *
	 * @type {Number<int>[]}
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
	 * @type {Boolean}
	 */
	drawCircularModules = false;

	/**
	 * specifies the radius of the modules when $svgDrawCircularModules is set to true
	 *
	 * @type {Number<float>}
	 * @protected
	 */
	_circleRadius = 0.45;

	/**
	 * specifies which module types to exclude when $svgDrawCircularModules is set to true
	 *
	 * @type {Number<int>[]}
	 */
	keepAsSquare = [];

	/**
	 * toggle base64 or raw image data
	 *
	 * @type {Boolean}
	 */
	imageBase64 = false;

	/**
	 * toggle background transparency
	 *
	 * if transparency is disabled, a background color should be specified to avoid unexpected outcomes
	 *
	 * @see QROptions.bgcolor
	 *
	 * @type {Boolean}
	 */
	imageTransparent = true;

	/**
	 * whether to draw the light (false) modules
	 *
	 * @type {Boolean}
	 */
	drawLightModules = true;

	/**
	 * Module values map
	 *
	 *   - HTML, IMAGICK: #ABCDEF, cssname, rgb(), rgba()...
	 *   - IMAGE: [63, 127, 255] // R, G, B
	 *
	 * @type {{}|null}
	 */
	moduleValues = null;

	/**
	 * Toggles logo space creation
	 *
	 * @type {Boolean}
	 */
	addLogoSpace = false;

	/**
	 * width of the logo space
	 *
	 * @type {Number<int>}
	 * @protected
	 */
	_logoSpaceWidth = 0;

	/**
	 * height of the logo space
	 *
	 * @type {Number<int>}
	 * @protected
	 */
	_logoSpaceHeight = 0;

	/**
	 * optional horizontal start position of the logo space (top left corner)
	 *
	 * @type {Number<int>|null}
	 * @protected
	 */
	_logoSpaceStartX = null;

	/**
	 * optional vertical start position of the logo space (top left corner)
	 *
	 * @type {Number<int>|null}
	 * @protected
	 */
	_logoSpaceStartY = null;

	/**
	 * whether to return the markup as DOM element
	 *
	 * @type {Boolean}
	 */
	returnMarkupAsHtmlElement = false;

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
	 * canvas image type for bas64/file output
	 *
	 * the value may be one of the following (depends on browser/engine):
	 *
	 * - png
	 * - jpeg
	 * - bmp
	 * - webp
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
	 *
	 * @type {String}
	 * @protected
	 */
	_canvasImageType = 'png';

	/**
	 * canvas image quality
	 *
	 *  "A Number between 0 and 1 indicating the image quality to be used when creating images
	 *   using file formats that support lossy compression (such as image/jpeg or image/webp).
	 *   A user agent will use its default quality value if this option is not specified,
	 *   or if the number is outside the allowed range."
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
	 *
	 * @type {Number<float>}
	 */
	canvasImageQuality = 0.85;

	/**
	 * @param {Object<{}>|null} $options
	 */
	constructor($options = null){
		// because javascript is dumb and we can't call getters and setters directly we have to a this silly workaround
		let _workaround = [
			'canvasImageType', 'circleRadius', 'eccLevel', 'logoSpaceHeight', 'logoSpaceWidth', 'logoSpaceStartX',
			'logoSpaceStartY', 'maskPattern', 'quietzoneSize', 'version', 'versionMin', 'versionMax',
		];

		if(typeof $options === 'object'){
			for(let $property in $options){
				if(_workaround.includes($property)){
					this['_set_'+$property]($options[$property]);
				}
				else if(Object.prototype.hasOwnProperty.call(this, $property)){
					this[$property] = $options[$property];
				}
			}
		}

	}

	/**
	 * clamp min/max version number
	 *
	 * @param {Number<int>} $versionMin
	 * @param {Number<int>} $versionMax
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
	 * @param {Number<int>} $versionMin
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_versionMin($versionMin){
		this.setMinMaxVersion($versionMin, this._versionMax);
	}

	set versionMin($versionMin){ // eslint-disable-line no-dupe-class-members
		this._set_versionMin($versionMin);
	}

	get versionMin(){ // eslint-disable-line no-dupe-class-members
		return this._versionMin;
	}

	/**
	 * sets the maximum version number
	 *
	 * @param {Number<int>} $versionMax
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_versionMax($versionMax){
		this.setMinMaxVersion(this._versionMin, $versionMax);
	}

	set versionMax($versionMax){ // eslint-disable-line no-dupe-class-members
		this._set_versionMax($versionMax);
	}

	get versionMax(){ // eslint-disable-line no-dupe-class-members
		return this._versionMax;
	}

	/**
	 * sets/clamps the version number
	 *
	 * @param {Number<int>} $version
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_version($version){
		this._version = $version !== VERSION_AUTO ? Math.max(1, Math.min(40, $version)) : VERSION_AUTO;
	}

	set version($version){ // eslint-disable-line no-dupe-class-members
		this._set_version($version);
	}

	get version(){ // eslint-disable-line no-dupe-class-members
		return this._version;
	}

	/**
	 * sets the error correction level
	 *
	 * @param {Number<int>} $eccLevel
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

	set eccLevel($eccLevel){ // eslint-disable-line no-dupe-class-members
		this._set_eccLevel($eccLevel);
	}

	get eccLevel(){ // eslint-disable-line no-dupe-class-members
		return this._eccLevel;
	}

	/**
	 * sets/clamps the mask pattern
	 *
	 * @param {Number<int>} $maskPattern
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_maskPattern($maskPattern){

		if($maskPattern !== MASK_PATTERN_AUTO){
			this._maskPattern = Math.max(0, Math.min(7, $maskPattern));
		}

	}

	set maskPattern($maskPattern){ // eslint-disable-line no-dupe-class-members
		this._set_maskPattern($maskPattern);
	}

	get maskPattern(){ // eslint-disable-line no-dupe-class-members
		return this._maskPattern;
	}

	/**
	 * sets/clamps the quiet zone size
	 *
	 * @param {Number<int>} $quietzoneSize
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_quietzoneSize($quietzoneSize){
		this._quietzoneSize = Math.max(0, Math.min($quietzoneSize, 75));
	}

	set quietzoneSize($quietzoneSize){ // eslint-disable-line no-dupe-class-members
		this._set_quietzoneSize($quietzoneSize) ;
	}

	get quietzoneSize(){ // eslint-disable-line no-dupe-class-members
		return this._quietzoneSize;
	}

	/**
	 * clamp the logo space values between 0 and maximum length (177 modules at version 40)
	 *
	 * @param {Number<int>} $value
	 *
	 * @returns {Number<int>}
	 * @protected
	 */
	clampLogoSpaceValue($value){
		$value = PHPJS.intval($value);

		return Math.max(0, Math.min(177, $value));
	}

	/**
	 * clamp/set logo space width
	 *
	 * @param {Number<int>} $width
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_logoSpaceWidth($width){
		this._logoSpaceWidth = this.clampLogoSpaceValue($width);
	}

	set logoSpaceWidth($width){ // eslint-disable-line no-dupe-class-members
		this._set_logoSpaceWidth($width);
	}

	get logoSpaceWidth(){ // eslint-disable-line no-dupe-class-members
		return this._logoSpaceWidth;
	}

	/**
	 * clamp/set logo space height
	 *
	 * @param {Number<int>} $height
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_logoSpaceHeight($height){
		this._logoSpaceHeight = this.clampLogoSpaceValue($height);
	}

	set logoSpaceHeight($height){ // eslint-disable-line no-dupe-class-members
		this._set_logoSpaceHeight($height);
	}

	get logoSpaceHeight(){ // eslint-disable-line no-dupe-class-members
		return this._logoSpaceHeight;
	}

	/**
	 * clamp/set horizontal logo space start
	 *
	 * @param {Number<int>|null} $startX
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_logoSpaceStartX($startX){
		this._logoSpaceStartX = (typeof $startX === 'undefined' || $startX === null) ? null : this.clampLogoSpaceValue($startX);
	}

	set logoSpaceStartX($startX){ // eslint-disable-line no-dupe-class-members
		this._set_logoSpaceStartX($startX);
	}

	get logoSpaceStartX(){ // eslint-disable-line no-dupe-class-members
		return this._logoSpaceStartX;
	}

	/**
	 * clamp/set vertical logo space start
	 *
	 * @param {Number<int>|null} $startY
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_logoSpaceStartY($startY){
		this._logoSpaceStartY = (typeof $startY === 'undefined' || $startY === null) ? null : this.clampLogoSpaceValue($startY);
	}

	set logoSpaceStartY($startY){ // eslint-disable-line no-dupe-class-members
		this._set_logoSpaceStartY($startY);
	}

	get logoSpaceStartY(){ // eslint-disable-line no-dupe-class-members
		return this._logoSpaceStartY;
	}

	/**
	 * clamp/set SVG circle radius
	 *
	 * @param {Number<float>} $circleRadius
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_circleRadius($circleRadius){
		this._circleRadius = Math.max(0.1, Math.min(0.75, $circleRadius));
	}

	set circleRadius($circleRadius){ // eslint-disable-line no-dupe-class-members
		this._set_circleRadius($circleRadius);
	}

	get circleRadius(){ // eslint-disable-line no-dupe-class-members
		return this._circleRadius;
	}

	/**
	 * set canvas image type
	 *
	 * @param {String} $canvasImageType
	 *
	 * @returns {void}
	 * @protected
	 */
	_set_canvasImageType($canvasImageType){
		$canvasImageType = $canvasImageType.toLowerCase();

		if(!['bmp', 'jpeg', 'png', 'webp'].includes($canvasImageType)){
			throw new QRCodeException(`Invalid canvas image type: ${$canvasImageType}`);
		}

		this._canvasImageType = $canvasImageType;
	}

	set canvasImageType($canvasImageType){ // eslint-disable-line no-dupe-class-members
		this._set_canvasImageType($canvasImageType);
	}

	get canvasImageType(){ // eslint-disable-line no-dupe-class-members
		return this._canvasImageType;
	}

}
