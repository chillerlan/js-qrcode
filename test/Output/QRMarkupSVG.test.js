/**
 * @created      09.06.2024
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2024 smiley
 * @license      MIT
 */

import {beforeEach, suite, test} from 'mocha';
import {assert} from 'chai';
import {
	M_DATA, M_DATA_DARK, QRCode, QRMarkupSVG, QROptions, QROutputAbstract, QROutputInterface, QRStringText,
} from '../../src/index.js';

suite('QRMarkupSVGTest', function(){

	let _options;
	let _matrix;
	let _outputInterface;

	beforeEach(function(){
		_options = new QROptions();
		_matrix  = (new QRCode(_options)).addByteSegment('testdata').getQRMatrix();

		_options.outputInterface = QRMarkupSVG;

		_outputInterface = new QRMarkupSVG(_options, _matrix);
	});

	/**
	 * Validate the instance of the QROutputInterface
	 */
	test('testInstance', function(){
		assert.instanceOf(_outputInterface, QROutputAbstract);
		assert.instanceOf(_outputInterface, QROutputInterface);
	});

	let moduleValueProvider = [
		// css colors from parent
		['#abc', true],
		['#abcd', true],
		['#aabbcc', true],
		['#aabbccdd', true],
		['#aabbcxyz', false],
		['#aa', false],
		['#aabbc', false],
		['#aabbccd', false],
		['rgb(100.0%, 0.0%, 0.0%)', true],
		['  rgba(255, 0, 0,    1.0)  ', true],
		['hsl(120, 60%, 50%)', true],
		['hsla(120, 255,   191.25, 1.0)', true],
		['rgba(255, 0, whatever, 0, 1.0)', false],
		['rgba(255, 0, 0, 1.0);', false],
		['purple', true],
		['c5sc0lor', false],

		// SVG
		['url(#fillGradient)', true],
		['url(https://example.com/noop)', false],
	];

	moduleValueProvider.forEach(([$value, $expected]) => {
		test('testValidateModuleValues', function(){
			assert.strictEqual(_outputInterface.constructor.moduleValueIsValid($value), $expected);
		});
	});

	/**
	 * covers the module values settings
	 */
	test('testSetModuleValues', function(){
		let mv = {};

		mv[M_DATA]      = '#4A6000';
		mv[M_DATA_DARK] = '#ECF9BE';

		_options.moduleValues = mv;
		_outputInterface      = new QRStringText(_options, _matrix);

		let data = _outputInterface.dump();

		assert.isTrue(data.includes('#4A6000'));
		assert.isTrue(data.includes('#ECF9BE'));
	});

});
