/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

export default class PHPJS{

	/**
	 * not an exact implementation, we're ignoring the $start_index parameter, which is always 0 here
	 *
	 * @param {number|int} $count
	 * @param {*} $value
	 * @returns {Array}
	 */
	static array_fill($count, $value){
		let arr = [];

		for(let key = 0; key < $count; key++){
			arr[key] = structuredClone($value);
		}

		return arr;
	}

	/**
	 * Checks to see if a value in a nested array is set.
	 * isset(() => some.nested.value)
	 *
	 * @link https://stackoverflow.com/a/46256973
	 *
	 * @param {Function} $accessor Function that returns our value
	 */
	static isset($accessor){
		try{
			return typeof $accessor() !== 'undefined';
		}
		catch(e){
			return false;
		}
	}

	/**
	 * @link  http://locutus.io/php/var/intval/
	 *
	 * @param {*} $var
	 * @param {number|null} $base
	 * @returns {number|int}
	 */
	static intval($var, $base = null){
		let tmp;
		let type = typeof($var);

		if(type === 'boolean'){
			return +$var;
		}
		else if(type === 'string'){
			tmp = parseInt($var, $base || 10);
			return (isNaN(tmp) || !isFinite(tmp)) ? 0 : tmp;
		}
		else if(type === 'number' && isFinite($var)){
			return $var|0;
		}
		else{
			return 0;
		}
	}

	/**
	 * @link https://locutus.io/php/array/array_combine/
	 *
	 * @param {Array} keys
	 * @param {Array} values
	 * @returns {Object<{}>|boolean}
	 */
	static array_combine(keys, values){
		let newArray = {};
		let i = 0;
		// input sanitation
		if(
			// Only accept arrays or array-like objects
			typeof keys !== 'object'
			|| typeof values !== 'object'
			// Require arrays to have a count
			|| typeof keys.length !== 'number'
			|| typeof values.length !== 'number'
			|| !keys.length
			// number of elements does not match
			|| keys.length !== values.length
		){
			return false;
		}

		for(i = 0; i < keys.length; i++){
			newArray[keys[i]] = values[i];
		}

		return newArray;
	}

	/**
	 * @link https://locutus.io/php/strings/ord
	 *
	 * @param {string} $string
	 * @returns {number|int}
	 */
	static ord($string){
		$string += ''; // make sure we have a string
		let code = $string.charCodeAt(0);

		if(code >= 0xD800 && code <= 0xDBFF){
			// High surrogate (could change last hex to 0xDB7F to treat
			// high private surrogates as single characters)
			let hi = code;

			if($string.length === 1){
				// This is just a high surrogate with no following low surrogate,
				// so we return its value;
				return code;
				// we could also throw an error as it is not a complete character,
				// but someone may want to know
			}

			return ((hi - 0xD800) * 0x400) + ($string.charCodeAt(1) - 0xDC00) + 0x10000;
		}

		if(code >= 0xDC00 && code <= 0xDFFF){
			// Low surrogate
			// This is just a low surrogate with no preceding high surrogate,
			// so we return its value;
			return code;
			// we could also throw an error as it is not a complete character,
			// but someone may want to know
		}

		return code;
	}

	/**
	 * @link https://www.php.net/manual/en/language.oop5.cloning.php
	 *
	 * because javascript is dumb (have I mentioned it yet??) we still cannot properly 1:1 clone objects in 2024.
	 * structuredClone() suggest that but in fact it does not. so we have to invoke a new instance of the class,
	 * and copy over the properties from the object we want to clone - could have done that by hand entirely...
	 *
	 * @param {Object.<*>} $object
	 * @returns {Object.<*>}
	 */
	static clone($object){
		let $dummy = Object.create(Object.getPrototypeOf($object));

		return Object.assign($dummy, $object);
	}

}
