/**
 * @created      10.06.2024
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2024 smiley
 * @license      MIT
 */

import {QROptions} from '../src/index.js';

/**
 * The options class for RoundQuietzoneSVGoutput
 */
export default class RoundQuietzoneOptions extends QROptions{

	/**
	 * we need to add the constructor with a parent call here,
	 * otherwise the additional properties will not be recognized
	 *
	 * @inheritDoc
	 */
	constructor($options = null){
		super();
//			this.__workaround__.push('myMagicProp');
		this._fromIterable($options)
	}

	/**
	 * The amount of additional modules to be used in the circle diameter calculation
	 *
	 * Note that the middle of the circle stroke goes through the (assumed) outer corners
	 * or centers of the QR Code (excluding quiet zone)
	 *
	 * Example:
	 *
	 * - a value of -1 would go through the center of the outer corner modules of the finder patterns
	 * - a value of 0 would go through the corner of the outer modules of the finder patterns
	 * - a value of 3 would go through the center of the module outside next to the finder patterns, in a 45-degree angle
	 *
	 * @type {number|int}
	 */
	additionalModules = 0;

	/**
	 * the logo as SVG string (e.g. from simple-icons)
	 *
	 * @type {string}
	 */
	svgLogo = '';

	/**
	 * an optional css class for the logo <g> container
	 *
	 * @type {string}
	 */
	svgLogoCssClass = '';

	/**
	 * logo scale in % of QR Code size, internally clamped to 5%-25%
	 *
	 * @type {number|float}
	 */
	svgLogoScale = 0.20;

	/**
	 * the IDs for the several colored layers, translates to css class "qr-123" which can be used in the stylesheet
	 *
	 * note that the layer id has to be an integer value, ideally outside the several bitmask values
	 *
	 * @type {int[]}
	 * @see QRMarkupSVG.getCssClass()
	 */
	dotColors = [];
}
