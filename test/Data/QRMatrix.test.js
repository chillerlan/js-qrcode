/**
 * @created      22.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import {
	EccLevel, MaskPattern, QRCode, QRMatrix, QROptions, Version,
	ECC_H, ECC_L, M_ALIGNMENT, M_ALIGNMENT_DARK, M_DARKMODULE, M_DARKMODULE_LIGHT, M_FINDER, M_FINDER_DARK,
	M_FINDER_DOT, M_FORMAT, M_LOGO, M_QUIETZONE, M_SEPARATOR, M_DATA, M_DATA_DARK, M_TIMING_DARK, M_VERSION, PATTERN_000,
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
			new EccLevel(ECC_L),
			new MaskPattern(PATTERN_000)
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
	test('testSize', function(){
		assert.lengthOf(_matrix.matrix(), _matrix.size());
	});

	/**
	 * Tests if version() returns the current (given) version
	 */
	test('testVersion', function(){
		assert.strictEqual(_matrix.version().getVersionNumber(), _version);
	});

	/**
	 * Tests if eccLevel() returns the current (given) ECC level
	 */
	test('testECC', function(){
		assert.strictEqual(_matrix.eccLevel().getLevel(), ECC_L);
	});

	/**
	 * Tests if maskPattern() returns the current (or default) mask pattern
	 */
	test('testMaskPattern', function(){
		assert.strictEqual(_matrix.maskPattern().getPattern(), PATTERN_000);
	});

	/**
	 * Tests the set(), get() and check() methods
	 */
	test('testGetSetCheck', function(){
		_matrix.set(10, 10, true, M_DATA);
		assert.strictEqual(_matrix.get(10, 10), M_DATA_DARK);
		assert.isTrue(_matrix.check(10, 10));

		_matrix.set(20, 20, false, M_DATA);
		assert.strictEqual(_matrix.get(20, 20), M_DATA);
		assert.isFalse(_matrix.check(20, 20));

		// out of range
		assert.isFalse(_matrix.check(-1, -1));
		assert.strictEqual(_matrix.get(-1, -1), -1);
	});

	/**
	 * runs several tests over versions 1-40
	 */
	suite('version iteration', function(){

		// we need to recreate the matrix array on each run because js is dumb (per reference etc...)
		let matrixProvider = function(){
			let ecc  = new EccLevel(ECC_L);
			let mask = new MaskPattern(PATTERN_000);
			let m    = [];

			for(let version = 1; version <= 40; version++){
				m.push({
					$matrix: new QRMatrix(new Version(version), ecc, mask),
					desc  : `version ${version}`,
				});
			}

			return m;
		};

		/**
		 * Tests setting the dark module and verifies its position
		 */
		suite('testSetDarkModule', function(){
			matrixProvider().forEach(({$matrix, desc}) => {
				test(`${desc}`, function(){
					$matrix.setDarkModule();

					assert.strictEqual($matrix.get(8, $matrix.size() - 8), M_DARKMODULE);
				});
			});
		});

		/**
		 * Tests setting the finder patterns and verifies their positions
		 */
		suite('testSetFinderPattern', function(){
			matrixProvider().forEach(({$matrix, desc}) => {
				test(`${desc}`, function(){
					$matrix.setFinderPattern();

					assert.strictEqual($matrix.get(0, 0), M_FINDER_DARK);
					assert.strictEqual($matrix.get(0, $matrix.size() - 1), M_FINDER_DARK);
					assert.strictEqual($matrix.get($matrix.size() - 1, 0), M_FINDER_DARK);
				});
			});
		});

		/**
		 * Tests the separator patterns and verifies their positions
		 */
		suite('testSetSeparators', function(){
			matrixProvider().forEach(({$matrix, desc}) => {
				test(`${desc}`, function(){
					$matrix.setSeparators();

					assert.strictEqual($matrix.get(7, 0), M_SEPARATOR);
					assert.strictEqual($matrix.get(0, 7), M_SEPARATOR);
					assert.strictEqual($matrix.get(0, $matrix.size() - 8), M_SEPARATOR);
					assert.strictEqual($matrix.get($matrix.size() - 8, 0), M_SEPARATOR);
				});
			});
		});

		/**
		 * Tests the alignment patterns and verifies their positions - version 1 (no pattern) skipped
		 */
		suite('testSetAlignmentPattern', function(){
			matrixProvider().forEach(({$matrix, desc}) => {
				test(`${desc}`, function(){
					let $version = $matrix.version();

					if($version.getVersionNumber() === 1){
//						console.log('N/A (Version 1 has no alignment pattern)');
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
							if($matrix.checkTypeNotIn($px, $py, [M_FINDER, M_FINDER_DOT])){
								assert.strictEqual($matrix.get($px, $py), M_ALIGNMENT_DARK);
							}
						}
					}

				});
			});
		});

		/**
		 * Tests the timing patterns and verifies their positions
		 */
		suite('testSetTimingPattern', function(){
			matrixProvider().forEach(({$matrix, desc}) => {
				test(`${desc}`, function(){

					$matrix
						.setFinderPattern()
						.setAlignmentPattern()
						.setTimingPattern()
					;

					let $size = $matrix.size();

					for(let $i = 7; $i < $size - 7; $i++){
						// skip alignment pattern
						if($i % 2 === 0 && $matrix.checkTypeNotIn(6, $i, [M_ALIGNMENT])){
							assert.strictEqual($matrix.get(6, $i), M_TIMING_DARK);
							assert.strictEqual($matrix.get($i, 6), M_TIMING_DARK);
						}
					}

				});
			});
		});

		/**
		 * Tests the version patterns and verifies their positions - version < 7 skipped
		 */
		suite('testSetVersionNumber', function(){
			matrixProvider().forEach(({$matrix, desc}) => {
				test(`${desc}`, function(){

					if($matrix.version().getVersionNumber() < 7){
//						console.log('N/A (Version < 7)');
						this.skip();
					}

					$matrix.setVersionNumber();

					assert.isTrue($matrix.checkType($matrix.size() - 9, 0, M_VERSION));
					assert.isTrue($matrix.checkType($matrix.size() - 11, 5, M_VERSION));
					assert.isTrue($matrix.checkType(0, $matrix.size() - 9, M_VERSION));
					assert.isTrue($matrix.checkType(5, $matrix.size() - 11, M_VERSION));
				});
			});
		});

		/**
		 * Tests the format patterns and verifies their positions
		 */
		suite('testSetFormatInfo', function(){
			matrixProvider().forEach(({$matrix, desc}) => {
				test(`${desc}`, function(){
					$matrix.setFormatInfo();

					assert.isTrue($matrix.checkType(8, 0, M_FORMAT));
					assert.isTrue($matrix.checkType(0, 8, M_FORMAT));
					assert.isTrue($matrix.checkType($matrix.size() - 1, 8, M_FORMAT));
					assert.isTrue($matrix.checkType($matrix.size() - 8, 8, M_FORMAT));
				});
			});
		});

		/**
		 * Tests the quiet zone pattern and verifies its position
		 */
		suite('testSetQuietZone', function(){
			matrixProvider().forEach(({$matrix, desc}) => {
				test(`${desc}`, function(){
					let $size = $matrix.size();
					let $q    = 5;

					$matrix.set(0, 0, true, M_DATA);
					$matrix.set($size - 1, $size - 1, true, M_DATA);

					$matrix.setQuietZone($q);

					assert.lengthOf($matrix.matrix(), $size + 2 * $q);
					assert.lengthOf($matrix.matrix()[$size - 1], $size + 2 * $q);

					$size = $matrix.size();
					assert.isTrue($matrix.checkType(0, 0, M_QUIETZONE));
					assert.isTrue($matrix.checkType($size - 1, $size - 1, M_QUIETZONE));

					assert.strictEqual($matrix.get($q, $q), M_DATA_DARK);
					assert.strictEqual($matrix.get($size - 1 - $q, $size - 1 - $q), M_DATA_DARK);
				});
			});
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
	 * Tests the auto orientation of the logo space
	 */
	test('testSetLogoSpaceOrientation', function(){
		let $o = new QROptions();
		$o.version      = 10;
		$o.eccLevel     = ECC_H;
		$o.addQuietzone = false;

		let $matrix = (new QRCode($o)).addByteSegment('testdata').getMatrix();
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
	 * Tests whether an exception is thrown when an ECC level other than "H" is set when attempting to add logo space
	 */
	test('testSetLogoSpaceInvalidEccException', function(){
		assert.throws(() => {
			(new QRCode()).addByteSegment('testdata').getMatrix().setLogoSpace(50, 50);
		}, 'ECC level "H" required to add logo space')
	});

	/**
	 * Tests whether an exception is thrown when the logo space size exceeds the maximum ECC capacity
	 */
	test('testSetLogoSpaceMaxSizeException', function(){
		assert.throws(() => {
			let $o = new QROptions();
			$o.version      = 5;
			$o.eccLevel     = ECC_H;

			(new QRCode($o)).addByteSegment('testdata').getMatrix().setLogoSpace(37, 37);
		}, 'logo space exceeds the maximum error correction capacity')
	});

	/**
	 * Tests flipping the value of a module
	 */
	test('testFlip', function(){
		// using the dark module here because i'm lazy
		_matrix.setDarkModule();
		let $x = 8;
		let $y = _matrix.size() - 8;

		// cover checkType()
		assert.isTrue(_matrix.checkType($x, $y, M_DARKMODULE));
		// verify the current state (dark)
		assert.strictEqual(_matrix.get($x, $y), (M_DARKMODULE));
		// flip
		_matrix.flip($x, $y);
		// verify flip
		assert.strictEqual(_matrix.get($x, $y), M_DARKMODULE_LIGHT);
		// flip again
		_matrix.flip($x, $y);
		// verify flip
		assert.strictEqual(_matrix.get($x, $y), (M_DARKMODULE));
	});

});
