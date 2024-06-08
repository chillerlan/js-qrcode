/**
 * @created      08.06.2024
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2024 smiley
 * @license      MIT
 */

import {Byte, ECC_H, QRData, QROptions} from '../../src/index.js';

import {suite, test} from 'mocha';
import {assert} from 'chai';

suite('QRDataTest', function(){

	test('testEstimateTotalBitLength', function(){

		let $options = new QROptions({
			versionMin: 10,
			eccLevel  : ECC_H,
		});

		// version 10H has a maximum of 976 bits, which is the exact length of the string below
		// QRData::estimateTotalBitLength() used to substract 4 bits for a hypothetical data mode indicator
		// we're now going the safe route and do not do that anymore...
		let $str = 'otpauth://totp/user?secret=P2SXMJFJ7DJGHLVEQYBNH2EYM4FH66CR' +
		'&issuer=phpMyAdmin%20%28%29&digits=6&algorithm=SHA1&period=30';

		let $qrData = new QRData($options, [new Byte($str)]);

		assert.strictEqual(976, $qrData.estimateTotalBitLength());
		assert.strictEqual(11, $qrData.getMinimumVersion().getVersionNumber())
	});

});
