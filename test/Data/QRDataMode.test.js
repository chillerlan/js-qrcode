/**
 * @created      23.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {
	AlphaNum, Byte, Numeric, QRData, QRDataModeInterface, QRMatrix, QROptions,
} from '../../src/index.js';

import {beforeEach, suite, test} from 'mocha';
import {assert} from 'chai';

suite('QRDataModeTest', function(){

	let _qrdata;

	beforeEach(function(){
		_qrdata = new QRData(new QROptions());
	});

	/**
	 * Verifies the QRData instance
	 */
	test('testInstance', function(){
		assert.instanceOf(_qrdata, QRData);
	});


	suite('QRDataModeInterfaceTest', function(){

		let datamodeProvider = [
			{$fqn: AlphaNum, desc: 'AlphaNum'},
			{$fqn: Byte, desc: 'Byte'},
			{$fqn: Numeric, desc: 'Numeric'},
		];

		datamodeProvider.forEach(({$fqn, desc}) => {

			// sample strings that pass for the respective data mode
			let testData = {
				AlphaNum: '0 $%*+-./:',
				Byte: '[¯\\_(ツ)_/¯]',
				Kanji: '茗荷茗荷茗荷茗荷茗荷',
				Numeric: '0123456789',
			}[desc];

			// samples for the string validation test
			let stringValidateProvider = {
				// isAlphaNum() should pass on the 45 defined characters and fail on anything else (e.g. lowercase)
				AlphaNum: [
					{$string: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890 $%*+-./:', expected: true},
					{$string: 'abc', expected: false},
				],
				// isByte() passses any binary string and only fails on zero-length strings
				Byte: [
					{$string: '\t\x01\x02\x03\r\n', expected: true},
					{$string: '            ', expected: true}, // not empty!
					{$string: '0', expected: true}, // should survive !empty()
					{$string: '', expected: false},
					{$string: [], expected: false},
				],
				// isKanji() should pass on SJIS Kanji characters and fail on everything else
				Kanji: [
					{$string: '茗荷', expected: true},
					{$string: 'Ã', expected: false},
					{$string: 'ABC', expected: false},
					{$string: '123', expected: false},
				],
				// isNumber() should pass on any number and fail on anything else
				Numeric: [
					{$string: '0123456789', expected: true},
					{$string: 'ABC123', expected: false},
				],
			}[desc];


			suite(desc, function(){

				/**
				 * Verifies the QRDataModeInterface instance
				 */
				test(`testDataModeInstance (${testData})`, function(){
					let datamode = new $fqn(testData);

					assert.instanceOf(datamode, QRDataModeInterface);
				});

				/**
				 * Tests if a string is properly validated for the respective data mode
				 */
				suite('testValidateString', function(){
					stringValidateProvider.forEach(({$string, expected}) => {
						test(`${desc}: ${$string}`, function(){
							assert.strictEqual($fqn.validateString($string), expected);
						});
					});

				});

				/**
				 * Tests initializing the data matrix
				 */
				test('writeMatrix', function(){
					_qrdata.setData([new $fqn(testData)]);

					let matrix = _qrdata.writeMatrix();

					assert.instanceOf(matrix, QRMatrix);
				});

				/**
				 * Tests getting the minimum QR version for the given data
				 */
				test('testGetMinimumVersion', function(){
					_qrdata.setData([new $fqn(testData)]);

					assert.strictEqual(_qrdata.getMinimumVersion().getVersionNumber(), 1);
				});

				/**
				 * Tests if an exception is thrown when the data exceeds the maximum version while auto detecting
				 */
				test('testGetMinimumVersionException', function(){
					assert.throws(() => {
						_qrdata.setData([new $fqn(testData.repeat(1337))]);
					}, 'estimated data exceeds');
				});

				/**
				 * Tests if an exception is thrown on data overflow
				 */
				test('testCodeLengthOverflowException', function(){
					assert.throws(() => {
						new QRData(
							new QROptions({version: 4}),
							[new $fqn(testData.repeat(42))]
						);
					}, 'code length overflow');
				});

				/**
				 * Tests if an exception is thrown when an invalid character is encountered
				 */
				test('testInvalidDataException', function(){

					if($fqn === Byte){
//						console.log('N/A (binary mode)');
						this.skip();
					}

					assert.throws(() => _qrdata.setData([new $fqn('##')]), 'invalid data');
				});

				/**
				 * Tests if an exception is thrown if the given string is empty
				 */
				test('testInvalidDataOnEmptyException', function(){
					assert.throws(() => _qrdata.setData([new $fqn('')]), 'invalid data');
				});

			});

		});

	});

});
