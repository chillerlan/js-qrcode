/**
 * @created      29.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {EccLevel, Version, ECC_Q} from '../../src/index.js';

import {beforeEach, suite, test} from 'mocha';
import {assert} from 'chai';

/**
 * Version coverage test
 */
suite('VersionTest', function(){

	let _version;

	beforeEach(function(){
		_version = new Version(7);
	});

	test('testToString', function(){
		assert.strictEqual((_version + ''), '7');
	});

	test('testGetVersionNumber', function(){
		assert.strictEqual(_version.getVersionNumber(), 7);
	});

	test('testGetDimension', function(){
		assert.strictEqual(_version.getDimension(), 45);
	});

	test('testGetVersionPattern', function(){
		assert.strictEqual(_version.getVersionPattern(), 0b000111110010010100);
		// no pattern for version < 7
		assert.isNull((new Version(6).getVersionPattern()));
	});

	test('testGetAlignmentPattern', function(){
		assert.sameOrderedMembers(_version.getAlignmentPattern(), [6, 22, 38]);
	});

	test('testGetRSBlocks', function(){
		assert.sameDeepMembers(_version.getRSBlocks(new EccLevel(ECC_Q)), [18, [[2, 14], [4, 15]]]);
	});

	test('testGetTotalCodewords', function(){
		assert.strictEqual(_version.getTotalCodewords(), 196);
	});

	test('testConstructInvalidVersion', function(){
		assert.throws(() => new Version(69), 'invalid version given');
	});

});

