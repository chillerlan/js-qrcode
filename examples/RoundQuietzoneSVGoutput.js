/**
 * @created      10.06.2024
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2024 smiley
 * @license      MIT
 */

import {IS_DARK, M_DATA, M_LOGO, M_QUIETZONE, M_QUIETZONE_DARK, QRMarkupSVG} from '../src/index.js';

/**
 * A custom SVG output class
 *
 * @see https://github.com/chillerlan/php-qrcode/discussions/137
 */
export default class RoundQuietzoneSVGoutput extends QRMarkupSVG{

	radius;
	center;
	logoScale;

	/**
	 * @inheritDoc
	 */
	createMarkup($saveToFile){

		// some Pythagorean magick
		let $diameter  = Math.sqrt(2 * Math.pow((this.moduleCount + this.options.additionalModules), 2));
		this.radius    = ($diameter / 2).toFixed(3);

		// clamp the logo scale
		this.logoScale = Math.max(0.05, Math.min(0.25, this.options.svgLogoScale));

		// calculate the quiet zone size, add 1 to it as the outer circle stroke may go outside of it
		let $quietzoneSize = (Math.ceil(($diameter - this.moduleCount) / 2) + 1);

		// add the quiet zone to fill the circle
		this.matrix.setQuietZone($quietzoneSize);

		// update the matrix dimensions to avoid errors in subsequent calculations
		// the moduleCount is now QR Code matrix + 2x quiet zone
		this.setMatrixDimensions();
		this.center = (this.moduleCount / 2);

		// clear the logo space
		this.clearLogoSpace();

		// color the quiet zone
		this.colorQuietzone($quietzoneSize, this.radius);

		// start SVG output
		let $svg = this.header();
		let $eol = this.options.eol;

		if(this.options.svgDefs !== ''){
			$svg += `<defs>${this.options.svgDefs}${$eol}</defs>${$eol}`;
		}

		$svg += this.paths();
		$svg += this.addCircle(this.radius);
		$svg += this.getLogo();

		// close svg
		$svg += `${$eol}</svg>${$eol}`;

		return $svg;
	}

	/**
	 * Clears a circular area for the logo
	 */
	clearLogoSpace(){
		let $logoSpaceSize = (Math.ceil(this.moduleCount * this.logoScale) + 1);
		// set a rectangular space instead
//			this.matrix.setLogoSpace($logoSpaceSize);

		let $r = ($logoSpaceSize / 2) + this.options.circleRadius;

		for(let $y = 0; $y < this.moduleCount; $y++){
			for(let $x = 0; $x < this.moduleCount; $x++){

				if(this.checkIfInsideCircle(($x + 0.5), ($y + 0.5), this.center, this.center, $r)){
					this.matrix.set($x, $y, false, M_LOGO);

				}

			}
		}

	}

	/**
	 * Sets random modules of the quiet zone to dark
	 *
	 * @param {number|int}   $quietzoneSize
	 * @param {number|float} $radius
	 */
	colorQuietzone($quietzoneSize, $radius){
		let $l1 = ($quietzoneSize - 1);
		let $l2 = (this.moduleCount - $quietzoneSize);
		// substract 1/2 stroke width and module radius from the circle radius to not cut off modules
		let $r = ($radius - this.options.circleRadius * 2);

		for(let $y = 0; $y < this.moduleCount; $y++){
			for(let $x = 0; $x < this.moduleCount; $x++){

				// skip anything that's not quiet zone
				if(!this.matrix.checkType($x, $y, M_QUIETZONE)){
					continue;
				}

				// leave one row of quiet zone around the matrix
				if(
					($x === $l1 && $y >= $l1 && $y <= $l2)
					|| ($x === $l2 && $y >= $l1 && $y <= $l2)
					|| ($y === $l1 && $x >= $l1 && $x <= $l2)
					|| ($y === $l2 && $x >= $l1 && $x <= $l2)
				){
					continue;
				}

				// we need to add 0.5 units to the check values since we're calculating the element centers
				// ($x/$y is the element's assumed top left corner)
				if(this.checkIfInsideCircle(($x + 0.5), ($y + 0.5), this.center, this.center, $r)){
					let randomBoolean = (Math.random() < 0.5);

					this.matrix.set($x, $y, randomBoolean, M_QUIETZONE);
				}

			}
		}
	}

	/**
	 * @see https://stackoverflow.com/a/7227057
	 *
	 * @param {number|float} $x
	 * @param {number|float} $y
	 * @param {number|float} $centerX
	 * @param {number|float} $centerY
	 * @param {number|float} $radius
	 */
	checkIfInsideCircle($x, $y, $centerX, $centerY, $radius){
		let $dx = Math.abs($x - $centerX);
		let $dy = Math.abs($y - $centerY);

		if(($dx + $dy) <= $radius){
			return true;
		}

		if($dx > $radius || $dy > $radius){
			return false;
		}

		return (Math.pow($dx, 2) + Math.pow($dy, 2)) <= Math.pow($radius, 2);
	}

	/**
	 * add a solid circle around the matrix
	 *
	 * @param {number|float} $radius
	 */
	addCircle($radius){
		let pos    = this.center.toFixed(3);
		let stroke = (this.options.circleRadius * 2).toFixed(3);

		return `<circle class="qr-circle" cx="${pos}" cy="${pos}" r="${$radius}" stroke-width="${stroke}"/>${this.options.eol}`;
	}

	/**
	 * returns the SVG logo wrapped in a <g> container with a transform that scales it proportionally
	 */
	getLogo(){
		let eol = this.options.eol;
		let pos = (this.moduleCount - this.moduleCount * this.logoScale) / 2;

		return `<g transform="translate(${pos} ${pos}) scale(${this.logoScale})" class="${this.options.svgLogoCssClass}">${eol}${this.options.svgLogo}${eol}</g>`
	}

	/**
	 * @inheritDoc
	 */
	collectModules($transform){
		let $paths = {};
		let $matrix = this.matrix.getMatrix();
		let $y = 0;

		// collect the modules for each type
		for(let $row of $matrix){
			let $x = 0;

			for(let $M_TYPE of $row){
				let $M_TYPE_LAYER = $M_TYPE;

				if(this.options.connectPaths && !this.matrix.checkTypeIn($x, $y, this.options.excludeFromConnect)){
					// to connect paths we'll redeclare the $M_TYPE_LAYER to data only
					$M_TYPE_LAYER = M_DATA;

					if(this.matrix.check($x, $y)){
						$M_TYPE_LAYER |= IS_DARK;
					}
				}

				// randomly assign another $M_TYPE_LAYER for the given types
				if($M_TYPE_LAYER === M_QUIETZONE_DARK){
					let key = Math.floor(Math.random() * this.options.dotColors.length);

					$M_TYPE_LAYER = this.options.dotColors[key];
				}

				// collect the modules per $M_TYPE
				let $module = $transform($x, $y, $M_TYPE, $M_TYPE_LAYER);

				if($module){
					if(!$paths[$M_TYPE_LAYER]){
						$paths[$M_TYPE_LAYER] = [];
					}

					$paths[$M_TYPE_LAYER].push($module);
				}
				$x++;
			}
			$y++;
		}

		// beautify output


		return $paths;
	}

	/**
	 * @inheritDoc
	 */
	module($x, $y, $M_TYPE){

		// we'll ignore anything outside the circle
		if(!this.checkIfInsideCircle(($x + 0.5), ($y + 0.5), this.center, this.center, this.radius)){
			return '';
		}

		if((!this.options.drawLightModules && !this.matrix.check($x, $y))){
			return '';
		}

		if(this.options.drawCircularModules && !this.matrix.checkTypeIn($x, $y, this.options.keepAsSquare)){
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

