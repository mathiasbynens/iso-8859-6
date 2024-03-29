/*! https://mths.be/iso-8859-6 v3.0.4 by @mathias | MIT license */

const stringFromCharCode = String.fromCharCode;

const INDEX_BY_CODE_POINT = new Map([
	[128, 0],
	[129, 1],
	[130, 2],
	[131, 3],
	[132, 4],
	[133, 5],
	[134, 6],
	[135, 7],
	[136, 8],
	[137, 9],
	[138, 10],
	[139, 11],
	[140, 12],
	[141, 13],
	[142, 14],
	[143, 15],
	[144, 16],
	[145, 17],
	[146, 18],
	[147, 19],
	[148, 20],
	[149, 21],
	[150, 22],
	[151, 23],
	[152, 24],
	[153, 25],
	[154, 26],
	[155, 27],
	[156, 28],
	[157, 29],
	[158, 30],
	[159, 31],
	[160, 32],
	[164, 36],
	[173, 45],
	[1548, 44],
	[1563, 59],
	[1567, 63],
	[1569, 65],
	[1570, 66],
	[1571, 67],
	[1572, 68],
	[1573, 69],
	[1574, 70],
	[1575, 71],
	[1576, 72],
	[1577, 73],
	[1578, 74],
	[1579, 75],
	[1580, 76],
	[1581, 77],
	[1582, 78],
	[1583, 79],
	[1584, 80],
	[1585, 81],
	[1586, 82],
	[1587, 83],
	[1588, 84],
	[1589, 85],
	[1590, 86],
	[1591, 87],
	[1592, 88],
	[1593, 89],
	[1594, 90],
	[1600, 96],
	[1601, 97],
	[1602, 98],
	[1603, 99],
	[1604, 100],
	[1605, 101],
	[1606, 102],
	[1607, 103],
	[1608, 104],
	[1609, 105],
	[1610, 106],
	[1611, 107],
	[1612, 108],
	[1613, 109],
	[1614, 110],
	[1615, 111],
	[1616, 112],
	[1617, 113],
	[1618, 114]
]);
const INDEX_BY_POINTER = new Map([
	[0, '\x80'],
	[1, '\x81'],
	[2, '\x82'],
	[3, '\x83'],
	[4, '\x84'],
	[5, '\x85'],
	[6, '\x86'],
	[7, '\x87'],
	[8, '\x88'],
	[9, '\x89'],
	[10, '\x8A'],
	[11, '\x8B'],
	[12, '\x8C'],
	[13, '\x8D'],
	[14, '\x8E'],
	[15, '\x8F'],
	[16, '\x90'],
	[17, '\x91'],
	[18, '\x92'],
	[19, '\x93'],
	[20, '\x94'],
	[21, '\x95'],
	[22, '\x96'],
	[23, '\x97'],
	[24, '\x98'],
	[25, '\x99'],
	[26, '\x9A'],
	[27, '\x9B'],
	[28, '\x9C'],
	[29, '\x9D'],
	[30, '\x9E'],
	[31, '\x9F'],
	[32, '\xA0'],
	[36, '\xA4'],
	[44, '\u060C'],
	[45, '\xAD'],
	[59, '\u061B'],
	[63, '\u061F'],
	[65, '\u0621'],
	[66, '\u0622'],
	[67, '\u0623'],
	[68, '\u0624'],
	[69, '\u0625'],
	[70, '\u0626'],
	[71, '\u0627'],
	[72, '\u0628'],
	[73, '\u0629'],
	[74, '\u062A'],
	[75, '\u062B'],
	[76, '\u062C'],
	[77, '\u062D'],
	[78, '\u062E'],
	[79, '\u062F'],
	[80, '\u0630'],
	[81, '\u0631'],
	[82, '\u0632'],
	[83, '\u0633'],
	[84, '\u0634'],
	[85, '\u0635'],
	[86, '\u0636'],
	[87, '\u0637'],
	[88, '\u0638'],
	[89, '\u0639'],
	[90, '\u063A'],
	[96, '\u0640'],
	[97, '\u0641'],
	[98, '\u0642'],
	[99, '\u0643'],
	[100, '\u0644'],
	[101, '\u0645'],
	[102, '\u0646'],
	[103, '\u0647'],
	[104, '\u0648'],
	[105, '\u0649'],
	[106, '\u064A'],
	[107, '\u064B'],
	[108, '\u064C'],
	[109, '\u064D'],
	[110, '\u064E'],
	[111, '\u064F'],
	[112, '\u0650'],
	[113, '\u0651'],
	[114, '\u0652']
]);

// https://encoding.spec.whatwg.org/#error-mode
const decodingError = (mode) => {
	if (mode === 'replacement') {
		return '\uFFFD';
	}
	// Else, `mode == 'fatal'`.
	throw new Error();
};

const encodingError = (mode) => {
	if (mode === 'replacement') {
		return 0xFFFD;
	}
	// Else, `mode == 'fatal'`.
	throw new Error();
};

// https://encoding.spec.whatwg.org/#single-byte-decoder
export const decode = (input, options) => {
	let mode;
	if (options && options.mode) {
		mode = options.mode.toLowerCase();
	}
	// “An error mode […] is either `replacement` (default) or `fatal` for a
	// decoder.”
	if (mode !== 'replacement' && mode !== 'fatal') {
		mode = 'replacement';
	}

	const length = input.length;

	// Support byte strings as input.
	if (typeof input === 'string') {
		const bytes = new Uint16Array(length);
		for (let index = 0; index < length; index++) {
			bytes[index] = input.charCodeAt(index);
		}
		input = bytes;
	}

	const buffer = [];
	for (let index = 0; index < length; index++) {
		const byteValue = input[index];
		// “If `byte` is an ASCII byte, return a code point whose value is
		// `byte`.”
		if (0x00 <= byteValue && byteValue <= 0x7F) {
			buffer.push(stringFromCharCode(byteValue));
			continue;
		}
		// “Let `code point` be the index code point for `byte − 0x80` in index
		// single-byte.”
		const pointer = byteValue - 0x80;
		if (INDEX_BY_POINTER.has(pointer)) {
			// “Return a code point whose value is `code point`.”
			buffer.push(INDEX_BY_POINTER.get(pointer));
		} else {
			// “If `code point` is `null`, return `error`.”
			buffer.push(decodingError(mode));
		}
	}
	const result = buffer.join('');
	return result;
};

// https://encoding.spec.whatwg.org/#single-byte-encoder
export const encode = (input, options) => {
	let mode;
	if (options && options.mode) {
		mode = options.mode.toLowerCase();
	}
	// Support `fatal` (default) and `replacement` error modes.
	if (mode !== 'fatal' && mode !== 'replacement') {
		mode = 'fatal';
	}
	const length = input.length;
	const result = new Uint16Array(length);
	for (let index = 0; index < length; index++) {
		const codePoint = input.charCodeAt(index);
		// “If `code point` is an ASCII code point, return a byte whose
		// value is `code point`.”
		if (0x00 <= codePoint && codePoint <= 0x7F) {
			result[index] = codePoint;
			continue;
		}
		// “Let `pointer` be the index pointer for `code point` in index
		// single-byte.”
		if (INDEX_BY_CODE_POINT.has(codePoint)) {
			const pointer = INDEX_BY_CODE_POINT.get(codePoint);
			// “Return a byte whose value is `pointer + 0x80`.”
			result[index] = pointer + 0x80;
		} else {
			// “If `pointer` is `null`, return `error` with `code point`.”
			result[index] = encodingError(mode);
		}
	}
	return result;
};

export const labels = [
	'arabic',
	'asmo-708',
	'csiso88596e',
	'csiso88596i',
	'csisolatinarabic',
	'ecma-114',
	'iso-8859-6',
	'iso-8859-6-e',
	'iso-8859-6-i',
	'iso-ir-127',
	'iso8859-6',
	'iso88596',
	'iso_8859-6',
	'iso_8859-6:1987'
];
