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
import Byte from './Byte.js';
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
	 * @type {int[]}
	 * @private
	 */
	maxBitsForEcc;

	/**
	 * QRData constructor.
	 *
	 * @param {QROptions}                 $options
	 * @param {QRDataModeAbstract[]|null} $dataSegments
	 */
	constructor($options, $dataSegments = null){
		this.options       = $options;
		this.bitBuffer     = new BitBuffer;
		this.eccLevel      = new EccLevel(this.options.eccLevel);
		this.maxBitsForEcc = this.eccLevel.getMaxBits();

		if($dataSegments !== null){
			this.setData($dataSegments);
		}

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
	 * @param {MaskPattern} $maskPattern
	 *
	 * @returns {QRMatrix}
	 */
	writeMatrix($maskPattern){
		return (new QRMatrix(this.version, this.eccLevel, $maskPattern))
			.initFunctionalPatterns()
			.writeCodewords(this.bitBuffer)
			.mask()
		;
	}

	/**
	 * estimates the total length of the several mode segments in order to guess the minimum version
	 *
	 * @returns {int}
	 * @throws \chillerlan\QRCode\Data\QRCodeDataException
	 * @private
	 */
	estimateTotalBitLength(){
		let $length = 0;
		let $margin = 0;
		let $i;

		for($i = 0; $i < this.dataSegments.length; $i++){
			let $segment = this.dataSegments[$i];
			// data length in bits of the current segment +4 bits for each mode descriptor
			$length += ($segment.getLengthInBits() + Mode.getLengthBitsForMode($segment.getDataMode())[0] + 4);

//			if(!$segment instanceof ECI){
				// mode length bits margin to the next breakpoint
				$margin += ($segment instanceof Byte ? 8 : 2);
//			}

		}

		let $breakpoints = [9, 26, 40];

		for($i = 0; $i < $breakpoints.length; $i++){
			// length bits for the first breakpoint have already been added
			if($breakpoints[$i] > 9){
				$length += $margin;
			}

			if($length < this.maxBitsForEcc[$breakpoints[$i]]){
				return $length;
			}

		}

		throw new QRCodeDataException(`estimated data exceeds ${$length} bits, max: ${this.maxBitsForEcc[$breakpoints[$i]]}`);
	}

	/**
	 * returns the minimum version number for the given string
	 *
	 * @return {Version}
	 * @throws \chillerlan\QRCode\Data\QRCodeDataException
	 * @private
	 */
	getMinimumVersion(){

		if(this.options.version !== VERSION_AUTO){
			return new Version(this.options.version);
		}

		let $total = this.estimateTotalBitLength();

		// guess the version number within the given range
		for(let $version = this.options.versionMin; $version <= this.options.versionMax; $version++){
			if($total <= this.maxBitsForEcc[$version]){
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
	 * @throws \chillerlan\QRCode\QRCodeException on data overflow
	 * @private
	 */
	writeBitBuffer(){
		let $version  = this.version.getVersionNumber();
		let $MAX_BITS = this.maxBitsForEcc[$version];

		for(let $i = 0; $i < this.dataSegments.length; $i++){
			this.dataSegments[$i].write(this.bitBuffer, $version);
		}

		// overflow, likely caused due to invalid version setting
		if(this.bitBuffer.getLength() > $MAX_BITS){
			throw new QRCodeDataException('code length overflow. (' + this.bitBuffer.getLength() + ' > ' + $MAX_BITS + ' bit)');
		}

		// add terminator (ISO/IEC 18004:2000 Table 2)
		if(this.bitBuffer.getLength() + 4 <= $MAX_BITS){
			this.bitBuffer.put(0, 4);
		}

		// Padding: ISO/IEC 18004:2000 8.4.9 Bit stream to codeword conversion

		// if the final codeword is not exactly 8 bits in length, it shall be made 8 bits long
		// by the addition of padding bits with binary value 0
		while(this.bitBuffer.getLength() % 8 !== 0){
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

	}

}
