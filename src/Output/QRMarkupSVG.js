/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QRMarkup from './QRMarkup.js';
import {IS_DARK} from '../Common/constants.js';

/**
 * SVG output
 *
 * @see https://github.com/codemasher/php-qrcode/pull/5
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg
 * @see https://www.sarasoueidan.com/demos/interactive-svg-coordinate-system/
 * @see http://apex.infogridpacific.com/SVG/svg-tutorial-contents.html
 */
export default class QRMarkupSVG extends QRMarkup{

	/**
	 * @inheritDoc
	 */
	createMarkup($saveToFile){
		let $svg = this.header();
		let $eol = this.options.eol;

		if(this.options.svgDefs){
			let $s1 = this.options.svgDefs;

			$svg += `<defs>${$s1}${$eol}</defs>${$eol}`;
		}

		$svg += this.paths();

		// close svg
		$svg += `${$eol}</svg>${$eol}`;

		// transform to data URI only when not saving to file
		if(!$saveToFile && this.options.imageBase64){
			$svg = this.base64encode($svg, 'image/svg+xml');
		}

		return $svg;
	}

	/**
	 * returns the <svg> header with the given options parsed
	 *
	 * @returns {string}
	 */
	header(){
		let $size   = this.options.svgViewBoxSize || this.moduleCount;
		let $width  = this.options.svgWidth !== null ? ` width="${this.options.svgWidth}"` : '';
		let $height = this.options.svgHeight !== null ? ` height="${this.options.svgHeight}"` : '';

		return `<?xml version="1.0" encoding="UTF-8"?>${this.options.eol}<svg xmlns="http://www.w3.org/2000/svg" class="qr-svg ${this.options.cssClass}" viewBox="0 0 ${$size} ${$size}" preserveAspectRatio="${this.options.svgPreserveAspectRatio}"${$width}${$height}>${this.options.eol}`;
	}

	/**
	 * returns one or more SVG <path> elements
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path
	 *
	 * @returns {string}
	 */
	paths(){
		let $paths = this.collectModules(($x, $y, $M_TYPE) => this.module($x, $y, $M_TYPE));
		let $svg = [];

		// create the path elements
		for(let $M_TYPE in $paths){
			// limit the total line length
			let $chunkSize = 100;
			let $chonks    = [];

			for(let $i = 0; $i < $paths[$M_TYPE].length; $i += $chunkSize){
				$chonks.push($paths[$M_TYPE].slice($i, $i + $chunkSize).join(' '));
			}

			let $path = $chonks.join(this.options.eol);

			if($path === ''){
				continue;
			}

			let $type = this.moduleValues[$M_TYPE] || '';
			let $cssClass = this.getCssClass($M_TYPE);

			// ignore non-existent module values
			let $element = $type === ''
				? `<path class="${$cssClass}" d="${$path}"/>`
				: `<path class="${$cssClass}" fill="${$type}" fill-opacity="${this.options.svgOpacity}" d="${$path}"/>`;

			$svg.push($element);
		}

		return $svg.join(this.options.eol);
	}

	/**
	 * @inheritDoc
	 */
	getCssClass($M_TYPE){
		return [
			`qr-${$M_TYPE}`,
			($M_TYPE & IS_DARK) === IS_DARK ? 'dark' : 'light',
			this.options.cssClass,
		].join(' ');
	}

	/**
	 * returns a path segment for a single module
	 *
	 * yes, <symbol>/<use> is better except it isn't.
	 * @see https://github.com/chillerlan/php-qrcode/issues/127#issuecomment-1148627245
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
	 *
	 * @param {int} $x
	 * @param {int} $y
	 * @param {int} $M_TYPE
	 *
	 * @returns {string}
	 */
	module($x, $y, $M_TYPE){

		if(!this.options.drawLightModules && !this.matrix.check($x, $y)){
			return '';
		}

		if(this.options.drawCircularModules && this.matrix.checkTypeNotIn($x, $y, this.options.keepAsSquare)){
			// some values come with the usual JS float fun and i won't do shit about it
			let r  = parseFloat(this.options.circleRadius);
			let d  = (r * 2);
			let ix = ($x + 0.5 - r);
			let iy = ($y + 0.5);

			if(ix < 1){
				ix = ix.toPrecision(3);
			}

			return `M${ix} ${iy} a${r} ${r} 0 1 0 ${d} 0 a${r} ${r} 0 1 0 -${d} 0Z`;
		}

		return `M${$x} ${$y} h1 v1 h-1Z`;
	}

}
