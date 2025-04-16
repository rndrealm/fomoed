export function commaFormatNumber(val: number) {
	const nf = new Intl.NumberFormat('en-US');
	return nf.format(val);
}
