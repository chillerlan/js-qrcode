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
		let arr = [];

		for(let key = 0; key < length; key++){
			// abuse JSON to create a true clone of the value
			arr[key] = JSON.parse(JSON.stringify(mixedVal));
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
	static array_combine(keys, values) {
		let newArray = {};
		let i = 0;
		// input sanitation
		// Only accept arrays or array-like objects
		// Require arrays to have a count
		if(typeof keys !== 'object' || typeof values !== 'object'){
			return false;
		}

		if(typeof keys.length !== 'number' || typeof values.length !== 'number'){
			return false;
		}

		if(!keys.length){
			return false;
		}
		// number of elements does not match
		if(keys.length !== values.length){
			return false;
		}

		for(i = 0; i < keys.length; i++){
			newArray[keys[i]] = values[i];
		}

		return newArray;
	}

	/**
	 * @link https://locutus.io/php/array/array_merge/
	 *
	 * @returns {Array|{}}
	 */
	static array_merge(){
		let args = Array.prototype.slice.call(arguments);
		let argl = args.length;
		let arg;
		let retObj = {};
		let k = '';
		let argil = 0;
		let j = 0;
		let i = 0;
		let ct = 0;
		let toStr = Object.prototype.toString;
		let retArr = true;

		for(i = 0; i < argl; i++){
			if(toStr.call(args[i]) !== '[object Array]'){
				retArr = false;
				break;
			}
		}

		if(retArr){
			retArr = [];

			for(i = 0; i < argl; i++){
				retArr = retArr.concat(args[i]);
			}

			return retArr;
		}

		for(i = 0, ct = 0; i < argl; i++){
			arg = args[i];
			if(toStr.call(arg) === '[object Array]'){
				for(j = 0, argil = arg.length; j < argil; j++){
					retObj[ct++] = arg[j];
				}
			}
			else{
				for(k in arg){
					if(Object.prototype.hasOwnProperty.call(arg, k)){
						if(parseInt(k, 10) + '' === k){
							retObj[ct++] = arg[k];
						}
						else{
							retObj[k] = arg[k];
						}
					}
				}
			}
		}
		return retObj;
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
