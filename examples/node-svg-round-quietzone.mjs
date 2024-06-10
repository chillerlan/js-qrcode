/**
 * @created      10.06.2024
 * @author       smiley <smiley@chillerlan.net>
 * @copyright    2024 smiley
 * @license      MIT
 */

import * as qrc from '../src/index.js';
import RoundQuietzoneSVGoutput from './RoundQuietzoneSVGoutput.js';
import RoundQuietzoneOptions from './RoundQuietzoneOptions.js';
import * as fs from 'node:fs';

/*
 * run the example
 */

// use the extended options class
let options = new RoundQuietzoneOptions({
	// custom dot options (see extended options class)
	additionalModules   : 5,
	// logo from: https://github.com/simple-icons/simple-icons
	svgLogo             : '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
	svgLogoCssClass     : 'logo',
	svgLogoScale        : 0.2,
	dotColors           : [111, 222, 333, 444, 555, 666],
	// load our own output class
	outputInterface     : RoundQuietzoneSVGoutput,
	version             : 7,
	eccLevel            : qrc.ECC_H,
	// we're not adding a quiet zone, this is done internally in our own module
	addQuietzone        : false,
	// toggle base64 data URI
	outputBase64        : false,
	// DOM is not available here
	returnAsDomElement  : false,
	svgUseFillAttributes: false,
	// if set to false, the light modules won't be rendered
	drawLightModules    : false,
	// draw the modules as circles isntead of squares
	drawCircularModules : true,
	circleRadius        : 0.4,
	// connect paths
	connectPaths        : true,
	excludeFromConnect  : [
		qrc.M_LOGO,
		qrc.M_QUIETZONE,
	],
	// keep modules of these types as square
	keepAsSquare        : [
		qrc.M_FINDER_DARK,
		qrc.M_FINDER_DOT,
		qrc.M_ALIGNMENT_DARK,
	],
	svgDefs             :
		'\n<linearGradient id="blurple" x1="100%" y2="100%">\n' +
		'<stop stop-color="#D70071" offset="0"/>\n' +
		'<stop stop-color="#9C4E97" offset="0.5"/>\n' +
		'<stop stop-color="#0035A9" offset="1.0"/>\n' +
		'</linearGradient>\n' +
		'<linearGradient id="rainbow" x1="100%" y2="100%">\n' +
		'<stop stop-color="#e2453c" offset="0"/>\n' +
		'<stop stop-color="#e07e39" offset="0.2"/>\n' +
		'<stop stop-color="#e5d667" offset="0.4"/>\n' +
		'<stop stop-color="#51b95b" offset="0.6"/>\n' +
		'<stop stop-color="#1e72b7" offset="0.8"/>\n' +
		'<stop stop-color="#6f5ba7" offset="1.0"/>\n' +
		'</linearGradient>\n' +
		'<style><![CDATA[\n' +
		'.light{ fill: #eee; }\n' +
		'.dark{ fill: url(#rainbow); }\n' +
		'.logo{ fill: url(#blurple); }\n' +
		'.qr-circle{ fill: none; stroke: url(#blurple); }\n' +
		// the custom colors for the "confetti" quiet zone
		'.qr-111{ fill: #e2453c; }\n' +
		'.qr-222{ fill: #e07e39; }\n' +
		'.qr-333{ fill: #e5d667; }\n' +
		'.qr-444{ fill: #51b95b; }\n' +
		'.qr-555{ fill: #1e72b7; }\n' +
		'.qr-666{ fill: #6f5ba7; }\n' +
		']]></style>',
});


let data   = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
let qrcode = (new qrc.QRCode(options)).render(data);

// write the data to an svg file
fs.writeFile('./qrcode.svg', qrcode, (err) => {
	if(err){
		console.error(err);
	}
});
