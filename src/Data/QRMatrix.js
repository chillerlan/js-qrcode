/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import PHPJS from '../Common/PHPJS.js';
import QRCodeDataException from './QRCodeDataException.js';
import ReedSolomonEncoder from '../Common/ReedSolomonEncoder.js';
import {
	M_ALIGNMENT, M_DARKMODULE, M_DATA, M_FINDER, M_FINDER_DOT, M_FORMAT,
	M_LOGO, M_NULL, M_QUIETZONE, M_SEPARATOR, M_TIMING, M_VERSION, IS_DARK,
	ECC_H, MATRIX_NEIGHBOURS,
} from '../Common/constants.js';
import MaskPattern from '../Common/MaskPattern.js';


/**
 * Holds a numerical representation of the final QR Code;
 * maps the ECC coded binary data and applies the mask pattern
 *
 * @see http://www.thonky.com/qr-code-tutorial/format-version-information
 */
export default class QRMatrix{

	/**
	 * the used mask pattern, set via QRMatrix::mask()
	 *
	 * @type {MaskPattern}
	 * @protected
	 */
	_maskPattern;

	/**
	 * the current ECC level
	 *
	 * @type {EccLevel}
	 * @protected
	 */
	_eccLevel;

	/**
	 * a Version instance
	 *
	 * @type {Version}
	 * @protected
	 */
	_version;

	/**
	 * the actual matrix data array
	 *
	 * @type {number[][]|int[][]}
	 * @protected
	 */
	_matrix;

	/**
	 * the size (side length) of the matrix, including quiet zone (if created)
	 *
	 * @type {number|int}
	 * @protected
	 */
	moduleCount;

	/**
	 * QRMatrix constructor.
	 *
	 * @param {Version} $version
	 * @param {EccLevel} $eccLevel
	 */
	constructor($version, $eccLevel){
		this._version     = $version;
		this._eccLevel    = $eccLevel;
		this.moduleCount  = this._version.getDimension();
		this._matrix      = this.createMatrix(this.moduleCount, M_NULL);
	}

	/**
	 * Creates a 2-dimensional array (square) of the given $size
	 *
	 * @param {number|int} $size
	 * @param {number|int} $value
	 *
	 * @returns {Object<{}>}
	 * @protected
	 */
	createMatrix($size, $value){
		return PHPJS.array_fill($size, PHPJS.array_fill($size, $value));
	}

	/**
	 * shortcut to initialize the functional patterns
	 *
	 * @returns {QRMatrix}
	 */
	initFunctionalPatterns(){
		return this
			.setFinderPattern()
			.setSeparators()
			.setAlignmentPattern()
			.setTimingPattern()
			.setDarkModule()
			.setVersionNumber()
			.setFormatInfo()
		;
	}

	/**
	 * Returns the data matrix, returns a pure boolean representation if $boolean is set to true
	 *
	 * @param {boolean} $boolean
	 *
	 * @returns {number[][]|int[][]|boolean[][]}
	 */
	getMatrix($boolean = false){

		if(!$boolean){
			return this._matrix;
		}

		let $matrix = [];

		for(let $y in this._matrix){
			$matrix[$y] = this._matrix[$y].map(this.isDark);
		}

		return $matrix;
	}

	/**
	 * Returns the current version instance
	 *
	 * @returns {Version}
	 */
	getVersion(){
		return this._version;
	}

	/**
	 * Returns the current ECC level instance
	 *
	 * @returns {EccLevel}
	 */
	getEccLevel(){
		return this._eccLevel;
	}

	/**
	 * Returns the current mask pattern instance
	 *
	 * @returns {MaskPattern}
	 */
	getMaskPattern(){
		return this._maskPattern;
	}

	/**
	 * Returns the absoulute size of the matrix, including quiet zone (after setting it).
	 *
	 * size = version * 4 + 17 [ + 2 * quietzone size]
	 *
	 * @returns {number|int}
	 */
	getSize(){
		return this.moduleCount;
	}

	/**
	 * Returns the value of the module at position [$x, $y] or -1 if the coordinate is outside of the matrix
	 *
	 * @param {number|int} $x
	 * @param {number|int} $y
	 *
	 * @returns {number|int}
	 */
	get($x, $y){

		if(!PHPJS.isset(() => this._matrix[$y][$x])){
			return -1;
		}

		return this._matrix[$y][$x];
	}

	/**
	 * Sets the $M_TYPE value for the module at position [$x, $y]
	 *
	 *   true  => $M_TYPE | 0x800
	 *   false => $M_TYPE
	 *
	 * @param {number|int} $x
	 * @param {number|int} $y
	 * @param {boolean} $value
	 * @param {number|int} $M_TYPE
	 *
	 * @returns {QRMatrix}
	 */
	set($x, $y, $value, $M_TYPE){

		if(PHPJS.isset(() => this._matrix[$y][$x])){
			// we don't know whether the input is dark, so we remove the dark bit
			$M_TYPE &= ~IS_DARK

			if($value === true){
				$M_TYPE |= IS_DARK;
			}

			this._matrix[$y][$x] = $M_TYPE;
		}

		return this;
	}

	/**
	 * Fills an area of $width * $height, from the given starting point [$startX, $startY] (top left) with $value for $M_TYPE.
	 *
	 * @param {number|int} $startX
	 * @param {number|int} $startY
	 * @param {number|int} $width
	 * @param {number|int} $height
	 * @param {boolean} $value
	 * @param {number|int} $M_TYPE
	 *
	 * @returns {QRMatrix}
	 */
	setArea($startX, $startY, $width, $height, $value, $M_TYPE){

		for(let $y = $startY; $y < ($startY + $height); $y++){
			for(let $x = $startX; $x < ($startX + $width); $x++){
				this.set($x, $y, $value, $M_TYPE);
			}
		}

		return this;
	}

	/**
	 * Flips the value of the module
	 *
	 * @param {number|int} $x
	 * @param {number|int} $y
	 *
	 * @returns {QRMatrix}
	 */
	flip($x, $y){

		if(PHPJS.isset(() => this._matrix[$y][$x])){
			this._matrix[$y][$x] ^= IS_DARK;
		}

		return this;
	}

	/**
	 * Checks whether a module is of the given $M_TYPE
	 *
	 *   true => $value & $M_TYPE === $M_TYPE
	 *
	 * @param {number|int} $x
	 * @param {number|int} $y
	 * @param {number|int} $M_TYPE
	 *
	 * @returns {boolean}
	 */
	checkType($x, $y, $M_TYPE){

		if(PHPJS.isset(() => this._matrix[$y][$x])){
			return (this._matrix[$y][$x] & $M_TYPE) === $M_TYPE;
		}

		return false;
	}

	/**
	 * Checks whether the module at ($x, $y) is in the given array of $M_TYPES,
	 * returns true if a match is found, otherwise false.
	 *
	 * @param {number|int} $x
	 * @param {number|int} $y
	 * @param {number[]|int[]} $M_TYPES
	 *
	 * @returns {boolean}
	 */
	checkTypeIn($x, $y, $M_TYPES){

		for(let $M_TYPE of $M_TYPES){
			if(this.checkType($x, $y, $M_TYPE)){
				return true;
			}
		}

		return false;
	}

	/**
	 * Checks whether a module is true (dark) or false (light)
	 *
	 *   true  => $value & 0x800 === 0x800
	 *   false => $value & 0x800 === 0
	 *
	 * @param {number|int} $x
	 * @param {number|int} $y
	 *
	 * @returns {boolean}
	 */
	check($x, $y){

		if(PHPJS.isset(() => this._matrix[$y][$x])){
			return this.isDark(this._matrix[$y][$x]);
		}

		return false;
	}

	/**
	 * Checks whether the given $M_TYPE is a dark value
	 *
	 * @param {number|int} $M_TYPE
	 *
	 * @returns {boolean}
	 */
	isDark($M_TYPE){
		return ($M_TYPE & IS_DARK) === IS_DARK;
	}

	/**
	 * Checks the status neighbouring modules of the given module at ($x, $y) and returns a bitmask with the results.
	 *
	 * The 8 flags of the bitmask represent the status of each of the neighbouring fields,
	 * starting with the lowest bit for top left, going clockwise:
	 *
	 *   1 2 3
	 *   8 # 4
	 *   7 6 5
	 *
	 * @param {number|int} $x
	 * @param {number|int} $y
	 * @param {number|int|null} $M_TYPE
	 *
	 * @returns {number|int}
	 */
	checkNeighbours($x, $y, $M_TYPE = null){
		let $bits = 0;

		for(let $bit in MATRIX_NEIGHBOURS){
			let [$ix, $iy] = MATRIX_NEIGHBOURS[$bit];
			$ix += $x;
			$iy += $y;

			// check if the field is the same type
			if($M_TYPE !== null && !this.checkType($ix, $iy, $M_TYPE)){
				continue;
			}

			if(this.checkType($ix, $iy, IS_DARK)){
				$bits |= $bit;
			}

		}

		return $bits;
	}

	/**
	 * Sets the "dark module", that is always on the same position 1x1px away from the bottom left finder
	 *
	 * 4 * version + 9 or moduleCount - 8
	 *
	 * @returns {QRMatrix}
	 */
	setDarkModule(){
		this.set(8, this.moduleCount - 8, true, M_DARKMODULE);

		return this;
	}

	/**
	 * Draws the 7x7 finder patterns in the corners top left/right and bottom left
	 *
	 * ISO/IEC 18004:2000 Section 7.3.2
	 *
	 * @returns {QRMatrix}
	 */
	setFinderPattern(){

		let $pos = [
			[0, 0], // top left
			[this.moduleCount - 7, 0], // bottom left
			[0, this.moduleCount - 7], // top right
		];

		for(let $c of $pos){
			this
				.setArea( $c[0]     ,  $c[1]     , 7, 7, true,  M_FINDER)
				.setArea(($c[0] + 1), ($c[1] + 1), 5, 5, false, M_FINDER)
				.setArea(($c[0] + 2), ($c[1] + 2), 3, 3, true,  M_FINDER_DOT)
			;
		}

		return this;
	}

	/**
	 * Draws the separator lines around the finder patterns
	 *
	 * ISO/IEC 18004:2000 Section 7.3.3
	 *
	 * @returns {QRMatrix}
	 */
	setSeparators(){

		let $h = [
			[7, 0],
			[this.moduleCount - 8, 0],
			[7, this.moduleCount - 8],
		];

		let $v = [
			[7, 7],
			[this.moduleCount - 1, 7],
			[7, this.moduleCount - 8],
		];

		for(let $c = 0; $c < 3; $c++){
			for(let $i = 0; $i < 8; $i++){
				this.set($h[$c][0], $h[$c][1] + $i, false, M_SEPARATOR);
				this.set($v[$c][0] - $i, $v[$c][1], false, M_SEPARATOR);
			}
		}

		return this;
	}

	/**
	 * Draws the 5x5 alignment patterns
	 *
	 * ISO/IEC 18004:2000 Section 7.3.5
	 *
	 * @returns {QRMatrix}
	 */
	setAlignmentPattern(){
		let $alignmentPattern = this._version.getAlignmentPattern();

		for(let $y of $alignmentPattern){
			for(let $x of $alignmentPattern){

				// skip existing patterns
				if(this._matrix[$y][$x] !== M_NULL){
					continue;
				}

				this
					.setArea(($x - 2), ($y - 2), 5, 5, true,  M_ALIGNMENT)
					.setArea(($x - 1), ($y - 1), 3, 3, false, M_ALIGNMENT)
					.set($x, $y, true, M_ALIGNMENT)
				;

			}
		}

		return this;
	}

	/**
	 * Draws the timing pattern (h/v checkered line between the finder patterns)
	 *
	 * ISO/IEC 18004:2000 Section 7.3.4
	 *
	 * @returns {QRMatrix}
	 */
	setTimingPattern(){

		for(let $i = 8; $i < this.moduleCount - 8; $i++){

			if(this._matrix[6][$i] !== M_NULL || this._matrix[$i][6] !== M_NULL){
				continue;
			}

			let $v = $i % 2 === 0;

			this.set($i, 6, $v, M_TIMING); // h
			this.set(6, $i, $v, M_TIMING); // v
		}

		return this;
	}

	/**
	 * Draws the version information, 2x 3x6 pixel
	 *
	 * ISO/IEC 18004:2000 Section 8.10
	 *
	 * @returns {QRMatrix}
	 */
	setVersionNumber(){
		let $bits = this._version.getVersionPattern();

		if($bits !== null){

			for(let $i = 0; $i < 18; $i++){
				let $a = PHPJS.intval($i / 3);
				let $b = $i % 3 + this.moduleCount - 8 - 3;
				let $v = (($bits >> $i) & 1) === 1;

				this.set($b, $a, $v, M_VERSION); // ne
				this.set($a, $b, $v, M_VERSION); // sw
			}

		}

		return this;
	}

	/**
	 * Draws the format info along the finder patterns. If no $maskPattern, all format info modules will be set to false.
	 *
	 * ISO/IEC 18004:2000 Section 8.9
	 *
	 * @param {MaskPattern|null} $maskPattern
	 *
	 * @returns {QRMatrix}
	 */
	setFormatInfo($maskPattern = null){
		this._maskPattern = $maskPattern;
		let $bits         = 0; // sets all format fields to false (test mode)

		if(this._maskPattern instanceof MaskPattern){
			$bits = this._eccLevel.getformatPattern(this._maskPattern);
		}

		for(let $i = 0; $i < 15; $i++){
			let $v = (($bits >> $i) & 1) === 1;

			if($i < 6){
				this.set(8, $i, $v, M_FORMAT);
			}
			else if($i < 8){
				this.set(8, $i + 1, $v, M_FORMAT);
			}
			else{
				this.set(8, this.moduleCount - 15 + $i, $v, M_FORMAT);
			}

			if($i < 8){
				this.set(this.moduleCount - $i - 1, 8, $v, M_FORMAT);
			}
			else if($i < 9){
				this.set(15 - $i, 8, $v, M_FORMAT);
			}
			else{
				this.set(15 - $i - 1, 8, $v, M_FORMAT);
			}

		}

		return this;
	}

	/**
	 * Draws the "quiet zone" of $size around the matrix
	 *
	 * ISO/IEC 18004:2000 Section 7.3.7
	 *
	 * @param {number|int} $quietZoneSize
	 *
	 * @returns {QRMatrix}
	 * @throws {QRCodeDataException}
	 */
	setQuietZone($quietZoneSize){

		// early exit if there's nothing to add
		if($quietZoneSize < 1){
			return this;
		}

		if(this._matrix[this.moduleCount - 1][this.moduleCount - 1] === M_NULL){
			throw new QRCodeDataException('use only after writing data');
		}

		// create a matrix with the new size
		let $newSize   = this.moduleCount + ($quietZoneSize * 2);
		let $newMatrix = this.createMatrix($newSize, M_QUIETZONE);

		// copy over the current matrix
		for(let $y = 0; $y < this.moduleCount; $y++){
			for(let $x = 0; $x < this.moduleCount; $x++){
				$newMatrix[$y + $quietZoneSize][$x + $quietZoneSize] = this._matrix[$y][$x];
			}
		}

		// set the new values
		this.moduleCount = $newSize;
		this._matrix     = $newMatrix;

		return this;
	}

	/**
	 * Rotates the matrix by 90 degrees clock wise
	 *
	 * @link https://stackoverflow.com/a/58668351
	 */
	rotate90(){
		this._matrix = this._matrix[0].map((val, index) => this._matrix.map(row => row[index]).reverse())

		return this;
	}

	/**
	 * Inverts the values of the whole matrix
	 *
	 * ISO/IEC 18004:2015 Section 6.2 - Reflectance reversal
	 *
	 * @returns {QRMatrix}
	 */
	invert(){

		for(let $y = 0; $y < this.moduleCount; $y++){
			for(let $x = 0; $x < this.moduleCount; $x++){

				// skip null fields
				if(this.get($x, $y) === M_NULL){
					continue;
				}

				this.flip($x, $y);
			}
		}

		return this;
	}

	/**
	 * Clears a space of $width * $height in order to add a logo or text.
	 * If no $height is given, the space will be assumed a square of $width.
	 *
	 * Additionally, the logo space can be positioned within the QR Code using $startX and $startY.
	 * If either of these are null, the logo space will be centered in that direction.
	 * ECC level "H" (30%) is required.
	 *
	 * The coordinates of $startX and $startY do not include the quiet zone:
	 * [0, 0] is always the top left module of the top left finder pattern, negative values go into the quiet zone top and left.
	 *
	 * Please note that adding a logo space minimizes the error correction capacity of the QR Code and
	 * created images may become unreadable, especially when printed with a chance to receive damage.
	 * Please test thoroughly before using this feature in production.
	 *
	 * This method should be called from within an output module (after the matrix has been filled with data).
	 * Note that there is no restiction on how many times this method could be called on the same matrix instance.
	 *
	 * @link https://github.com/chillerlan/php-qrcode/issues/52
	 *
	 * @param {number|int} $width
	 * @param {number|int|null} $height
	 * @param {number|int|null} $startX
	 * @param {number|int|null} $startY
	 *
	 * @returns {QRMatrix}
	 * @throws {QRCodeDataException}
	 */
	setLogoSpace($width, $height = null, $startX = null, $startY = null){
		$height ??= $width;

		// if width and height happen to be negative or 0 (default value), just return - nothing to do
		if($width <= 0 || $height <= 0){
			return this;
		}

		// for logos, we operate in ECC H (30%) only
		if(this._eccLevel.getLevel() !== ECC_H){
			throw new QRCodeDataException('ECC level "H" required to add logo space');
		}

		// this.moduleCount includes the quiet zone (if created), we need the QR size here
		let $dimension = this._version.getDimension();

		// throw if the size is negative or exceeds the qrcode size
		if($width > $dimension || $height > $dimension){
			throw new QRCodeDataException('logo dimensions exceed matrix size');
		}

		// we need uneven sizes to center the logo space, adjust if needed
		if($startX === null && ($width % 2) === 0){
			$width++;
		}

		if($startY === null && ($height % 2) === 0){
			$height++;
		}

		// throw if the logo space exceeds the maximum error correction capacity
		if($width * $height > Math.floor($dimension * $dimension * 0.25)){
			throw new QRCodeDataException('logo space exceeds the maximum error correction capacity');
		}

		let $quietzone = ((this.moduleCount - $dimension) / 2);
		let $end       = (this.moduleCount - $quietzone);

		// determine start coordinates
		$startX ??= (($dimension - $width) / 2);
		$startY ??= (($dimension - $height) / 2);
		let $endX = ($quietzone + $startX + $width);
		let $endY = ($quietzone + $startY + $height);

		// clear the space
		for(let $y = ($quietzone + $startY); $y < $endY; $y++){
			for(let $x = ($quietzone + $startX); $x < $endX; $x++){
				// out of bounds, skip
				if($x < $quietzone || $y < $quietzone ||$x >= $end || $y >= $end){
					continue;
				}

				this.set($x, $y, false, M_LOGO);
			}
		}

		return this;
	}

	/**
	 * Maps the interleaved binary $data on the matrix
	 *
	 * @param {BitBuffer} $bitBuffer
	 *
	 * @returns {QRMatrix}
	 */
	writeCodewords($bitBuffer){
		let $data = (new ReedSolomonEncoder).interleaveEcBytes($bitBuffer, this._version, this._eccLevel);
		let $byteCount = $data.length;
		let $iByte = 0;
		let $iBit = 7;
		let $direction = true;

		for(let $i = this.moduleCount - 1; $i > 0; $i -= 2){

			// skip vertical alignment pattern
			if($i === 6){
				$i--;
			}

			for(let $count = 0; $count < this.moduleCount; $count++){
				let $y = $count;

				if($direction){
					$y = (this.moduleCount - 1 - $count);
				}

				for(let $col = 0; $col < 2; $col++){
					let $x = $i - $col;

					// skip functional patterns
					if(this._matrix[$y][$x] !== M_NULL){
						continue;
					}

					this._matrix[$y][$x] = M_DATA;

					if($iByte < $byteCount && (($data[$iByte] >> $iBit--) & 1) === 1){
						this._matrix[$y][$x] |= IS_DARK;
					}

					if($iBit === -1){
						$iByte++;
						$iBit = 7;
					}
				}
			}

			$direction = !$direction; // switch directions
		}

		return this;
	}

	/**
	 * Applies/reverses the mask pattern
	 *
	 * ISO/IEC 18004:2000 Section 8.8.1
	 *
	 * @param {MaskPattern} $maskPattern
	 * @returns {QRMatrix}
	 */
	mask($maskPattern){
		this._maskPattern = $maskPattern;
		let $mask         = this._maskPattern.getMask();

		for(let $y = 0; $y < this.moduleCount; $y++){
			for(let $x = 0; $x < this.moduleCount; $x++){
				if((this._matrix[$y][$x] & M_DATA) === M_DATA && $mask($x, $y)){
					this.flip($x, $y);
				}
			}
		}

		return this;
	}

}
