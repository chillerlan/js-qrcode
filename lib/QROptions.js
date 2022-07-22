/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QRCodeException from './QRCodeException.js';
import PHPJS from './Common/PHPJS.js';
import {ECC_H, ECC_L, ECC_M, ECC_Q} from './Common/EccLevel.js';
import {MASK_PATTERN_AUTO} from './Common/MaskPattern.js';
import {VERSION_AUTO} from './Common/Version.js';
import {OUTPUT_MARKUP_SVG} from './Output/QROutputInterface.js';

/**
 * The QRCode plug-in settings & setter functionality
 */
export default class QROptions{

	/**
	 * QR Code version number
	 *
	 * [1 ... 40] or QRCode.VERSION_AUTO
	 *
	 * @type {int}
	 */
	version = VERSION_AUTO;

	/**
	 * Minimum QR version
	 *
	 * if $version = QRCode.VERSION_AUTO
	 *
	 * @type {int}
	 */
	versionMin = 1;

	/**
	 * Maximum QR version
	 *
	 * @type {int}
	 */
	versionMax = 40;

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
	 * @type {int}
	 */
	eccLevel = ECC_L;

	/**
	 * Mask Pattern to use (no value in using, mostly for unit testing purposes)
	 *
	 * [0...7] or QRCode::MASK_PATTERN_AUTO
	 *
	 * @type {int}
	 */
	maskPattern = MASK_PATTERN_AUTO;

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
	 * @type {int}
	 */
	quietzoneSize = 4;

	/**
	 * The output type
	 *
	 *   - QRCode::OUTPUT_MARKUP_XXXX where XXXX = HTML, SVG
	 *   - QRCode::OUTPUT_IMAGE_XXX where XXX = PNG, GIF, JPG
	 *   - QRCode::OUTPUT_STRING_XXXX where XXXX = TEXT, JSON
	 *   - QRCode::OUTPUT_CUSTOM
	 *
	 * @type {string}
	 */
	outputType = OUTPUT_MARKUP_SVG;

	/**
	 * the FQCN of the custom QROutputInterface if $outputType is set to QRCode::OUTPUT_CUSTOM
	 *
	 * @type {string|null}
	 */
	outputInterface = null;

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
	 * @type {int}
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
	 * @type {float}
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
	 * SVG viewBox size. a single integer number which defines width/height of the viewBox attribute.
	 *
	 * viewBox="0 0 x x"
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox
	 * @see https://css-tricks.com/scale-svg/#article-header-id-3
	 *
	 * @type {int|null}
	 */
	svgViewBoxSize = null;

	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio
	 *
	 * @type {string}
	 */
	svgPreserveAspectRatio = 'xMidYMid';

	/**
	 * optional "width" attribute with the specified value (note that the value is not checked!)
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/width
	 *
	 * @type {string|null}
	 */
	svgWidth = null;

	/**
	 * optional "height" attribute with the specified value (note that the value is not checked!)
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/height
	 *
	 * @type {string|null}
	 */
	svgHeight = null;

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
	 * @type {int[]}
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
	 * @type {float}
	 */
	circleRadius = 0.45;

	/**
	 * specifies which module types to exclude when $svgDrawCircularModules is set to true
	 *
	 * @type {int[]}
	 */
	keepAsSquare = [];

	/**
	 * string substitute for dark
	 *
	 * @type {string}
	 */
	textDark = '🔴';

	/**
	 * string substitute for light
	 *
	 * @type {string}
	 */
	textLight = '⭕';

	/**
	 * markup substitute for dark (CSS value)
	 *
	 * @type {string}
	 */
	markupDark = '#000';

	/**
	 * markup substitute for light (CSS value)
	 *
	 * @type {string}
	 */
	markupLight = '#fff';

	/**
	 * toggle base64 or raw image data
	 *
	 * @type {boolean}
	 */
	imageBase64 = true;

	/**
	 * toggle background transparency
	 *
	 * - In GdImage mode (png, gif) it sets imagecolortransparent() with QROptions::$imageTransparencyBG.
	 *   It also sets the "normal" background color without transparency switch.
	 *
	 * - In SVG mode (as of v5), it won't render the "light" modules,
	 *   as opacity/transparency can easily be set with css properties.
	 *
	 * - It has no effect in the FPDF and Imagick output modules.
	 *
	 * @see \chillerlan\QRCode\QROptions::$imageTransparencyBG
	 * @see https://github.com/chillerlan/php-qrcode/discussions/121
	 *
	 * @type {boolean}
	 */
	imageTransparent = true;

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
	 * @type {boolean}
	 */
	addLogoSpace = false;

	/**
	 * width of the logo space
	 *
	 * @type {int}
	 */
	logoSpaceWidth = 0;

	/**
	 * height of the logo space
	 *
	 * @type {int}
	 */
	logoSpaceHeight = 0;

	/**
	 * optional horizontal start position of the logo space (top left corner)
	 *
	 * @type {int|null}
	 */
	logoSpaceStartX = null;

	/**
	 * optional vertical start position of the logo space (top left corner)
	 *
	 * @type {int|null}
	 */
	logoSpaceStartY = null;

	/**
	 * @param {{}|null} $options
	 */
	constructor($options = null){

		if(typeof $options === 'object'){
			for(let $property in $options){
				if(Object.prototype.hasOwnProperty.call(this, $property)){
					this[$property] = $options[$property];
				}
			}
		}

	}

	/**
	 * clamp min/max version number
	 *
	 * @param {int} $versionMin
	 * @param {int} $versionMax
	 *
	 * @returns {void}
	 *
	 * @protected
	 */
	setMinMaxVersion($versionMin, $versionMax){
		let $min = Math.max(1, Math.min(40, $versionMin));
		let $max = Math.max(1, Math.min(40, $versionMax));

		this.versionMin = Math.min($min, $max);
		this.versionMax = Math.max($min, $max);
	}

	/**
	 * sets the minimum version number
	 *
	 * @param {int} $versionMin
	 *
	 * @returns {void}
	 */
	set versionMin($versionMin){ // eslint-disable-line no-dupe-class-members
		this.setMinMaxVersion($versionMin, this.versionMax);
	}

	/**
	 * sets the maximum version number
	 *
	 * @param {int} $versionMax
	 *
	 * @returns {void}
	 */
	set versionMax($versionMax){ // eslint-disable-line no-dupe-class-members
		this.setMinMaxVersion(this.versionMin, $versionMax);
	}

	/**
	 * sets/clamps the version number
	 *
	 * @param {int} $version
	 *
	 * @returns {void}
	 */
	set version($version){ // eslint-disable-line no-dupe-class-members

		if($version !== VERSION_AUTO){
			this.version = Math.max(1, Math.min(40, $version));
		}

	}

	/**
	 * sets the error correction level
	 *
	 * @param {int} $eccLevel
	 *
	 * @returns {void}
	 * @throws \chillerlan\QRCode\QRCodeException
	 */
	set eccLevel($eccLevel){ // eslint-disable-line no-dupe-class-members

		if(![ECC_L, ECC_M, ECC_Q, ECC_H].includes($eccLevel)){
			throw new QRCodeException('Invalid error correct level: ' + $eccLevel);
		}

		this.eccLevel = $eccLevel;
	}

	/**
	 * sets/clamps the mask pattern
	 *
	 * @param {int} $maskPattern
	 *
	 * @returns {void}
	 */
	set maskPattern($maskPattern){ // eslint-disable-line no-dupe-class-members

		if($maskPattern !== MASK_PATTERN_AUTO){
			this.maskPattern = Math.max(0, Math.min(7, $maskPattern));
		}

	}

	/**
	 * sets/clamps the quiet zone size
	 *
	 * @param {int} $quietzoneSize
	 *
	 * @returns {void}
	 */
	set quietzoneSize($quietzoneSize){ // eslint-disable-line no-dupe-class-members
		this.quietzoneSize = Math.max(0, Math.min($quietzoneSize, 75));
	}

	/**
	 * clamp the logo space values between 0 and maximum length (177 modules at version 40)
	 *
	 * @param {int} $value
	 *
	 * @returns {int}
	 * @protected
	 */
	clampLogoSpaceValue($value){
		$value = PHPJS.intval($value);

		return Math.max(0, Math.min(177, $value));
	}

	/**
	 * clamp/set logo space width
	 *
	 * @param {int} $width
	 *
	 * @returns {void}
	 */
	set logoSpaceWidth($width){ // eslint-disable-line no-dupe-class-members
		this.logoSpaceWidth = this.clampLogoSpaceValue($width);
	}

	/**
	 * clamp/set logo space height
	 *
	 * @param {int} $height
	 *
	 * @returns {void}
	 */
	set logoSpaceHeight($height){ // eslint-disable-line no-dupe-class-members
		this.logoSpaceHeight = this.clampLogoSpaceValue($height);
	}

	/**
	 * clamp/set horizontal logo space start
	 *
	 * @param {int|null} $startX
	 *
	 * @returns {void}
	 */
	set logoSpaceStartX($startX){ // eslint-disable-line no-dupe-class-members
		this.logoSpaceStartX = (typeof $startX === 'undefined' || $startX === null) ? null : this.clampLogoSpaceValue($startX);
	}

	/**
	 * clamp/set vertical logo space start
	 *
	 * @param {int|null} $startY
	 *
	 * @returns {void}
	 */
	set logoSpaceStartY($startY){ // eslint-disable-line no-dupe-class-members
		this.logoSpaceStartY = (typeof $startY === 'undefined' || $startY === null) ? null : this.clampLogoSpaceValue($startY);
	}

	/**
	 * clamp/set SVG circle radius
	 *
	 * @param {float} $circleRadius
	 *
	 * @returns {void}
	 */
	set circleRadius($circleRadius){ // eslint-disable-line no-dupe-class-members
		this.circleRadius = Math.max(0.1, Math.min(0.75, $circleRadius));
	}

}
