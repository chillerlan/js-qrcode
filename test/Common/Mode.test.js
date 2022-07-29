/**
 * @created      29.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {Mode, MODE_BYTE, MODE_NUMBER} from '../../src/index.js';

import {suite, test} from 'mocha';
import {assert} from 'chai';

/**
 * Mode coverage test
 */
suite('ModeTest', function(){

	suite('testGetLengthBitsForVersionBreakpoints', function(){

		let versionProvider = [
			{$version:  1, expected: 10},
			{$version:  9, expected: 10},
			{$version: 10, expected: 12},
			{$version: 26, expected: 12},
			{$version: 27, expected: 14},
			{$version: 40, expected: 14},
		];

		versionProvider.forEach(({$version, expected}) => {
			test(`version: ${$version}, bits: ${expected}`, function(){
				assert.strictEqual(Mode.getLengthBitsForVersion(MODE_NUMBER, $version), expected);
			});
		});

	});

	test('testGetLengthBitsForVersionInvalidModeException', function(){
		assert.throws(() => Mode.getLengthBitsForVersion(42, 69), 'invalid mode given');
	});

	test('testGetLengthBitsForVersionInvalidVersionException', function(){
		assert.throws(() => Mode.getLengthBitsForVersion(MODE_BYTE, 69), 'invalid version number');
	});

	test('testGetLengthBitsForModeInvalidModeException', function(){
		assert.throws(() => Mode.getLengthBitsForMode(42), 'invalid mode given');
	});

});

