/**
 * @created      21.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {MASK_PATTERN_AUTO, VERSION_AUTO, QROptions} from '../src/index.js';

import {suite, test} from 'mocha';
import {assert} from 'chai';

suite('QROptionsTest', function(){

	/**
	 * Tests the $version clamping
	 */
	suite('testVersionClamp', function(){

		let versionProvider = [
			{$version:  42, expected: 40},
			{$version: -42, expected:  1},
			{$version:  21, expected: 21},
			{$version: VERSION_AUTO, expected: -1},
		];

		versionProvider.forEach(({$version, expected}) => {
			test(`version ${$version} should be clamped to ${expected}`, function(){
				let options = new QROptions({version: $version});

				assert.strictEqual(options.version, expected);
			});
		});

	});

	/**
	 * Tests the $versionMin/$versionMax clamping
	 */
	suite('testVersionMinMaxClamp', function(){

		let versionMinMaxProvider = [
			{$versionMin:   5, $versionMax:  10, expectedMin: 5, expectedMax: 10, desc: 'normal clamp'},
			{$versionMin: -42, $versionMax:  42, expectedMin: 1, expectedMax: 40, desc: 'exceeding values'},
			{$versionMin:  10, $versionMax:   5, expectedMin: 5, expectedMax: 10, desc: 'min > max'},
			{$versionMin:  42, $versionMax: -42, expectedMin: 1, expectedMax: 40, desc: 'min > max, exceeding'},
		];

		versionMinMaxProvider.forEach(({$versionMin, $versionMax, expectedMin, expectedMax, desc}) => {
			test(`clamp versionMin ${$versionMin} to ${expectedMin} and versionMax ${$versionMax} to ${expectedMax} (${desc})`,
				function(){

				let options = new QROptions({versionMin: $versionMin, versionMax: $versionMax});

				assert.strictEqual(options.versionMin, expectedMin);
				assert.strictEqual(options.versionMax, expectedMax);
			});
		});

	});

	/**
	 * Tests the $maskPattern clamping
	 */
	suite('testMaskPatternClamp', function(){

		let maskPatternProvider = [
			{$maskPattern:   5, expected: 5},
			{$maskPattern:  42, expected: 7},
			{$maskPattern: -42, expected: 0},
			{$maskPattern: MASK_PATTERN_AUTO, expected: -1},
		];

		maskPatternProvider.forEach(({$maskPattern, expected}) => {
			test(`maskPattern ${$maskPattern} should be clamped to ${expected}`, function(){
				let options = new QROptions({maskPattern: $maskPattern});

				assert.strictEqual(options.maskPattern, expected);
			});
		});

	});

	/**
	 * Tests if an exception is thrown on an incorrect ECC level
	 */
	test('testInvalidEccLevelException', function(){
		assert.throws(() => new QROptions({eccLevel: 42}), 'Invalid error correct level: 42')
	});

	/**
	 * Tests the clamping (between 0 and 177) of the logo space values
	 *
	 * @dataProvider logoSpaceValueProvider
	 */
	suite('testClampLogoSpaceValue', function(){

		let logoSpaceValueProvider = [
			{$value:  -1, expected:   0, desc: 'negative'},
			{$value:   0, expected:   0, desc: 'zero'},
			{$value:  69, expected:  69, desc: 'normal'},
			{$value: 177, expected: 177, desc: 'max'},
			{$value: 178, expected: 177, desc: 'exceed'},
		];

		for(let prop of ['logoSpaceWidth', 'logoSpaceHeight', 'logoSpaceStartX', 'logoSpaceStartY']){
			logoSpaceValueProvider.forEach(({$value, expected, desc}) => {
				test(`${prop} ${$value} should be clamped to ${expected} (${desc})`, function(){
					let options = new QROptions();

					options[prop] = $value;
					assert.strictEqual(options[prop], expected);
				});
			});
		}

	});

	/**
	 * Tests if the optional logo space start values are nullable
	 */
	test('testLogoSpaceStartNullable' , function(){
		let options = new QROptions({
			logoSpaceStartX: 42,
			logoSpaceStartY: 42,
		});

		assert.strictEqual(options.logoSpaceStartX, 42);
		assert.strictEqual(options.logoSpaceStartY, 42);

		options.logoSpaceStartX = null;
		options.logoSpaceStartY = null;

		assert.strictEqual(options.logoSpaceStartX, null);
		assert.strictEqual(options.logoSpaceStartY, null);
	});

	/**
	 * Tests clamping of the circle radius
	 */
	suite('testClampCircleRadius', function(){

		let circleRadiusProvider = [
			{$circleRadius: 0.0, expected: 0.1},
			{$circleRadius: 0.5, expected: 0.5},
			{$circleRadius: 1.5, expected: 0.75},
		];

		circleRadiusProvider.forEach(({$circleRadius, expected}) => {
			test(`circleRadius ${$circleRadius} should be clamped to ${expected}`, function(){
				let options = new QROptions({circleRadius: $circleRadius});

				assert.strictEqual(options.circleRadius, expected);
			});
		});

	});

});
