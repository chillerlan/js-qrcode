/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

export default class PHPJS{

	/**
	 * @param {int} length
	 * @param {*} mixedVal
	 * @returns {Array}
	 */
	static fill_array(length, mixedVal){
		let valIsObject = (typeof mixedVal === 'object');
		let arr         = [];

		for(let key = 0; key < length; key++){
			arr[key] = valIsObject
				// abuse JSON to create a true clone of the value
				? JSON.parse(JSON.stringify(mixedVal))
				: mixedVal;
		}

		return arr;
	}

	/**
	 * Checks to see if a value in a nested array is set.
	 * isset(() => some.nested.value)
	 *
	 * @link https://stackoverflow.com/a/46256973
	 *
	 * @param {Function} accessor Function that returns our value
	 */
	static isset(accessor){
		try{
			return typeof accessor() !== 'undefined';
		}
		catch(e){
			return false;
		}
	}

	/**
	 * @link  http://locutus.io/php/var/intval/
	 *
	 * @param {*}      mixed_var
	 * @param {number|null} base
	 * @returns {int}
	 */
	static intval(mixed_var, base = null){
		let tmp;
		let type = typeof(mixed_var);

		if(type === 'boolean'){
			return +mixed_var;
		}
		else if(type === 'string'){
			tmp = parseInt(mixed_var, base || 10);
			return (isNaN(tmp) || !isFinite(tmp)) ? 0 : tmp;
		}
		else if(type === 'number' && isFinite(mixed_var)){
			return mixed_var|0;
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
	 * @returns {{}|boolean}
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
	 * @param {string} string
	 * @returns {number}
	 */
	static ord(string){
		let str = string + '';
		let code = str.charCodeAt(0);

		if(code >= 0xD800 && code <= 0xDBFF){
			// High surrogate (could change last hex to 0xDB7F to treat
			// high private surrogates as single characters)
			let hi = code;

			if(str.length === 1){
				// This is just a high surrogate with no following low surrogate,
				// so we return its value;
				return code;
				// we could also throw an error as it is not a complete character,
				// but someone may want to know
			}

			return ((hi - 0xD800) * 0x400) + (str.charCodeAt(1) - 0xDC00) + 0x10000;
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

}
