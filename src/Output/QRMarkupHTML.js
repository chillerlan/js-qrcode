/**
 * @created      11.07.2022
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2022 smiley
 * @license      MIT
 */

import QRMarkup from './QRMarkup.js';
import QRCodeOutputException from './QRCodeOutputException.js';

export default class QRMarkupHTML extends QRMarkup{

	/**
	 * @inheritDoc
	 */
	createMarkup($saveToFile){
		let cssClass = this.getCssClass();
		let div      = '<div>';

		if(cssClass !== ''){
			div = `<div class="${cssClass}">`;
		}

		let $html = [div];

		for(let $y = 0; $y < this.moduleCount; $y++){
			let $row = ['<div>'];

			for(let $x = 0; $x < this.moduleCount; $x++){
				$row.push(`<span class="${this.moduleValues[this.matrix.get($x, $y)]}"></span>`);
			}

			$row.push('</div>');
			$html.push($row.join(this.options.eol));
		}

		$html.push('</div>');

		return $html.join(this.options.eol);
	}

	/**
	 * @inheritDoc
	 */
	getCssClass($M_TYPE){

		if(typeof this.options.cssClass !== 'string'){
			throw new QRCodeOutputException('invalid css class given');
		}

		return this.options.cssClass.trim();
	}

}
