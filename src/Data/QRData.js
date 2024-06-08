/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import BitBuffer from '../Common/BitBuffer.js';
import EccLevel from '../Common/EccLevel.js';
import Version from '../Common/Version.js';
import QRMatrix from './QRMatrix.js';
import Mode from '../Common/Mode.js';
import QRCodeDataException from './QRCodeDataException.js';
import {VERSION_AUTO} from '../Common/constants.js';

/**
 * Processes the binary data and maps it on a matrix which is then being returned
 */
export default class QRData{

	/**
	 * the options instance
	 *
	 * @type {QROptions}
	 * @private
	 */
	options;

	/**
	 * a BitBuffer instance
	 *
	 * @type {BitBuffer}
	 * @private
	 */
	bitBuffer;

	/**
	 * an EccLevel instance
	 *
	 * @type {EccLevel}
	 * @private
	 */
	eccLevel;

	/**
	 * current QR Code version
	 *
	 * @type {Version}
	 * @private
	 */
	version;

	/**
	 * @type {QRDataModeAbstract[]|Array}
	 * @private
	 */
	dataSegments = [];

	/**
	 * Max bits for the current ECC mode
	 *
	 * @type {number[]|int[]}
	 * @private
	 */
	maxBitsForEcc;

	/**
	 * QRData constructor.
	 *
	 * @param {QROptions}                 $options
	 * @param {QRDataModeAbstract[]} $dataSegments
	 */
	constructor($options, $dataSegments = []){
		this.options       = $options;
		this.bitBuffer     = new BitBuffer;
		this.eccLevel      = new EccLevel(this.options.eccLevel);
		this.maxBitsForEcc = this.eccLevel.getMaxBits();

		this.setData($dataSegments);
	}

	/**
	 * Sets the data string (internally called by the constructor)
	 *
	 * @param {QRDataModeAbstract[]} $dataSegments
	 *
	 * @returns {QRData}
	 */
	setData($dataSegments){
		this.dataSegments = $dataSegments;
		this.version      = this.getMinimumVersion();

		this.bitBuffer.clear();
		this.writeBitBuffer();

		return this;
	}

	/**
	 * returns a fresh matrix object with the data written and masked with the given $maskPattern
	 *
	 * @returns {QRMatrix}
	 */
	writeMatrix(){
		return (new QRMatrix(this.version, this.eccLevel))
			.initFunctionalPatterns()
			.writeCodewords(this.bitBuffer)
		;
	}

	/**
	 * estimates the total length of the several mode segments in order to guess the minimum version
	 *
	 * @returns {number|int}
	 * @throws {QRCodeDataException}
	 * @private
	 */
	estimateTotalBitLength(){
		let $length = 0;
		let $segment;

		for($segment of this.dataSegments){
			// data length of the current segment
			$length += $segment.getLengthInBits();
			// +4 bits for the mode descriptor
			$length += 4;
		}

		let $provisionalVersion = null;

		for(let $version in this.maxBitsForEcc){

			if($version === 0){ // JS array/object weirdness vs php arrays...
				continue;
			}

			if($length <= this.maxBitsForEcc[$version]){
				$provisionalVersion = $version;
			}

		}

		if($provisionalVersion !== null){

			// add character count indicator bits for the provisional version
			for($segment of this.dataSegments){
				$length += Mode.getLengthBitsForVersion($segment.datamode, $provisionalVersion);
			}

			// it seems that in some cases the estimated total length is not 100% accurate,
			// so we substract 4 bits from the total when not in mixed mode
			if(this.dataSegments.length <= 1){
				$length -= 4;
			}

			// we've got a match!
			// or let's see if there's a higher version number available
			if($length <= this.maxBitsForEcc[$provisionalVersion] || this.maxBitsForEcc[($provisionalVersion + 1)]){
				return $length;
			}

		}

		throw new QRCodeDataException(`estimated data exceeds ${$length} bits`);
	}

	/**
	 * returns the minimum version number for the given string
	 *
	 * @return {Version}
	 * @throws {QRCodeDataException}
	 * @private
	 */
	getMinimumVersion(){

		if(this.options.version !== VERSION_AUTO){
			return new Version(this.options.version);
		}

		let $total = this.estimateTotalBitLength();

		// guess the version number within the given range
		for(let $version = this.options.versionMin; $version <= this.options.versionMax; $version++){
			if($total <= (this.maxBitsForEcc[$version] - 4)){
				return new Version($version);
			}
		}
		/* c8 ignore next 2 */
		// it's almost impossible to run into this one as $this::estimateTotalBitLength() would throw first
		throw new QRCodeDataException('failed to guess minimum version');
	}

	/**
	 * creates a BitBuffer and writes the string data to it
	 *
	 * @returns {void}
	 * @throws {QRCodeException} on data overflow
	 * @private
	 */
	writeBitBuffer(){
		let $MAX_BITS = this.eccLevel.getMaxBitsForVersion(this.version);

		for(let $i = 0; $i < this.dataSegments.length; $i++){
			this.dataSegments[$i].write(this.bitBuffer, this.version.getVersionNumber());
		}

		// overflow, likely caused due to invalid version setting
		if(this.bitBuffer.getLength() > $MAX_BITS){
			throw new QRCodeDataException(`code length overflow. (${this.bitBuffer.getLength()} > ${$MAX_BITS} bit)`);
		}

		// add terminator (ISO/IEC 18004:2000 Table 2)
		if(this.bitBuffer.getLength() + 4 <= $MAX_BITS){
			this.bitBuffer.put(0, 4);
		}

		// Padding: ISO/IEC 18004:2000 8.4.9 Bit stream to codeword conversion

		// if the final codeword is not exactly 8 bits in length, it shall be made 8 bits long
		// by the addition of padding bits with binary value 0
		while(this.bitBuffer.getLength() % 8 !== 0){

			if(this.bitBuffer.getLength() === $MAX_BITS){
				break;
			}

			this.bitBuffer.putBit(false);
		}

		// The message bit stream shall then be extended to fill the data capacity of the symbol
		// corresponding to the Version and Error Correction Level, by the addition of the Pad
		// Codewords 11101100 and 00010001 alternately.
		let $alternate = false;

		while(this.bitBuffer.getLength() <= $MAX_BITS){
			this.bitBuffer.put($alternate ? 0b00010001 : 0b11101100, 8);
			$alternate = !$alternate;
		}

		// In certain versions of symbol, it may be necessary to add 3, 4 or 7 Remainder Bits (all zeros)
		// to the end of the message in order exactly to fill the symbol capacity
		while(this.bitBuffer.getLength() <= $MAX_BITS){
			this.bitBuffer.putBit(false);
		}

	}

}
