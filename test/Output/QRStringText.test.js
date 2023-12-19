/**
 * @created      23.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {
	Byte, MaskPattern, QRData, QROptions, QROutputAbstract, QROutputInterface, QRStringText, PATTERN_010, M_DATA, IS_DARK,
} from '../../src/index.js';

import {beforeEach, suite, test} from 'mocha';
import {assert} from 'chai';

/**
 * Tests the QRString output module
 */
suite('QRStringTextTest', function(){

	let _options;
	let _matrix;

	beforeEach(function(){
		_options = new QROptions();
		_matrix  = (new QRData(_options, [new Byte('testdata')])).writeMatrix(new MaskPattern(PATTERN_010));
	});

	suite('QRStringTest', function(){

		let _outputInterface;

		beforeEach(function(){
			_options.outputInterface = QRStringText;
		});

		/**
		 * Validate the instance of the QROutputInterface
		 */
		test('testInstance', function(){
			_outputInterface = new QRStringText(_options, _matrix);

			assert.instanceOf(_outputInterface, QROutputAbstract);
			assert.instanceOf(_outputInterface, QROutputInterface);
		});

		/**
		 * covers the module values settings
		 */
		test('testSetModuleValues', function(){
			let mv = {};

			mv[M_DATA]         = 'A'; // 2
			mv[M_DATA|IS_DARK] = 'B'; // 2050

			_options.moduleValues = mv;
			_outputInterface      = new QRStringText(_options, _matrix);

			assert.strictEqual(_outputInterface.moduleValues[M_DATA], 'A');
			assert.strictEqual(_outputInterface.moduleValues[M_DATA|IS_DARK], 'B');
		});

	});

});

