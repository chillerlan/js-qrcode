/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @author       ZXing Authors
 * @copyright    2022 smiley
 * @license      Apache-2.0
 */

import QRCodeException from '../QRCodeException.js';
import PHPJS from './PHPJS.js';
import GF256 from './GF256.js';

/**
 * Represents a polynomial whose coefficients are elements of a GF.
 * Instances of this class are immutable.
 *
 * Much credit is due to William Rucklidge since portions of this code are an indirect
 * port of his C++ Reed-Solomon implementation.
 *
 * @author Sean Owen
 */
export default class GenericGFPoly{

	/**
	 * @type {int[]}
	 * @private
	 */
	coefficients = [];

	/**
	 * @param {int[]}    $coefficients array coefficients as ints representing elements of GF(size), arranged
	 *                                 from most significant (highest-power term) coefficient to least significant
	 * @param {int|null} $degree
	 *
	 * @throws \chillerlan\QRCode\QRCodeException if argument is null or empty, or if leading coefficient is 0 and this
	 *                                            is not a constant polynomial (that is, it is not the monomial "0")
	 */
	constructor($coefficients, $degree = null){
		$degree = $degree || 0;

		if(!$coefficients || !$coefficients.length){
			throw new QRCodeException('arg $coefficients is empty');
		}

		if($degree < 0){
			throw new QRCodeException('negative degree');
		}

		let $coefficientsLength = $coefficients.length;

		// Leading term must be non-zero for anything except the constant polynomial "0"
		let $firstNonZero = 0;

		while($firstNonZero < $coefficientsLength && $coefficients[$firstNonZero] === 0){
			$firstNonZero++;
		}

		if($firstNonZero === $coefficientsLength){
			this.coefficients = [0];
		}
		else{
			this.coefficients = PHPJS.fill_array($coefficientsLength - $firstNonZero + $degree, 0);

			for(let $i = 0; $i < $coefficientsLength - $firstNonZero; $i++){
				this.coefficients[$i] = $coefficients[$i + $firstNonZero];
			}
		}
	}

	/**
	 * @param {int} $degree
	 *
	 * @returns {int} $coefficient of x^degree term in this polynomial
	 */
	getCoefficient($degree){
		return this.coefficients[this.coefficients.length - 1 - $degree];
	}

	/**
	 * @returns {Array}
	 */
	getCoefficients(){
		return this.coefficients;
	}

	/**
	 * @returns {int} $degree of this polynomial
	 */
	getDegree(){
		return this.coefficients.length - 1;
	}

	/**
	 * @returns {boolean} true if this polynomial is the monomial "0"
	 */
	isZero(){
		return this.coefficients[0] === 0;
	}

	/**
	 * @param {GenericGFPoly} $other
	 *
	 * @returns {GenericGFPoly}
	 */
	multiply($other){

		if(this.isZero() || $other.isZero()){
			return new GenericGFPoly([0]);
		}

		let $product = PHPJS.fill_array(this.coefficients.length + $other.coefficients.length - 1, 0);

		for(let $i = 0; $i < this.coefficients.length; $i++){
			for(let $j = 0; $j < $other.coefficients.length; $j++){
				$product[$i + $j] ^= GF256.multiply(this.coefficients[$i], $other.coefficients[$j]);

			}
		}

		return new GenericGFPoly($product);
	}

	/**
	 * @param {GenericGFPoly} $other
	 *
	 * @returns {GenericGFPoly}
	 */
	mod($other){

		if(this.coefficients.length - $other.coefficients.length < 0){
			return this;
		}

		let $ratio = GF256.log(this.coefficients[0]) - GF256.log($other.coefficients[0]);

		for(let $i = 0; $i < $other.coefficients.length; $i++){
			this.coefficients[$i] ^= GF256.exp(GF256.log($other.coefficients[$i]) + $ratio);
		}

		return (new GenericGFPoly(this.coefficients)).mod($other);
	}

}
