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
	 * @type {int}
	 * @private
	 */
	maskPattern;

	/**
	 * MaskPattern constructor.
	 *
	 * @param {int} $maskPattern
	 *
	 * @throws \chillerlan\QRCode\QRCodeException
	 */
	constructor($maskPattern){
		$maskPattern = PHPJS.intval($maskPattern);

		if((0b111 & $maskPattern) !== $maskPattern){
			throw new QRCodeException('invalid mask pattern');
		}

		this.maskPattern = $maskPattern;
	}

	/**
	 * Returns the current mask pattern
	 *
	 * @returns {int}
	 */
	getPattern(){
		return this.maskPattern;
	}

	/**
	 * Returns a closure that applies the mask for the chosen mask pattern.
	 *
	 * Encapsulates data masks for the data bits in a QR code, per ISO 18004:2006 6.8. Implementations
	 * of this class can un-mask a raw BitMatrix. For simplicity, they will unmask the entire BitMatrix,
	 * including areas used for finder patterns, timing patterns, etc. These areas should be unused
	 * after the point they are unmasked anyway.
	 *
	 * Note that the diagram in section 6.8.1 is misleading since it indicates that i is column position
	 * and j is row position. In fact, as the text says, i is row position and j is column position.
	 *
	 * @see https://www.thonky.com/qr-code-tutorial/mask-patterns
	 * @see https://github.com/zxing/zxing/blob/e9e2bd280bcaeabd59d0f955798384fe6c018a6c/core/src/main/java/com/google/zxing/qrcode/decoder/DataMask.java#L32-L117
	 *
	 * @returns {function}
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
	 * @param {QRData} $dataInterface
	 *
	 * @returns {MaskPattern}
	 */
	static getBestPattern($dataInterface){
		let $penalties = [];

		for(let $i = 0; $i < 8; $i++){
			let $pattern = PATTERNS[$i];
			let $matrix  = $dataInterface.writeMatrix(new MaskPattern($pattern));
			let $penalty = 0;

			for(let $level = 1; $level <= 4; $level++){
				let $size = $matrix.size();
				$penalty += this['testRule' + $level]($matrix, $size, $size);
			}

			$penalties[$pattern] = PHPJS.intval($penalty);
		}

		return new MaskPattern($penalties.indexOf(Math.min(...$penalties)));
	}

	/**
	 * Apply mask penalty rule 1 and return the penalty. Find repetitive cells with the same color and
	 * give penalty to them. Example: 00000 or 11111.
	 *
	 * @param {QRMatrix} $matrix
	 * @param {int} $height
	 * @param {int} $width
	 *
	 * @returns {int}
	 */
	static testRule1($matrix, $height, $width){
		return MaskPattern.applyRule1($matrix, $height, $width, true) + MaskPattern.applyRule1($matrix, $height, $width, false);
	}

	/**
	 * @param {QRMatrix} $matrix
	 * @param {int} $height
	 * @param {int} $width
	 * @param {boolean} $isHorizontal
	 *
	 * @returns {int}
	 * @private
	 */
	static applyRule1($matrix, $height, $width, $isHorizontal){
		let $penalty = 0;
		let $yLimit  = $isHorizontal ? $height : $width;
		let $xLimit  = $isHorizontal ? $width : $height;

		for(let $y = 0; $y < $yLimit; $y++){
			let $numSameBitCells = 0;
			let $prevBit         = null;

			for(let $x = 0; $x < $xLimit; $x++){
				// noinspection JSSuspiciousNameCombination
				let $bit = $isHorizontal ? $matrix.check($x, $y) : $matrix.check($y, $x);

				if($bit === $prevBit){
					$numSameBitCells++;
				}
				else{

					if($numSameBitCells >= 5){
						$penalty += 3 + ($numSameBitCells - 5);
					}

					$numSameBitCells = 1;  // Include the cell itself.
					$prevBit = $bit;
				}
			}
			if($numSameBitCells >= 5){
				$penalty += 3 + ($numSameBitCells - 5);
			}
		}

		return $penalty;
	}

	/**
	 * Apply mask penalty rule 2 and return the penalty. Find 2x2 blocks with the same color and give
	 * penalty to them. This is actually equivalent to the spec's rule, which is to find MxN blocks and give a
	 * penalty proportional to (M-1)x(N-1), because this is the number of 2x2 blocks inside such a block.
	 *
	 * @param {QRMatrix} $matrix
	 * @param {int} $height
	 * @param {int} $width
	 *
	 * @returns {int}
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

				let $val = $matrix.check($x, $y);

				if(
					$val === $matrix.check($x + 1, $y)
					&& $val === $matrix.check($x, $y + 1)
					&& $val === $matrix.check($x + 1, $y + 1)
				){
					$penalty++;
				}
			}
		}

		return 3 * $penalty;
	}

	/**
	 * Apply mask penalty rule 3 and return the penalty. Find consecutive runs of 1:1:3:1:1:4
	 * starting with black, or 4:1:1:3:1:1 starting with white, and give penalty to them.  If we
	 * find patterns like 000010111010000, we give penalty once.
	 *
	 * @param {QRMatrix} $matrix
	 * @param {int} $height
	 * @param {int} $width
	 *
	 * @returns {int}
	 */
	static testRule3($matrix, $height, $width){
		let $penalties = 0;

		for(let $y = 0; $y < $height; $y++){
			for(let $x = 0; $x < $width; $x++){

				if(
					$x + 6 < $width
					&&  $matrix.check($x, $y)
					&& !$matrix.check($x + 1, $y)
					&&  $matrix.check($x + 2, $y)
					&&  $matrix.check($x + 3, $y)
					&&  $matrix.check($x + 4, $y)
					&& !$matrix.check($x + 5, $y)
					&&  $matrix.check($x + 6, $y)
					&& (
						MaskPattern.isWhiteHorizontal($matrix, $width, $y, $x - 4, $x)
						|| MaskPattern.isWhiteHorizontal($matrix, $width, $y, $x + 7, $x + 11)
					)
				){
					$penalties++;
				}

				if(
					$y + 6 < $height
					&&  $matrix.check($x, $y)
					&& !$matrix.check($x, $y + 1)
					&&  $matrix.check($x, $y + 2)
					&&  $matrix.check($x, $y + 3)
					&&  $matrix.check($x, $y + 4)
					&& !$matrix.check($x, $y + 5)
					&&  $matrix.check($x, $y + 6)
					&& (
						MaskPattern.isWhiteVertical($matrix, $height, $x, $y - 4, $y)
						|| MaskPattern.isWhiteVertical($matrix, $height, $x, $y + 7, $y + 11)
					)
				){
					$penalties++;
				}

			}
		}

		return $penalties * 40;
	}

	/**
	 * @param {QRMatrix} $matrix
	 * @param {int} $width
	 * @param {int} $y
	 * @param {int} $from
	 * @param {int} $to
	 *
	 * @returns {boolean}
	 * @private
	 */
	static isWhiteHorizontal($matrix, $width, $y, $from, $to){

		if($from < 0 || $width < $to){
			return false;
		}

		for(let $x = $from; $x < $to; $x++){
			if($matrix.check($x, $y)){
				return false;
			}
		}

		return true;
	}

	/**
	 * @param {QRMatrix} $matrix
	 * @param {int} $height
	 * @param {int} $x
	 * @param {int} $from
	 * @param {int} $to
	 *
	 * @returns {boolean}
	 * @private
	 */
	static isWhiteVertical($matrix, $height, $x, $from, $to){

		if($from < 0 || $height < $to){
			return false;
		}

		for(let $y = $from; $y < $to; $y++){
			if($matrix.check($x, $y)){
				return false;
			}
		}

		return true;
	}

	/**
	 * Apply mask penalty rule 4 and return the penalty. Calculate the ratio of dark cells and give
	 * penalty if the ratio is far from 50%. It gives 10 penalty for 5% distance.
	 *
	 * @param {QRMatrix} $matrix
	 * @param {int} $height
	 * @param {int} $width
	 *
	 * @returns {int}
	 */
	static testRule4($matrix, $height, $width){
		let $darkCells  = 0;
		let $totalCells = $height * $width;

		for(let $y = 0; $y < $height; $y++){
			for(let $x = 0; $x < $width; $x++){
				if($matrix.check($x, $y)){
					$darkCells++;
				}
			}
		}

		return PHPJS.intval((Math.abs($darkCells * 2 - $totalCells) * 10 / $totalCells)) * 10;
	}

}
