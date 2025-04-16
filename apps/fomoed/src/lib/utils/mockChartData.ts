export function getChartData() {
	const graphData: any = {
		labels: [],
		data: []
	};

	let last = 0;

	// Fill with random data
	for (let i = 0; i < 100; i++) {
		last = ((last + Math.floor(Math.random() * 1000 * i)) % 500000) + 1000000;

		graphData.labels.push(i.toString());
		graphData.data.push(last);
	}

	return graphData;
}

export function getGreedData() {
	const graphData: any = {
		labels: [],
		data: []
	};

	// Fill with random data
	for (let i = 0; i < 100; i++) {
		const val =
			Math.sin(i) * 10 + 50 + Math.sin(i * 2) * 5 + Math.sin(i * 3) * 15 + Math.sin(i * 4) * 10;

		graphData.labels.push(i.toString());
		graphData.data.push(val);
	}

	return graphData;
}
