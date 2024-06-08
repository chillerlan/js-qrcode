/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QROutputAbstract from './QROutputAbstract.js';
import PHPJS from '../Common/PHPJS.js';
import {LAYERNAMES} from '../Common/constants.js';

/**
 * Converts the matrix data into string types
 */
export default class QRStringJSON extends QROutputAbstract{

	/**
	 * @inheritDoc
	 */
	mimeType = 'application/json';

	/**
	 * the json schema
	 *
	 * @type {string}
	 */
	schema = 'https://raw.githubusercontent.com/chillerlan/php-qrcode/main/src/Output/qrcode.schema.json';

	/**
	 * @inheritDoc
	 */
	dump($file){
		let [width, height] = this.getOutputDimensions();
		let version   = this.matrix.getVersion();
		let dimension = version.getDimension();


		let $json = {
			$schema: this.schema,
			qrcode: {
				version: version.getVersionNumber(),
				eccLevel: this.matrix.getEccLevel().toString(),
				matrix: {
					size: dimension,
					quietzoneSize: PHPJS.intval((this.moduleCount - dimension) / 2),
					maskPattern: this.matrix.getMaskPattern().getPattern(),
					width: width,
					height: height,
					rows: [],
				}
			}
		};

		let matrix = this.matrix.getMatrix();

		for(let y in matrix){
			let matrixRow = this.row(y, matrix[y]);

			if(matrixRow !== null){
				$json.qrcode.matrix.rows.push(matrixRow);
			}
		}

		let $data = JSON.stringify($json);

		this.saveToFile($data, $file);

		return $data;
	}

	/**
	 * Creates an array element for a matrix row
	 *
	 * @returns {*}
	 * @protected
	 */
	row($y, $row){
		let matrixRow = {y: $y, modules: []};

		for(let x in $row){
			let module = this.module(x, $y, $row[x]);

			if(module !== null){
				matrixRow.modules.push(module);
			}
		}

		if(matrixRow.modules.length){
			return matrixRow;
		}

		// skip empty rows
		return null;
	}

	/**
	 * Creates an array element for a single module
	 *
	 * @returns {*}
	 * @protected
	 */
	module($x, $y, $M_TYPE){
		let isDark = this.matrix.isDark($M_TYPE);

		if(!this.options.drawLightModules && !isDark){
			return null;
		}

		return {
			x: $x,
			dark: isDark,
			layer: (LAYERNAMES[$M_TYPE] ?? ''),
			value: this.getModuleValue($M_TYPE),
		}
	}

}
