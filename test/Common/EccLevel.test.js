/**
 * @created      29.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {EccLevel, MaskPattern, ECC_L, ECC_Q} from '../../src/index.js';

import {suite, test} from 'mocha';
import {assert} from 'chai';

/**
 * EccLevel coverage test
 */
suite('EccLevelTest', function(){

	test('testConstructInvalidEccException', function(){
		assert.throws(() => new EccLevel(69), 'invalid ECC level');
	});

	test('testToString', function(){
		let ecc = new EccLevel(ECC_L);

		assert.strictEqual((ecc + ''), 'L');
	});

	test('testGetLevel', function(){
		let ecc = new EccLevel(ECC_L);

		assert.strictEqual(ecc.getLevel(), ECC_L);
	});

	test('testGetOrdinal', function(){
		let ecc = new EccLevel(ECC_L);

		assert.strictEqual(ecc.getOrdinal(), 0);
	});

	test('testGetOrdinal', function(){
		let ecc = new EccLevel(ECC_Q);

		assert.strictEqual(ecc.getformatPattern(new MaskPattern(4)), 0b010010010110100);
	});

	test('getMaxBits', function(){
		let ecc = new EccLevel(ECC_Q);

		assert.strictEqual(ecc.getMaxBits()[21], 4096);
	});

});

