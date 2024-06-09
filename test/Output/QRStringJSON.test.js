/**
 * @created      23.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {
	QRCode, QROptions, QROutputAbstract, QROutputInterface, QRStringJSON, M_DATA, M_DATA_DARK,
} from '../../src/index.js';

import {beforeEach, suite, test} from 'mocha';
import {assert} from 'chai';

/**
 * Tests the QRString output module
 */
suite('QRStringJSONTest', function(){

	let _options;
	let _matrix;
	let _outputInterface;

	beforeEach(function(){
		_options = new QROptions();
		_matrix  = (new QRCode(_options)).addByteSegment('testdata').getQRMatrix();

		_options.outputInterface = QRStringJSON;

		_outputInterface = new QRStringJSON(_options, _matrix);
	});

	/**
	 * Validate the instance of the QROutputInterface
	 */
	test('testInstance', function(){
		assert.instanceOf(_outputInterface, QROutputAbstract);
		assert.instanceOf(_outputInterface, QROutputInterface);
	});


	test('testSetModuleValues', function(){
		let mv = {};

		mv[M_DATA_DARK] = '#AAA'
		mv[M_DATA]      = '#BBB'

		_options.moduleValues = mv;

		_outputInterface = new QRStringJSON(_options, _matrix);

		let data = _outputInterface.dump();

		assert.isTrue(data.includes('"layer":"data-dark","value":"#AAA"'));
		assert.isTrue(data.includes('"layer":"data","value":"#BBB"'));
	});

});

