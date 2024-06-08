/**
 * @created      23.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {
	QRCode, QROptions, QROutputAbstract, QROutputInterface, QRStringText, M_DATA, M_DATA_DARK,
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
		_matrix  = (new QRCode(_options)).addByteSegment('testdata').getQRMatrix();
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

			mv[M_DATA]      = 'A';
			mv[M_DATA_DARK] = 'B';

			_options.moduleValues = mv;
			_outputInterface      = new QRStringText(_options, _matrix);

			let data = _outputInterface.dump();

			assert.isTrue(data.includes('A'));
			assert.isTrue(data.includes('B'));
		});

	});

});

