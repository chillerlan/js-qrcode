/**
 * @created      29.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import PHPJS from '../../src/Common/PHPJS.js';

import {suite, test} from 'mocha';
import {assert} from 'chai';

/**
 * PHPJS coverage test
 */
suite('PHPJSTest', function(){

	test('testFillArray', function(){
		assert.sameOrderedMembers(PHPJS.array_fill(3, 1), [1, 1, 1]);
		assert.sameOrderedMembers(PHPJS.array_fill(3, null), [null, null, null]);
		assert.sameOrderedMembers(PHPJS.array_fill(3, undefined), [undefined, undefined, undefined]);

		// special case: object cloning

		let $valObj    = {val: 1};
		let $arr1      = PHPJS.array_fill(3, $valObj);
		// without proper cloning this would change the values of each copy of $val in $arr
		$valObj['val'] = 2;

		assert.sameDeepMembers($arr1, [{val: 1}, {val: 1}, {val: 1}]);

		let $valArr = [1];
		let $arr2   = PHPJS.array_fill(3, $valArr);
		$valArr[0]  = 2;

		assert.sameDeepMembers($arr2, [[1], [1], [1]]);
	});

	test('testIsset', function(){
		let $obj = {a: { b: {c: 'c'}}};

		assert.isTrue(PHPJS.isset(() => $obj.a.b.c));
		assert.isFalse(PHPJS.isset(() => $obj.a.b.d));
	});

	suite('testIntval', function(){
		// examples from https://www.php.net/manual/function.intval.php
		let intvalProvider = [
			{$val: 'not an int', expected: 0},
			{$val: 42, expected: 42},
			{$val: 4.2, expected: 4},
			{$val: '42', expected: 42},
			{$val: '+42', expected: 42},
			{$val: '-42', expected: -42},
			{$val: 0o42, expected: 34},
			{$val: '042', expected: 42},
			{$val: 1e10, expected: 1410065408},
			{$val: '1e10', expected: 1},
			{$val: 0x1A, expected: 26},
			{$val: 42000000, expected: 42000000},
			{$val: 420000000000000000000000000000000000, expected: 0}, // had to add some 0s because 64bit
			{$val: '4200000000000000000000000000000000000000000', expected: 4.2e+42}, // differs from PHP, which returns PHP_INT_MAX
			{$val: 42, $base: 8, expected: 42},
			{$val: '42', $base: 8, expected: 34},
			{$val: [], expected: 0},
			{$val: ['foo', 'bar'], expected: 0}, // PHP returns 1 here
			{$val: false, expected: 0},
			{$val: true, expected: 1},
		];

		intvalProvider.forEach(({$val, $base, expected}) => {
			test(`value: ${$val}`, function(){
				assert.strictEqual(PHPJS.intval($val, $base), expected);
			});
		});
	});

	test('testArrayCombine', function(){
		let arr = PHPJS.array_combine(['a','b','c'], [1,2,3]);

		assert.sameDeepMembers([arr], [{a: 1, b: 2, c: 3}])
		assert.isFalse(PHPJS.array_combine('foo', []))
		assert.isFalse(PHPJS.array_combine([], []))
	});

	test('testOrd', function(){
		assert.strictEqual(PHPJS.ord('K'), 75);
		// surrogate pair to create a single Unicode character
		assert.strictEqual(PHPJS.ord('\uD800\uDC00'), 65536);
		// just a high surrogate with no following low surrogate
		assert.strictEqual(PHPJS.ord('\uD800'), 55296);
		// low surrogate
		assert.strictEqual(PHPJS.ord('\uDC00'), 56320);
	});

});

