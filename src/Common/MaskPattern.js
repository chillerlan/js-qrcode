/**
 * @created      11.07.2022
 * @author       ZXing Authors
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      Apache-2.0
 */

import PHPJS from './PHPJS.js';
import QRCodeException from '../QRCodeException.js';
import {PATTERNS} from './constants.js';

/*
 * Penalty scores
 *
 * ISO/IEC 18004:2000 Section 8.8.1 - Table 24
 */
const PENALTY_N1 = 3;
const PENALTY_N2 = 3;
const PENALTY_N3 = 40;
const PENALTY_N4 = 10;


/**
 * ISO/IEC 18004:2000 Section 8.8.1
 * ISO/IEC 18004:2000 Section 8.8.2 - Evaluation of masking results
 *
 * @see http://www.thonky.com/qr-code-tutorial/data-masking
 * @see https://github.com/zxing/zxing/blob/e9e2bd280bcaeabd59d0f955798384fe6c018a6c/core/src/main/java/com/google/zxing/qrcode/encoder/MaskUtil.java
 */
export default class MaskPattern{

	/**
	 * The current mask pattern value (0-7)
	 *
	 * @type {number|int}
	 * @private
	 */
	maskPattern;

	/**
	 * MaskPattern constructor.
	 *
	 * @param {number|int} $maskPattern
	 *
	 * @throws QRCodeException
	 */
	constructor($maskPattern){
		$maskPattern = PHPJS.intval($maskPattern);

		if(($maskPattern & 0b111) !== $maskPattern){
			throw new QRCodeException(`invalid mask pattern: "${$maskPattern}"`);
		}

		this.maskPattern = $maskPattern;
	}

	/**
	 * Returns the current mask pattern
	 *
	 * @returns {number|int}
	 */
	getPattern(){
		return this.maskPattern;
	}

	/**
	 * Returns a closure that applies the mask for the chosen mask pattern.
	 *
	 * Note that the diagram in section 6.8.1 is misleading since it indicates that i is column position
	 * and j is row position. In fact, as the text says, i is row position and j is column position.
	 *
	 * @see https://www.thonky.com/qr-code-tutorial/mask-patterns
	 * @see https://github.com/zxing/zxing/blob/e9e2bd280bcaeabd59d0f955798384fe6c018a6c/core/src/main/java/com/google/zxing/qrcode/decoder/DataMask.java#L32-L117
	 *
	 * @returns {Function}
	 */
	getMask(){
		// $x = column (width), $y = row (height)
		return PHPJS.array_combine(PATTERNS, [
			($x, $y) => (($x + $y) % 2) === 0,
			($x, $y) => ($y % 2) === 0,
			($x, $y) => ($x % 3) === 0,
			($x, $y) => (($x + $y) % 3) === 0,
			($x, $y) => ((PHPJS.intval($y / 2) + PHPJS.intval($x / 3)) % 2) === 0,
			($x, $y) => ($x * $y) % 6 === 0,
			($x, $y) => (($x * $y) % 6) < 3,
			($x, $y) => (($x + $y + (($x * $y) % 3)) % 2) === 0,
		])[this.maskPattern];
	}

	/**
	 * Evaluates the matrix of the given data interface and returns a new mask pattern instance for the best result
	 *
	 * @param {QRMatrix} $QRMatrix
	 *
	 * @returns {MaskPattern}
	 */
	static getBestPattern($QRMatrix){
		let $penalties = [];
		let $size      = $QRMatrix.getSize();

		for(let $pattern of PATTERNS){
			let $penalty = 0;
			let $mp      = new MaskPattern($pattern);
			let $matrix  = PHPJS.clone($QRMatrix);
			// because js is fucking dumb, it can't even properly clone THAT ONE FUCKING ARRAY WITHOUT LEAVING REFERENCES
			$matrix._matrix = structuredClone($QRMatrix._matrix);
			let $m = $matrix.setFormatInfo($mp).mask($mp).getMatrix(true);

			for(let $level = 1; $level <= 4; $level++){
				$penalty += this['testRule' + $level]($m, $size, $size);
			}

			$penalties[$pattern] = PHPJS.intval($penalty);
		}

		return new MaskPattern($penalties.indexOf(Math.min(...$penalties)));
	}

	/**
	 * Apply mask penalty rule 1 and return the penalty. Find repetitive cells with the same color and
	 * give penalty to them. Example: 00000 or 11111.
	 *
	 * @param {Array} $matrix
	 * @param {number|int} $height
	 * @param {number|int} $width
	 *
	 * @returns {number|int}
	 */
	static testRule1($matrix, $height, $width){
		let $penalty = 0;

		// horizontal
		for(let $y = 0; $y < $height; $y++){
			$penalty += MaskPattern.applyRule1($matrix[$y]);
		}

		// vertical
		for(let $x = 0; $x < $width; $x++){
			$penalty += MaskPattern.applyRule1($matrix.map(y => y[$x]));
		}

		return $penalty;
	}

	/**
	 * @param {Array} $rc
	 *
	 * @returns {number|int}
	 * @private
	 */
	static applyRule1($rc){
		let $penalty         = 0;
		let $numSameBitCells = 0;
		let $prevBit         = null;

		for(let $val of $rc){

			if($val === $prevBit){
				$numSameBitCells++;
			}
			else{

				if($numSameBitCells >= 5){
					$penalty += (PENALTY_N1 + $numSameBitCells - 5);
				}

				$numSameBitCells = 1;  // Include the cell itself.
				$prevBit         = $val;
			}
		}

		if($numSameBitCells >= 5){
			$penalty += (PENALTY_N1 + $numSameBitCells - 5);
		}

		return $penalty;
	}

	/**
	 * Apply mask penalty rule 2 and return the penalty. Find 2x2 blocks with the same color and give
	 * penalty to them. This is actually equivalent to the spec's rule, which is to find MxN blocks and give a
	 * penalty proportional to (M-1)x(N-1), because this is the number of 2x2 blocks inside such a block.
	 *
	 * @param {Array} $matrix
	 * @param {number|int} $height
	 * @param {number|int} $width
	 *
	 * @returns {number|int}
	 */
	static testRule2($matrix, $height, $width){
		let $penalty = 0;

		for(let $y = 0; $y < $height; $y++){

			if($y > $height - 2){
				break;
			}

			for(let $x = 0; $x < $width; $x++){

				if($x > $width - 2){
					break;
				}

				let $val = $matrix[$y][$x];

				if(
					$val === $matrix[$y][$x + 1]
					&& $val === $matrix[$y + 1][$x]
					&& $val === $matrix[$y + 1][$x + 1]
				){
					$penalty++;
				}
			}
		}

		return PENALTY_N2 * $penalty;
	}

	/**
	 * Apply mask penalty rule 3 and return the penalty. Find consecutive runs of 1:1:3:1:1:4
	 * starting with black, or 4:1:1:3:1:1 starting with white, and give penalty to them.  If we
	 * find patterns like 000010111010000, we give penalty once.
	 *
	 * @param {Array} $matrix
	 * @param {number|int} $height
	 * @param {number|int} $width
	 *
	 * @returns {number|int}
	 */
	static testRule3($matrix, $height, $width){
		let $penalties = 0;

		for(let $y = 0; $y < $height; $y++){
			for(let $x = 0; $x < $width; $x++){

				if(
					$x + 6 < $width
					&&  $matrix[$y][$x] === true
					&& !$matrix[$y][($x + 1)]
					&&  $matrix[$y][($x + 2)]
					&&  $matrix[$y][($x + 3)]
					&&  $matrix[$y][($x + 4)]
					&& !$matrix[$y][($x + 5)]
					&&  $matrix[$y][($x + 6)]
					&& (
						MaskPattern.isWhiteHorizontal($matrix, $width, $y, $x - 4, $x)
						|| MaskPattern.isWhiteHorizontal($matrix, $width, $y, $x + 7, $x + 11)
					)
				){
					$penalties++;
				}

				if(
					$y + 6 < $height
					&&  $matrix[$y][$x] === true
					&& !$matrix[($y + 1)][$x]
					&&  $matrix[($y + 2)][$x]
					&&  $matrix[($y + 3)][$x]
					&&  $matrix[($y + 4)][$x]
					&& !$matrix[($y + 5)][$x]
					&&  $matrix[($y + 6)][$x]
					&& (
						MaskPattern.isWhiteVertical($matrix, $height, $x, $y - 4, $y)
						|| MaskPattern.isWhiteVertical($matrix, $height, $x, $y + 7, $y + 11)
					)
				){
					$penalties++;
				}

			}
		}

		return $penalties * PENALTY_N3;
	}

	/**
	 * @param {Array} $matrix
	 * @param {number|int} $width
	 * @param {number|int} $y
	 * @param {number|int} $from
	 * @param {number|int} $to
	 *
	 * @returns {boolean}
	 * @private
	 */
	static isWhiteHorizontal($matrix, $width, $y, $from, $to){

		if($from < 0 || $width < $to){
			return false;
		}

		for(let $x = $from; $x < $to; $x++){
			if($matrix[$y][$x] === true){
				return false;
			}
		}

		return true;
	}

	/**
	 * @param {Array} $matrix
	 * @param {number|int} $height
	 * @param {number|int} $x
	 * @param {number|int} $from
	 * @param {number|int} $to
	 *
	 * @returns {boolean}
	 * @private
	 */
	static isWhiteVertical($matrix, $height, $x, $from, $to){

		if($from < 0 || $height < $to){
			return false;
		}

		for(let $y = $from; $y < $to; $y++){
			if($matrix[$y][$x] === true){
				return false;
			}
		}

		return true;
	}

	/**
	 * Apply mask penalty rule 4 and return the penalty. Calculate the ratio of dark cells and give
	 * penalty if the ratio is far from 50%. It gives 10 penalty for 5% distance.
	 *
	 * @param {Array} $matrix
	 * @param {number|int} $height
	 * @param {number|int} $width
	 *
	 * @returns {number|int}
	 */
	static testRule4($matrix, $height, $width){
		let $darkCells  = 0;
		let $totalCells = $height * $width;

		for(let $row of $matrix){
			for(let $val of $row){
				if($val === true){
					$darkCells++;
				}
			}
		}

		return PHPJS.intval((Math.abs($darkCells * 2 - $totalCells) * 10 / $totalCells)) * PENALTY_N4;
	}

}
