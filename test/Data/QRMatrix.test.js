/**
 * @created      22.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {
	EccLevel, MaskPattern, QRCode, QRMatrix, QROptions, Version,
	ECC_H, ECC_L, M_ALIGNMENT, M_ALIGNMENT_DARK, M_DARKMODULE, M_DARKMODULE_LIGHT, M_FINDER, M_FINDER_DARK, M_FINDER_DOT,
	M_FORMAT, M_LOGO, M_LOGO_DARK, M_QUIETZONE, M_SEPARATOR, M_DATA, M_DATA_DARK, M_TIMING_DARK, M_VERSION, PATTERN_100,
} from '../../src/index.js';

import {beforeEach, suite, test} from 'mocha';
import {assert} from 'chai';

suite('QRMatrixTest', function(){

	/**
	 * @type {QRMatrix}
	 * @private
	 */
	let _matrix;
	/**
	 * @type {number}
	 * @private
	 */
	let _version = 40;

	/**
	 * invokes a QRMatrix object
	 */
	beforeEach(function(){
		_matrix = new QRMatrix(
			new Version(_version),
			new EccLevel(ECC_L)
		)
	});

	/**
	 * Validates the QRMatrix instance
	 */
	test('testInstance', function(){
		assert.instanceOf(_matrix, QRMatrix);
	});

	/**
	 * Tests if size() returns the actual matrix size/count
	 */
	test('testGetSize', function(){
		assert.lengthOf(_matrix.getMatrix(), _matrix.getSize());
	});

	/**
	 * Tests if version() returns the current (given) version
	 */
	test('testGetVersion', function(){
		assert.strictEqual(_matrix.getVersion().getVersionNumber(), _version);
	});

	/**
	 * Tests if eccLevel() returns the current (given) ECC level
	 */
	test('testGetECC', function(){
		assert.strictEqual(_matrix.getEccLevel().getLevel(), ECC_L);
	});

	/**
	 * Tests if maskPattern() returns the current (or default) mask pattern
	 */
	test('testGetMaskPattern', function(){
		let $matrix = (new QRCode).addByteSegment('testdata').getQRMatrix();

		assert.instanceOf($matrix.getMaskPattern(), MaskPattern);
		assert.strictEqual($matrix.getMaskPattern().getPattern(), PATTERN_100);
	});

	/**
	 * Tests the set(), get() and check() methods
	 */
	test('testGetSetCheck', function(){
		_matrix.set(10, 10, true, M_LOGO);
		assert.strictEqual(_matrix.get(10, 10), M_LOGO_DARK);
		assert.isTrue(_matrix.check(10, 10));

		_matrix.set(20, 20, false, M_LOGO);
		assert.strictEqual(_matrix.get(20, 20), M_LOGO);
		assert.isFalse(_matrix.check(20, 20));

		// get proper results when using a *_DARK constant
		_matrix.set(30, 30, true, M_LOGO_DARK);
		assert.strictEqual(_matrix.get(30, 30), M_LOGO_DARK);

		_matrix.set(40, 40, false, M_LOGO_DARK);
		assert.strictEqual(_matrix.get(40, 40), M_LOGO);

		// out of range
		assert.isFalse(_matrix.check(-1, -1));
		assert.strictEqual(_matrix.get(-1, -1), -1);
	});

	/**
	 * runs several tests over versions 1-40
	 */
	suite('version iteration', function(){

		let matrixProvider = function*(){
			let ecc  = new EccLevel(ECC_L);

			for(let version = 1; version <= 40; version++){
				yield ({
					$matrix: new QRMatrix(new Version(version), ecc),
					desc  : `version ${version}`,
				});
			}
		};

		/**
		 * Tests setting the dark module and verifies its position
		 */
		suite('testSetDarkModule', function(){
			for(let {$matrix, desc} of matrixProvider()){
				test(`${desc}`, function(){
					$matrix.setDarkModule();

					assert.strictEqual($matrix.get(8, $matrix.getSize() - 8), M_DARKMODULE);
				});
			}
		});

		/**
		 * Tests setting the finder patterns and verifies their positions
		 */
		suite('testSetFinderPattern', function(){
			for(let {$matrix, desc} of matrixProvider()){
				test(`${desc}`, function(){
					$matrix.setFinderPattern();

					assert.strictEqual($matrix.get(0, 0), M_FINDER_DARK);
					assert.strictEqual($matrix.get(0, $matrix.getSize() - 1), M_FINDER_DARK);
					assert.strictEqual($matrix.get($matrix.getSize() - 1, 0), M_FINDER_DARK);
				});
			}
		});

		/**
		 * Tests the separator patterns and verifies their positions
		 */
		suite('testSetSeparators', function(){
			for(let {$matrix, desc} of matrixProvider()){
				test(`${desc}`, function(){
					$matrix.setSeparators();

					assert.strictEqual($matrix.get(7, 0), M_SEPARATOR);
					assert.strictEqual($matrix.get(0, 7), M_SEPARATOR);
					assert.strictEqual($matrix.get(0, $matrix.getSize() - 8), M_SEPARATOR);
					assert.strictEqual($matrix.get($matrix.getSize() - 8, 0), M_SEPARATOR);
				});
			}
		});

		/**
		 * Tests the alignment patterns and verifies their positions - version 1 (no pattern) skipped
		 */
		suite('testSetAlignmentPattern', function(){
			for(let {$matrix, desc} of matrixProvider()){
				test(`${desc}`, function(){
					let $version = $matrix.getVersion();

					if($version.getVersionNumber() === 1){
						console.log('N/A (Version 1 has no alignment pattern)');
						this.skip();
					}

					$matrix
						.setFinderPattern()
						.setAlignmentPattern()
					;

					let $alignmentPattern = $version.getAlignmentPattern();

					for(let $py in $alignmentPattern){
						for(let $px in $alignmentPattern){
							// skip finder pattern
							if(!$matrix.checkTypeIn($px, $py, [M_FINDER, M_FINDER_DOT])){
								assert.strictEqual($matrix.get($px, $py), M_ALIGNMENT_DARK);
							}
						}
					}

				});
			}
		});

		/**
		 * Tests the timing patterns and verifies their positions
		 */
		suite('testSetTimingPattern', function(){
			for(let {$matrix, desc} of matrixProvider()){
				test(`${desc}`, function(){

					$matrix
						.setFinderPattern()
						.setAlignmentPattern()
						.setTimingPattern()
					;

					let $size = $matrix.getSize();

					for(let $i = 7; $i < $size - 7; $i++){
						// skip alignment pattern
						if($i % 2 === 0 && !$matrix.checkTypeIn(6, $i, [M_ALIGNMENT])){
							assert.strictEqual($matrix.get(6, $i), M_TIMING_DARK);
							assert.strictEqual($matrix.get($i, 6), M_TIMING_DARK);
						}
					}

				});
			}
		});

		/**
		 * Tests the version patterns and verifies their positions - version < 7 skipped
		 */
		suite('testSetVersionNumber', function(){
			for(let {$matrix, desc} of matrixProvider()){
				test(`${desc}`, function(){

					if($matrix.getVersion().getVersionNumber() < 7){
						console.log('N/A (Version < 7)');
						this.skip();
					}

					$matrix.setVersionNumber();

					assert.isTrue($matrix.checkType($matrix.getSize() - 9, 0, M_VERSION));
					assert.isTrue($matrix.checkType($matrix.getSize() - 11, 5, M_VERSION));
					assert.isTrue($matrix.checkType(0, $matrix.getSize() - 9, M_VERSION));
					assert.isTrue($matrix.checkType(5, $matrix.getSize() - 11, M_VERSION));
				});
			}
		});

		/**
		 * Tests the format patterns and verifies their positions
		 */
		suite('testSetFormatInfo', function(){
			for(let {$matrix, desc} of matrixProvider()){
				test(`${desc}`, function(){
					$matrix.setFormatInfo();

					assert.isTrue($matrix.checkType(8, 0, M_FORMAT));
					assert.isTrue($matrix.checkType(0, 8, M_FORMAT));
					assert.isTrue($matrix.checkType($matrix.getSize() - 1, 8, M_FORMAT));
					assert.isTrue($matrix.checkType($matrix.getSize() - 8, 8, M_FORMAT));
				});
			}
		});

		/**
		 * Tests the quiet zone pattern and verifies its position
		 */
		suite('testSetQuietZone', function(){
			for(let {$matrix, desc} of matrixProvider()){
				test(`${desc}`, function(){
					let $size          = $matrix.getSize();
					let $quietZoneSize = 5;

					$matrix.set(0, 0, true, M_LOGO);
					$matrix.set($size - 1, $size - 1, true, M_LOGO);

					$matrix.setQuietZone($quietZoneSize);

					let $s = ($size + 2 * $quietZoneSize);

					assert.lengthOf($matrix.getMatrix(), $s);
					assert.lengthOf($matrix.getMatrix()[$size - 1], $s);

					$size = $matrix.getSize();

					assert.isTrue($matrix.checkType(0, 0, M_QUIETZONE));
					assert.isTrue($matrix.checkType($size - 1, $size - 1, M_QUIETZONE));

					$s = ($size - 1 - $quietZoneSize);

					assert.strictEqual($matrix.get($quietZoneSize, $quietZoneSize), M_LOGO_DARK);
					assert.strictEqual($matrix.get($s, $s), M_LOGO_DARK);
				});
			}
		});

		/**
		 * Tests rotating the matrix by 90 degrees CW
		 */
		suite('testRotate90', function(){
			for(let {$matrix, desc} of matrixProvider()){
				test(`${desc}`, function(){
					$matrix.initFunctionalPatterns();

					// matrix size
					let $size = $matrix.getSize();
					// quiet zone size
					let $qz   = (($size - $matrix.getVersion().getDimension()) / 2);

					// initial dark module position
					assert.strictEqual($matrix.get((8 + $qz), ($size - 8 - $qz)), M_DARKMODULE);

					// first rotation
					$matrix.rotate90();
					assert.strictEqual($matrix.get((7 + $qz), (8 + $qz)), M_DARKMODULE);

					// second rotation
					$matrix.rotate90();
					assert.strictEqual($matrix.get(($size - 9 - $qz), (7 + $qz)), M_DARKMODULE);

					// third rotation
					$matrix.rotate90();
					assert.strictEqual($matrix.get(($size - 8 - $qz), ($size - 9 - $qz)), M_DARKMODULE);

					// fourth rotation
					$matrix.rotate90();
					assert.strictEqual($matrix.get((8 + $qz), ($size - 8 - $qz)), M_DARKMODULE);
				});

			}
		});

	});

	/**
	 * Tests if an exception is thrown in an attempt to create the quiet zone before data was written
	 */
	test('testSetQuietZoneException', function(){
		assert.throws(() => {
			_matrix.setQuietZone(42);
		}, 'use only after writing data')
	});

	/**
	 * Tests if the logo space is drawn square if one of the dimensions is omitted
	 */
	test('testSetLogoSpaceOmitDimension', function(){
		let $o = new QROptions;
		$o.version         = 2;
		$o.eccLevel        = ECC_H;
		$o.addQuietzone    = false;
		$o.addLogoSpace    = true;
		$o.logoSpaceHeight = 5;

		let $matrix = (new QRCode($o)).addByteSegment('testdata').getQRMatrix();

		assert.isFalse($matrix.checkType(9, 9, M_LOGO));
		assert.isTrue($matrix.checkType(10, 10, M_LOGO));

		assert.isTrue($matrix.checkType(14, 14, M_LOGO));
		assert.isFalse($matrix.checkType(15, 15, M_LOGO));
	});

	/**
	 * Tests the auto orientation of the logo space
	 */
	test('testSetLogoSpaceOrientation', function(){
		let $o = new QROptions();
		$o.version      = 10;
		$o.eccLevel     = ECC_H;
		$o.addQuietzone = false;

		let $matrix = (new QRCode($o)).addByteSegment('testdata').getQRMatrix();
		// also testing size adjustment to uneven numbers
		$matrix.setLogoSpace(20, 14);

		// NW corner
		assert.isFalse($matrix.checkType(17, 20, M_LOGO));
		assert.isTrue($matrix.checkType(18, 21, M_LOGO));

		// SE corner
		assert.isTrue($matrix.checkType(38, 35, M_LOGO));
		assert.isFalse($matrix.checkType(39, 36, M_LOGO));
	});

	/**
	 * Tests the manual positioning of the logo space
	 */
	test('testSetLogoSpacePosition', function(){
		let $o = new QROptions;
		$o.version       = 10;
		$o.eccLevel      = ECC_H;
		$o.addQuietzone  = true;
		$o.quietzoneSize = 10;

		let $matrix = (new QRCode($o)).addByteSegment('testdata').getQRMatrix();

		$matrix.setLogoSpace(21, 21, -10, -10);

		assert.strictEqual($matrix.get(9, 9), M_QUIETZONE);
		assert.strictEqual($matrix.get(10, 10), M_LOGO);
		assert.strictEqual($matrix.get(20, 20), M_LOGO);
		assert.notStrictEqual($matrix.get(21, 21), M_LOGO);

		// I just realized that setLogoSpace() could be called multiple times
		// on the same instance, and I'm not going to do anything about it :P
		$matrix.setLogoSpace(21, 21, 45, 45);

		assert.notStrictEqual($matrix.get(54, 54), M_LOGO);
		assert.strictEqual($matrix.get(55, 55), M_LOGO);
		assert.strictEqual($matrix.get(67, 67), M_QUIETZONE);
	});

	/**
	 * Tests whether an exception is thrown when an ECC level other than "H" is set when attempting to add logo space
	 */
	test('testSetLogoSpaceInvalidEccException', function(){
		assert.throws(() => {
			(new QRCode()).addByteSegment('testdata').getQRMatrix().setLogoSpace(50, 50);
		}, 'ECC level "H" required to add logo space')
	});

	/**
	 * Tests whether an exception is thrown when width or height exceed the matrix size
	 */
	test('testSetLogoSpaceExceedsException', function(){
		assert.throws(() => {
			let $o = new QROptions();
			$o.version      = 5;
			$o.eccLevel     = ECC_H;

			(new QRCode($o)).addByteSegment('testdata').getQRMatrix().setLogoSpace(69, 1);
		}, 'logo dimensions exceed matrix size')
	});

	/**
	 * Tests whether an exception is thrown when the logo space size exceeds the maximum ECC capacity
	 */
	test('testSetLogoSpaceMaxSizeException', function(){
		assert.throws(() => {
			let $o = new QROptions();
			$o.version      = 5;
			$o.eccLevel     = ECC_H;

			(new QRCode($o)).addByteSegment('testdata').getQRMatrix().setLogoSpace(37, 37);
		}, 'logo space exceeds the maximum error correction capacity')
	});

	/**
	 * Tests flipping the value of a module
	 */
	test('testFlip', function(){
		_matrix.set(20, 20, true, M_LOGO);

		// cover checkType()
		assert.isTrue(_matrix.checkType(20, 20, M_LOGO));
		// verify the current state (dark)
		assert.strictEqual(_matrix.get(20, 20), M_LOGO_DARK);
		// flip
		_matrix.flip(20, 20);
		// verify flip
		assert.strictEqual(_matrix.get(20, 20), M_LOGO);
		// flip again
		_matrix.flip(20, 20);
		// verify flip
		assert.strictEqual(_matrix.get(20, 20), M_LOGO_DARK);
	});

	/**
	 * Tests checking whether the M_TYPE of a module is not one of an array of M_TYPES
	 */
	test('testCheckTypeIn', function(){
		_matrix.set(10, 10, true, M_QUIETZONE);

		assert.isFalse(_matrix.checkTypeIn(10, 10, [M_DATA, M_FINDER]));
		assert.isTrue(_matrix.checkTypeIn(10, 10, [M_QUIETZONE, M_FINDER]));
	});

	test('testCheckNeighbours', function(){
		_matrix
			.setFinderPattern()
			.setAlignmentPattern()
		;

		/*
		 * center of finder pattern (surrounded by all dark)
		 *
		 *   # # # # # # #
		 *   #           #
		 *   #   # # #   #
		 *   #   # 0 #   #
		 *   #   # # #   #
		 *   #           #
		 *   # # # # # # #
		 */
		assert.strictEqual(_matrix.checkNeighbours(3, 3), 0b11111111);

		/*
		 * center of alignment pattern (surrounded by all light)
		 *
		 *   # # # # #
		 *   #       #
		 *   #   0   #
		 *   #       #
		 *   # # # # #
		 */
		assert.strictEqual(_matrix.checkNeighbours(30, 30), 0b00000000);

		/*
		 * top left light block of finder pattern
		 *
		 *   # # #
		 *   # 0
		 *   #   #
		 */
		assert.strictEqual(_matrix.checkNeighbours(1, 1), 0b11010111);

		/*
		 * bottom left light block of finder pattern
		 *
		 *   #   #
		 *   # 0
		 *   # # #
		 */
		assert.strictEqual(_matrix.checkNeighbours(1, 5), 0b11110101);

		/*
		 * top right light block of finder pattern
		 *
		 *   # # #
		 *     0 #
		 *   #   #
		 */
		assert.strictEqual(_matrix.checkNeighbours(5, 1), 0b01011111);

		/*
		 * bottom right light block of finder pattern
		 *
		 *   #   #
		 *     0 #
		 *   # # #
		 */
		assert.strictEqual(_matrix.checkNeighbours(5, 5), 0b01111101);

		/*
		 * M_TYPE check
		 *
		 *   # # #
		 *     0
		 *   X X X
		 */
		assert.strictEqual(_matrix.checkNeighbours(3, 1, M_FINDER), 0b00000111);
		assert.strictEqual(_matrix.checkNeighbours(3, 1, M_FINDER_DOT), 0b01110000);
	});

});
