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
	 * @type {Array}
	 * @protected
	 */
	_matrix;

	/**
	 * the size (side length) of the matrix, including quiet zone (if created)
	 *
	 * @type {int}
	 * @protected
	 */
	moduleCount;

	/**
	 * QRMatrix constructor.
	 *
	 * @param {Version} $version
	 * @param {EccLevel} $eccLevel
	 * @param {MaskPattern} $maskPattern
	 */
	constructor($version, $eccLevel, $maskPattern){
		this._version     = $version;
		this._eccLevel    = $eccLevel;
		this._maskPattern = $maskPattern;
		this.moduleCount  = this._version.getDimension();
		this._matrix      = this.createMatrix(this.moduleCount, M_NULL);
	}

	/**
	 * Creates a 2-dimensional array (square) of the given $size
	 *
	 * @param {int} $size
	 * @param {int} $value
	 *
	 * @returns {{}}
	 * @protected
	 */
	createMatrix($size, $value){
		return PHPJS.fill_array($size, PHPJS.fill_array($size, $value));
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
	 * @returns {int[][]|boolean[][]}
	 */
	matrix($boolean = false){

		if(!$boolean){
			return this._matrix;
		}

		let $matrix = [];

		for(let $y in this._matrix){
			let $row = this._matrix[$y];
			$matrix[$y] = [];

			for(let $x in $row){
				let $val = $row[$x];

				$matrix[$y][$x] = ($val & IS_DARK) === IS_DARK;
			}
		}

		return $matrix;
	}

	/**
	 * Returns the current version number
	 *
	 * @returns {Version}
	 */
	version(){
		return this._version;
	}

	/**
	 * Returns the current ECC level
	 *
	 * @returns {EccLevel}
	 */
	eccLevel(){
		return this._eccLevel;
	}

	/**
	 * Returns the current mask pattern
	 *
	 * @returns {MaskPattern}
	 */
	maskPattern(){
		return this._maskPattern;
	}

	/**
	 * Returns the absoulute size of the matrix, including quiet zone (after setting it).
	 *
	 * size = version * 4 + 17 [ + 2 * quietzone size]
	 *
	 * @returns {int}
	 */
	size(){
		return this.moduleCount;
	}

	/**
	 * Returns the value of the module at position [$x, $y] or -1 if the coordinate is outside of the matrix
	 *
	 * @param {int} $x
	 * @param {int} $y
	 *
	 * @returns {int}
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
	 * @param {int} $x
	 * @param {int} $y
	 * @param {boolean} $value
	 * @param {int} $M_TYPE
	 *
	 * @returns {QRMatrix}
	 */
	set($x, $y, $value, $M_TYPE){

		if(PHPJS.isset(() => this._matrix[$y][$x])){
			this._matrix[$y][$x] = $M_TYPE | ($value ? IS_DARK : 0);
		}

		return this;
	}

	/**
	 * Flips the value of the module
	 *
	 * @param {int} $x
	 * @param {int} $y
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
	 * @param {int} $x
	 * @param {int} $y
	 * @param {int} $M_TYPE
	 *
	 * @returns {boolean}
	 */
	checkType($x, $y, $M_TYPE){

		if(!PHPJS.isset(() => this._matrix[$y][$x])){
			return false;
		}

		return (this._matrix[$y][$x] & $M_TYPE) === $M_TYPE;
	}

	/**
	 * checks whether the module at ($x, $y) is not in the given array of $M_TYPES,
	 * returns true if no matches are found, otherwise false.
	 *
	 * @param {int} $x
	 * @param {int} $y
	 * @param {int[]} $M_TYPES
	 *
	 * @returns {boolean}
	 */
	checkTypeNotIn($x, $y, $M_TYPES){

		for(let $M_TYPE of $M_TYPES){
			if(this.checkType($x, $y, $M_TYPE)){
				return false;
			}
		}

		return true;
	}

	/**
	 * Checks whether a module is true (dark) or false (light)
	 *
	 *   true  => $value & 0x800 === 0x800
	 *   false => $value & 0x800 === 0
	 *
	 * @param {int} $x
	 * @param {int} $y
	 *
	 * @returns {boolean}
	 */
	check($x, $y){
		return this.checkType($x, $y, IS_DARK);
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
	 * @param {int} $x
	 * @param {int} $y
	 * @param {int|null} $M_TYPE_VALUE
	 *
	 * @returns {int}
	 */
	checkNeighbours($x, $y, $M_TYPE_VALUE = null){
		let $bits = 0;

		for(let $bit in MATRIX_NEIGHBOURS){
			let $coord = MATRIX_NEIGHBOURS[$bit];

			// check if the field is the same type
			if($M_TYPE_VALUE !== null && (this.get($x + $coord[0], $y + $coord[1]) | IS_DARK) !== ($M_TYPE_VALUE | IS_DARK)){
				continue;
			}

			if(this.checkType($x + $coord[0], $y + $coord[1], IS_DARK)){
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
			for(let $y = 0; $y < 7; $y++){
				for(let $x = 0; $x < 7; $x++){
					// outer (dark) 7*7 square
					if($x === 0 || $x === 6 || $y === 0 || $y === 6){
						this.set($c[0] + $y, $c[1] + $x, true, M_FINDER);
					}
					// inner (light) 5*5 square
					else if($x === 1 || $x === 5 || $y === 1 || $y === 5){
						this.set($c[0] + $y, $c[1] + $x, false, M_FINDER);
					}
					// 3*3 dot
					else{
						this.set($c[0] + $y, $c[1] + $x, true, M_FINDER_DOT);
					}
				}
			}
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

				for(let $ry = -2; $ry <= 2; $ry++){
					for(let $rx = -2; $rx <= 2; $rx++){
						let $v = ($ry === 0 && $rx === 0) || $ry === 2 || $ry === -2 || $rx === 2 || $rx === -2;

						this.set($x + $rx, $y + $ry, $v, M_ALIGNMENT);
					}
				}

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
	 * Draws the format info along the finder patterns
	 *
	 * ISO/IEC 18004:2000 Section 8.9
	 *
	 * @returns {QRMatrix}
	 */
	setFormatInfo(){
		let $bits = this._eccLevel.getformatPattern(this._maskPattern);

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
	 * @param {int} $quietZoneSize
	 *
	 * @returns {QRMatrix}
	 * @throws \chillerlan\QRCode\Data\QRCodeDataException
	 */
	setQuietZone($quietZoneSize){

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
	 * Clears a space of $width * $height in order to add a logo or text.
	 *
	 * Additionally, the logo space can be positioned within the QR Code - respecting the main functional patterns -
	 * using $startX and $startY. If either of these are null, the logo space will be centered in that direction.
	 * ECC level "H" (30%) is required.
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
	 * @param {int} $width
	 * @param {int} $height
	 * @param {int|null} $startX
	 * @param {int|null} $startY
	 *
	 * @returns {QRMatrix}
	 * @throws \chillerlan\QRCode\Data\QRCodeDataException
	 */
	setLogoSpace($width, $height, $startX = null, $startY = null){

		// for logos we operate in ECC H (30%) only
		if(this._eccLevel.getLevel() !== ECC_H){
			throw new QRCodeDataException('ECC level "H" required to add logo space');
		}

		// if width and height happen to be exactly 0 (default value), just return - nothing to do
		if($width === 0 || $height === 0){
			return this;
		}

		// this.moduleCount includes the quiet zone (if created), we need the QR size here
		let $length = this._version.getDimension();

		// throw if the size is negative or exceeds the qrcode size
		if($width < 0 || $height < 0 || $width > $length || $height > $length){
			throw new QRCodeDataException('invalid logo dimensions');
		}

		// we need uneven sizes to center the logo space, adjust if needed
		if($startX === null && ($width % 2) === 0){
			$width++;
		}

		if($startY === null && ($height % 2) === 0){
			$height++;
		}

		// throw if the logo space exceeds the maximum error correction capacity
		if($width * $height > Math.floor($length * $length * 0.2)){
			throw new QRCodeDataException('logo space exceeds the maximum error correction capacity');
		}

		// quiet zone size
		let $qz = (this.moduleCount - $length) / 2;
		// skip quiet zone and the first 9 rows/columns (finder-, mode-, version- and timing patterns)
		let $start = $qz + 9;
		// skip quiet zone
		let $end = this.moduleCount - $qz;

		// determine start coordinates
		$startX = ($startX !== null ? $startX : ($length - $width) / 2) + $qz;
		$startY = ($startY !== null ? $startY : ($length - $height) / 2) + $qz;

		// clear the space
		for(let $y = 0; $y < this.moduleCount; $y++){
			for(let $x = 0; $x < this.moduleCount; $x++){
				// out of bounds, skip
				if($x < $start || $y < $start || $x >= $end || $y >= $end){
					continue;
				}
				// a match
				if($x >= $startX && $x < ($startX + $width) && $y >= $startY && $y < ($startY + $height)){
					this.set($x, $y, false, M_LOGO);
				}
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
				let $y = $direction ? this.moduleCount - 1 - $count : $count;

				for(let $col = 0; $col < 2; $col++){
					let $x = $i - $col;

					// skip functional patterns
					if(this.get($x, $y) !== M_NULL){
						continue;
					}

					let $v = $iByte < $byteCount && (($data[$iByte] >> $iBit--) & 1) === 1;

					this.set($x, $y, $v, M_DATA);

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
	 * @returns {QRMatrix}
	 */
	mask(){
		let $mask = this._maskPattern.getMask();

		for(let $y = 0; $y < this.moduleCount; $y++){
			for(let $x = 0; $x < this.moduleCount; $x++){
				if($mask($x, $y) && (this._matrix[$y][$x] & M_DATA) === M_DATA){
					this.flip($x, $y);
				}
			}
		}

		return this;
	}

}
