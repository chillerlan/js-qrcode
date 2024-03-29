/**
 * @created      23.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {QRCode, QROptions} from '../src/index.js';

import {suite, test} from 'mocha';
import {assert} from 'chai';

/**
 * Tests basic functions of the QRCode class
 */
suite('QRCodeTest', function(){

	/**
	 * tests if an exception is thrown when an invalid (built-in) output type is specified
	 */
	test('testInitOutputInterfaceException', function(){
		assert.throws(() => (new QRCode(new QROptions({outputInterface: 'foo'}))).render('test'));
	});

});
