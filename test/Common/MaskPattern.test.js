/**
 * @created      22.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {
	IS_DARK, M_DATA, MaskPattern, PATTERN_000, PATTERN_001, PATTERN_010, PATTERN_011,
	PATTERN_100, PATTERN_101, PATTERN_110, PATTERN_111, QRMatrix, Version,
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

		let testmatrix = new QRMatrix(new Version(1), null, null);
		let F = M_DATA; // false
		let T = M_DATA|IS_DARK; // true

		test('testPenaltyRule1', function(){
			// horizontal
			testmatrix._matrix = [[F, F, F, F]];
			assert.strictEqual(MaskPattern.testRule1(testmatrix, 1, 4), 0);
			testmatrix._matrix = [[F, F, F, F, F, T]];
			assert.strictEqual(MaskPattern.testRule1(testmatrix, 1, 6), 3);
			testmatrix._matrix = [[F, F, F, F, F, F]];
			assert.strictEqual(MaskPattern.testRule1(testmatrix, 1, 6), 4);
			// vertical
			testmatrix._matrix = [[F], [F], [F], [F]];
			assert.strictEqual(MaskPattern.testRule1(testmatrix, 4, 1), 0);
			testmatrix._matrix = [[F], [F], [F], [F], [F], [T]];
			assert.strictEqual(MaskPattern.testRule1(testmatrix, 6, 1), 3);
			testmatrix._matrix = [[F], [F], [F], [F], [F], [F]];
			assert.strictEqual(MaskPattern.testRule1(testmatrix, 6, 1), 4);
		});

		test('testPenaltyRule2', function(){
			testmatrix._matrix = [[F]];
			assert.strictEqual(MaskPattern.testRule2(testmatrix, 1, 1), 0);
			testmatrix._matrix = [[F, F], [F, T]];
			assert.strictEqual(MaskPattern.testRule2(testmatrix, 2, 2), 0);
			testmatrix._matrix = [[F, F], [F, F]];
			assert.strictEqual(MaskPattern.testRule2(testmatrix, 2, 2), 3);
			testmatrix._matrix = [[F, F, F], [F, F, F], [F, F, F]];
			assert.strictEqual(MaskPattern.testRule2(testmatrix, 3, 3), 12);
		});

		test('testPenaltyRule3', function(){
			// horizontal
			testmatrix._matrix = [[F, F, F, F, T, F, T, T, T, F, T]];
			assert.strictEqual(MaskPattern.testRule3(testmatrix, 1, 11), 40);
			testmatrix._matrix = [[T, F, T, T, T, F, T, F, F, F, F]];
			assert.strictEqual(MaskPattern.testRule3(testmatrix, 1, 11), 40);
			testmatrix._matrix = [[T, F, T, T, T, F, T]];
			assert.strictEqual(MaskPattern.testRule3(testmatrix, 1, 7), 0);
			// vertical
			testmatrix._matrix = [[F], [F], [F], [F], [T], [F], [T], [T], [T], [F], [T]];
			assert.strictEqual(MaskPattern.testRule3(testmatrix, 11, 1), 40);
			testmatrix._matrix = [[T], [F], [T], [T], [T], [F], [T], [F], [F], [F], [F]];
			assert.strictEqual(MaskPattern.testRule3(testmatrix, 11, 1), 40);
			testmatrix._matrix = [[T], [F], [T], [T], [T], [F], [T]];
			assert.strictEqual(MaskPattern.testRule3(testmatrix, 7, 1), 0);
		});

		test('testPenaltyRule4', function(){
			testmatrix._matrix = [[F]];
			assert.strictEqual(MaskPattern.testRule4(testmatrix, 1, 1), 100);
			testmatrix._matrix = [[F, T]];
			assert.strictEqual(MaskPattern.testRule4(testmatrix, 1, 2), 0);
			testmatrix._matrix = [[F, T, T, T, T, F]];
			assert.strictEqual(MaskPattern.testRule4(testmatrix, 1, 6), 30);
		});

	});

});

