/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QROutputAbstract from './QROutputAbstract.js';
import {LAYERNAMES} from '../Common/constants.js';

/**
 * SVG output
 *
 * @see https://github.com/codemasher/php-qrcode/pull/5
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg
 * @see https://www.sarasoueidan.com/demos/interactive-svg-coordinate-system/
 * @see http://apex.infogridpacific.com/SVG/svg-tutorial-contents.html
 */
export default class QRMarkupSVG extends QROutputAbstract{

	/**
	 * @inheritDoc
	 */
	mimeType = 'image/svg+xml';

	/**
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

		// url(...)
		if($value.match(/^url\([-\/#a-z\d]+\)$/i)){
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
		return $value.replace(/(<([^>]+)>)/gi, '').replace(/([ '"\r\n\t]+)/g, '');
	}

	/**
	 * @inheritDoc
	 */
	getDefaultModuleValue($isDark){
		return $isDark ? '#000' : '#fff';
	}

	/**
	 * @inheritDoc
	 *
	 * @returns {number[]|int[]}
	 */
	getOutputDimensions(){
		return [this.moduleCount, this.moduleCount];
	}

	/**
	 * @protected
	 */
	getCssClass($M_TYPE){
		return [
			`qr-${LAYERNAMES[$M_TYPE] ?? $M_TYPE}`,
			this.matrix.isDark($M_TYPE) ? 'dark' : 'light',
			this.options.cssClass,
		].join(' ');
	}

	/**
	 * @inheritDoc
	 *
	 * @returns {HTMLElement|SVGElement|ChildNode|string|*}
	 */
	dump($file = null){
		let $data = this._createMarkup($file !== null);

		this.saveToFile($data, $file);

		if(this.options.returnAsDomElement){
			let doc = new DOMParser().parseFromString($data.trim(), this.mimeType);

			return doc.firstChild;
		}

		if(this.options.outputBase64){
			$data = this.toBase64DataURI($data, this.mimeType);
		}

		return $data;
	}

	/**
	 * @inheritDoc
	 */
	_createMarkup($saveToFile){
		let $svg = this.header();
		let $eol = this.options.eol;

		if(this.options.svgDefs){
			let $s1 = this.options.svgDefs;

			$svg += `<defs>${$s1}${$eol}</defs>${$eol}`;
		}

		$svg += this.paths();

		// close svg
		$svg += `${$eol}</svg>${$eol}`;

		return $svg;
	}

	/**
	 * returns the value for the SVG viewBox attribute
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox
	 * @see https://css-tricks.com/scale-svg/#article-header-id-3
	 *
	 * @returns {string}
	 */
	getViewBox(){
		let [$width, $height] = this.getOutputDimensions();

		return `0 0 ${$width} ${$height}`;
	}

	/**
	 * returns the <svg> header with the given options parsed
	 *
	 * @returns {string}
	 */
	header(){

		let $header = `<svg xmlns="http://www.w3.org/2000/svg" class="qr-svg ${this.options.cssClass}" `
			+ `viewBox="${this.getViewBox()}" preserveAspectRatio="${this.options.svgPreserveAspectRatio}">${this.options.eol}`;

		if(this.options.svgAddXmlHeader){
			$header = `<?xml version="1.0" encoding="UTF-8"?>${this.options.eol}${$header}`;
		}

		return $header;
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

			if($path.trim() === ''){
				continue;
			}

			$svg.push(this.path($path, $M_TYPE));
		}

		return $svg.join(this.options.eol);
	}

	/**
	 * renders and returns a single <path> element
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path
	 *
	 * @param {string} $path
	 * @param {number|int} $M_TYPE
	 * @returns {string}
	 * @protected
	 */
	path($path, $M_TYPE){
		let $cssClass = this.getCssClass($M_TYPE);

		if(this.options.svgUseFillAttributes){
			return `<path class="${$cssClass}" fill="${this.getModuleValue($M_TYPE)}" `
				+ `fill-opacity="${this.options.svgOpacity}" d="${$path}"/>`;
		}

		return `<path class="${$cssClass}" d="${$path}"/>`;
	}

	/**
	 * returns a path segment for a single module
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
	 *
	 * @param {number|int} $x
	 * @param {number|int} $y
	 * @param {number|int} $M_TYPE
	 *
	 * @returns {string}
	 */
	module($x, $y, $M_TYPE){

		if(!this.options.drawLightModules && !this.matrix.check($x, $y)){
			return '';
		}

		if(this.options.drawCircularModules && !this.matrix.checkTypeIn($x, $y, this.options.keepAsSquare)){
			// some values come with the usual JS float fun and i won't do shit about it
			let r  = parseFloat(this.options.circleRadius);
			let d  = (r * 2);
			let ix = ($x + 0.5 - r);
			let iy = ($y + 0.5);

			if(ix < 1){
				ix = ix.toPrecision(3);
			}

			if(iy < 1){
				iy = iy.toPrecision(3);
			}

			return `M${ix} ${iy} a${r} ${r} 0 1 0 ${d} 0 a${r} ${r} 0 1 0 -${d} 0Z`;
		}

		return `M${$x} ${$y} h1 v1 h-1Z`;
	}

}
