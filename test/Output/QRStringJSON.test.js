/**
 * @created      23.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {
	Byte, MaskPattern, QRData, QROptions, QROutputAbstract, QROutputInterface, QRStringJSON, PATTERN_010,
} from '../../src/index.js';

import {beforeEach, suite, test} from 'mocha';
import {assert} from 'chai';

/**
 * Tests the QRString output module
 */
suite('QRStringJSONTest', function(){

	let _options;
	let _matrix;

	beforeEach(function(){
		_options = new QROptions();
		_matrix  = (new QRData(_options, [new Byte('testdata')])).writeMatrix(new MaskPattern(PATTERN_010));
	});

	suite('QRStringJSON', function(){

		let _outputInterface;

		beforeEach(function(){
			_options.outputInterface = QRStringJSON;
		});

		/**
		 * Validate the instance of the QROutputInterface
		 */
		test('testInstance', function(){
			_outputInterface = new QRStringJSON(_options, _matrix);

			assert.instanceOf(_outputInterface, QROutputAbstract);
			assert.instanceOf(_outputInterface, QROutputInterface);
		});


	});

});

