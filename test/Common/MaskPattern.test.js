/* eslint-disable max-len */
/**
 * @created      22.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {
	MaskPattern, PATTERN_000, PATTERN_001, PATTERN_010, PATTERN_011, PATTERN_100, PATTERN_101, PATTERN_110, PATTERN_111,
} from '../../src/index.js';

import {suite, test} from 'mocha';
import {assert} from 'chai';

suite('MaskPatternTest', function(){

	/**
	 * Tests if the mask function generates the correct pattern
	 */
	suite('testMask', function(){

		// See mask patterns on the page 43 of JISX0510:2004.
		let maskPatternProvider = [
			{desc: 'PATTERN_000', $pattern: PATTERN_000, expected: [
				[1, 0, 1, 0, 1, 0],
				[0, 1, 0, 1, 0, 1],
				[1, 0, 1, 0, 1, 0],
				[0, 1, 0, 1, 0, 1],
				[1, 0, 1, 0, 1, 0],
				[0, 1, 0, 1, 0, 1],
			]},
			{desc: 'PATTERN_001', $pattern: PATTERN_001, expected: [
				[1, 1, 1, 1, 1, 1],
				[0, 0, 0, 0, 0, 0],
				[1, 1, 1, 1, 1, 1],
				[0, 0, 0, 0, 0, 0],
				[1, 1, 1, 1, 1, 1],
				[0, 0, 0, 0, 0, 0],
			]},
			{desc: 'PATTERN_010', $pattern: PATTERN_010, expected: [
				[1, 0, 0, 1, 0, 0],
				[1, 0, 0, 1, 0, 0],
				[1, 0, 0, 1, 0, 0],
				[1, 0, 0, 1, 0, 0],
				[1, 0, 0, 1, 0, 0],
				[1, 0, 0, 1, 0, 0],
			]},
			{desc: 'PATTERN_011', $pattern: PATTERN_011, expected: [
				[1, 0, 0, 1, 0, 0],
				[0, 0, 1, 0, 0, 1],
				[0, 1, 0, 0, 1, 0],
				[1, 0, 0, 1, 0, 0],
				[0, 0, 1, 0, 0, 1],
				[0, 1, 0, 0, 1, 0],
			]},
			{desc: 'PATTERN_100', $pattern: PATTERN_100, expected: [
				[1, 1, 1, 0, 0, 0],
				[1, 1, 1, 0, 0, 0],
				[0, 0, 0, 1, 1, 1],
				[0, 0, 0, 1, 1, 1],
				[1, 1, 1, 0, 0, 0],
				[1, 1, 1, 0, 0, 0],
			]},
			{desc: 'PATTERN_101', $pattern: PATTERN_101, expected: [
				[1, 1, 1, 1, 1, 1],
				[1, 0, 0, 0, 0, 0],
				[1, 0, 0, 1, 0, 0],
				[1, 0, 1, 0, 1, 0],
				[1, 0, 0, 1, 0, 0],
				[1, 0, 0, 0, 0, 0],
			]},
			{desc: 'PATTERN_110', $pattern: PATTERN_110, expected: [
				[1, 1, 1, 1, 1, 1],
				[1, 1, 1, 0, 0, 0],
				[1, 1, 0, 1, 1, 0],
				[1, 0, 1, 0, 1, 0],
				[1, 0, 1, 1, 0, 1],
				[1, 0, 0, 0, 1, 1],
			]},
			{desc: 'PATTERN_111', $pattern: PATTERN_111, expected: [
				[1, 0, 1, 0, 1, 0],
				[0, 0, 0, 1, 1, 1],
				[1, 0, 0, 0, 1, 1],
				[0, 1, 0, 1, 0, 1],
				[1, 1, 1, 0, 0, 0],
				[0, 1, 1, 1, 0, 0],
			]},
		];

		/**
		 * @param {function} $mask
		 * @param {array} $expected
		 */
		let assertMask = function($mask, $expected){

			for(let $x = 0; $x < 6; $x++){
				for(let $y = 0; $y < 6; $y++){
					if($mask($x, $y) !== ($expected[$y][$x] === 1)){
						return false;
					}
				}
			}

			return true;
		}

		maskPatternProvider.forEach(({$pattern, expected, desc}) => {
			test(`testing ${desc}`, function(){
				let $maskPattern = new MaskPattern($pattern);

				assert.isTrue(assertMask($maskPattern.getMask(), expected));
			});
		});

	});

	/**
	 * Tests if an exception is thrown on an incorrect mask pattern
	 */
	test('testInvalidMaskPatternException', function(){
		assert.throws(() => {
			new MaskPattern(42);
		}, 'invalid mask pattern')
	});

	suite('testPenaltyRule', function(){

		test('testPenaltyRule1', function(){
			// horizontal
			assert.strictEqual(MaskPattern.testRule1([[false, false, false, false]], 1, 4), 0);
			assert.strictEqual(MaskPattern.testRule1([[false, false, false, false, false, true]], 1, 6), 3);
			assert.strictEqual(MaskPattern.testRule1([[false, false, false, false, false, false]], 1, 6), 4);
			// vertical
			assert.strictEqual(MaskPattern.testRule1([[false], [false], [false], [false]], 4, 1), 0);
			assert.strictEqual(MaskPattern.testRule1([[false], [false], [false], [false], [false], [true]], 6, 1), 3);
			assert.strictEqual(MaskPattern.testRule1([[false], [false], [false], [false], [false], [false]], 6, 1), 4);
		});

		test('testPenaltyRule2', function(){
			assert.strictEqual(MaskPattern.testRule2([[false]], 1, 1), 0);
			assert.strictEqual(MaskPattern.testRule2([[false, false], [false, true]], 2, 2), 0);
			assert.strictEqual(MaskPattern.testRule2([[false, false], [false, false]], 2, 2), 3);
			assert.strictEqual(MaskPattern.testRule2([[false, false, false], [false, false, false], [false, false, false]], 3, 3), 12);
		});

		test('testPenaltyRule3', function(){
			// horizontal
			assert.strictEqual(MaskPattern.testRule3([[false, false, false, false, true, false, true, true, true, false, true]], 1, 11), 40);
			assert.strictEqual(MaskPattern.testRule3([[true, false, true, true, true, false, true, false, false, false, false]], 1, 11), 40);
			assert.strictEqual(MaskPattern.testRule3([[true, false, true, true, true, false, true]], 1, 7), 0);
			// vertical
			assert.strictEqual(MaskPattern.testRule3([[false], [false], [false], [false], [true], [false], [true], [true], [true], [false], [true]], 11, 1), 40);
			assert.strictEqual(MaskPattern.testRule3([[true], [false], [true], [true], [true], [false], [true], [false], [false], [false], [false]], 11, 1), 40);
			assert.strictEqual(MaskPattern.testRule3([[true], [false], [true], [true], [true], [false], [true]], 7, 1), 0);
		});

		test('testPenaltyRule4', function(){
			assert.strictEqual(MaskPattern.testRule4([[false]], 1, 1), 100);
			assert.strictEqual(MaskPattern.testRule4([[false, true]], 1, 2), 0);
			assert.strictEqual(MaskPattern.testRule4([[false, true, true, true, true, false]], 1, 6), 30);
		});

	});

});

