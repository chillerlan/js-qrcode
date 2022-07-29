/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import PHPJS from './PHPJS.js';
import GenericGFPoly from './GenericGFPoly.js';
import GF256 from './GF256.js';

/**
 * ISO/IEC 18004:2000 Section 8.5 ff
 *
 * @see http://www.thonky.com/qr-code-tutorial/error-correction-coding
 */
export default class ReedSolomonEncoder{

	/**
	 * @type {{}}
	 * @private
	 */
	interleavedData;

	/**
	 * @type {int}
	 * @private
	 */
	interleavedDataIndex;

	/**
	 * ECC interleaving
	 *
	 * @param {BitBuffer} $bitBuffer
	 * @param {Version} $version
	 * @param {EccLevel} $eccLevel
	 *
	 * @returns {{}}
	 * @throws \chillerlan\QRCode\QRCodeException
	 */
	interleaveEcBytes($bitBuffer, $version, $eccLevel){
		let $rsblockData     = $version.getRSBlocks($eccLevel);
		let $numEccCodewords = $rsblockData[0];
		let $l1              = $rsblockData[1][0][0];
		let $b1              = $rsblockData[1][0][1];
		let $l2              = $rsblockData[1][1][0];
		let $b2              = $rsblockData[1][1][1];
		let $rsBlocks        = PHPJS.fill_array($l1, [$numEccCodewords + $b1, $b1]);

		if($l2 > 0){
			$rsBlocks = $rsBlocks.concat(PHPJS.fill_array($l2, [$numEccCodewords + $b2, $b2]));
		}


		let $bitBufferData  = $bitBuffer.getBuffer();
		let $dataBytes      = [];
		let $ecBytes        = [];
		let $maxDataBytes   = 0;
		let $maxEcBytes     = 0;
		let $dataByteOffset = 0;

		for(let $key in $rsBlocks){
			let $rsBlockTotal  = $rsBlocks[$key][0];
			let $dataByteCount = $rsBlocks[$key][1];

			$dataBytes[$key]   = [];

			for(let $i = 0; $i < $dataByteCount; $i++){
				$dataBytes[$key][$i] = $bitBufferData[$i + $dataByteOffset] & 0xff;
			}

			let $ecByteCount = $rsBlockTotal - $dataByteCount;
			$ecBytes[$key]   = this.generateEcBytes($dataBytes[$key], $ecByteCount);
			$maxDataBytes    = Math.max($maxDataBytes, $dataByteCount);
			$maxEcBytes      = Math.max($maxEcBytes, $ecByteCount);
			$dataByteOffset += $dataByteCount;
		}

		this.interleavedData      = PHPJS.fill_array($version.getTotalCodewords(), 0);
		this.interleavedDataIndex = 0;
		let $numRsBlocks          = $l1 + $l2;

		this.interleave($dataBytes, $maxDataBytes, $numRsBlocks);
		this.interleave($ecBytes, $maxEcBytes, $numRsBlocks);

		return this.interleavedData;
	}

	/**
	 * @param {Array} $dataBytes
	 * @param {int} $ecByteCount
	 *
	 * @returns {{}}
	 * @private
	 */
	generateEcBytes($dataBytes, $ecByteCount){
		let $rsPoly = new GenericGFPoly([1]);

		for(let $i = 0; $i < $ecByteCount; $i++){
			$rsPoly = $rsPoly.multiply(new GenericGFPoly([1, GF256.exp($i)]));
		}

		let $rsPolyDegree    = $rsPoly.getDegree();
		let $modCoefficients = (new GenericGFPoly($dataBytes, $rsPolyDegree))
			.mod($rsPoly)
			.getCoefficients()
		;

		let $ecBytes = PHPJS.fill_array($rsPolyDegree, 0);
		let $count   = $modCoefficients.length - $rsPolyDegree;

		for(let $i = 0; $i < $ecBytes.length; $i++){
			let $modIndex = $i + $count;
			$ecBytes[$i]  = $modIndex >= 0 ? $modCoefficients[$modIndex] : 0;
		}

		return $ecBytes;
	}

	/**
	 * @param {{}} $byteArray
	 * @param {int} $maxBytes
	 * @param {int} $numRsBlocks
	 *
	 * @returns {void}
	 * @private
	 */
	interleave($byteArray, $maxBytes, $numRsBlocks){
		for(let $x = 0; $x < $maxBytes; $x++){
			for(let $y = 0; $y < $numRsBlocks; $y++){
				if($x < $byteArray[$y].length){
					this.interleavedData[this.interleavedDataIndex++] = $byteArray[$y][$x];
				}
			}
		}
	}

}
