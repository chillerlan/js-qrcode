/**
 * @created      22.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {BitBuffer, MODE_ALPHANUM, MODE_BYTE, MODE_NUMBER} from '../../src/index.js';

import {suite, test} from 'mocha';
import {assert} from 'chai';

suite('BitBufferTest', function(){

	suite('BitBuffer test', function(){

		let bitProvider = [
			{$bits: MODE_NUMBER, expected: 16, desc: 'number'},
			{$bits: MODE_ALPHANUM, expected: 32, desc: 'alphanum'},
			{$bits: MODE_BYTE, expected: 64, desc: 'byte'},
		];

		bitProvider.forEach(({$bits, expected}) => {
			test(`write data ${$bits}, expect ${expected}` , function(){
				let bitBuffer = new BitBuffer()
				bitBuffer.put($bits, 4);

				assert.strictEqual(bitBuffer.getBuffer()[0], expected);
				assert.strictEqual(bitBuffer.getLength(), 4);
			});
		});

	});

});

