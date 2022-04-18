<script>
	import _ from "lodash";
	import { slide, fly } from 'svelte/transition';
	import { trunc } from './helpers';

	const casesBaseRatios = [
		{ ratio: [1, 1.5], diameter: [3, 4.5] },
		{ ratio: [1, 2], diameter: [2, 4] },
		{ ratio: [1, 2.5], diameter: [0.6, 1.5] },
		{ ratio: [1, 3], diameter: [1.2, 3.6] },
		{ ratio: [1, 3.5], diameter: [1.8, 6.3] },
		{ ratio: [1, 4], diameter: [0.75, 3] },
		{ ratio: [1, 5], diameter: [0.9, 4.5] },
		{ ratio: [1, 6], diameter: [1.2, 7.2] },
		{ ratio: [1, 8], diameter: [0.8, 6.4] },
		{ ratio: [1, 10], diameter: [0.5, 5] },
	];

	const casesReversedRatios = casesBaseRatios.map((item) => {
		return {
			ratio: [...item.ratio].reverse(),
			diameter: [...item.diameter].reverse(),
		};
	});

	const cases = _.shuffle([...casesBaseRatios, ...casesReversedRatios]);
	const min = 0.1;
	const max = 9;
	let diameter = cases[0].diameter[0];
	let answers = [];
	let page = 'circles';
	let currentCaseIndex = 0;
	let results = [];
	let circleResults = [];
	let squareResults = [];
	let averageX, averageXCircles, averageXSquares;
	let averagePerceivedDiameterNormalizedCircles, averageActualDiameterNormalizedCircles;
	let averagePerceivedDiameterNormalizedSquares, averageActualDiameterNormalizedSquares;

	const increment = () => {
		if (diameter < max) {
			diameter += 0.1;
		}
	};

	const decrement = () => {
		if (diameter > min) {
			diameter -= 0.1;
		}
	};

	const submitGuess = (actualDiameter, isCircle) => {
		answers.push(actualDiameter);
		if (currentCaseIndex < cases.length - 1) {
			document.querySelector(".item.controlled").classList.add("diameter-transition");
			currentCaseIndex++;
			// Set next diameter
			diameter = cases[currentCaseIndex].diameter[0];
			setTimeout(() => {
				document.querySelector(".item.controlled").classList.remove("diameter-transition");
			}, 150);
			
		} else {
			const mappedResults = cases.map((originalCase, index) => {
				const actualDiameter = answers[index];
				const comparisonDiameter = originalCase.diameter[0];
				const perceivedDiameter = originalCase.diameter[1];
				const normalizeFactor = actualDiameter > perceivedDiameter ? actualDiameter : perceivedDiameter;
				let comparisonSurface, actualSurface, perceivedSurface;

				if (isCircle) {
					comparisonSurface = Math.PI * Math.pow((comparisonDiameter / 2), 2);
					perceivedSurface = Math.PI * Math.pow((perceivedDiameter / 2), 2);
					actualSurface = Math.PI * Math.pow((actualDiameter / 2), 2);
				} else {
					comparisonSurface = Math.pow(comparisonDiameter, 2);
					perceivedSurface = Math.pow(perceivedDiameter, 2);
					actualSurface = Math.pow(actualDiameter, 2);
				}

				const actualRatio = actualSurface / comparisonSurface;
				const perceivedRatio = perceivedSurface / comparisonSurface;
				const x = Math.log(actualRatio) / Math.log(perceivedRatio);
				
				return {
					type: isCircle ? 'circle' : 'square',
					actualDiameter: actualDiameter,
					perceivedDiameter: originalCase.diameter,
					actualRatio,
					perceivedRatio,
					actualDiameterNormalized: actualDiameter / normalizeFactor,
					perceivedDiameterNormalized: perceivedDiameter / normalizeFactor,
					actualSurface,
					perceivedSurface,
					x,
				};
			});

			results = [...results, ...mappedResults];

			if (isCircle) {
				circleResults = mappedResults;
				averageXCircles = circleResults.reduce((a, b) => ({ x: a.x + b.x })).x / circleResults.length;
				averagePerceivedDiameterNormalizedCircles = circleResults.reduce((a, b) => ({ perceivedDiameterNormalized: a.perceivedDiameterNormalized + b.perceivedDiameterNormalized })).perceivedDiameterNormalized / circleResults.length;
				averageActualDiameterNormalizedCircles = circleResults.reduce((a, b) => ({ actualDiameterNormalized: a.actualDiameterNormalized + b.actualDiameterNormalized })).actualDiameterNormalized / circleResults.length;
				currentCaseIndex = 0;
				diameter = cases[currentCaseIndex].diameter[0];
				answers = [];
				page = '';
				setTimeout(() => {
					page = 'squares';
				}, 500);
			} else {
				squareResults = mappedResults;
				averageXSquares = squareResults.reduce((a, b) => ({ x: a.x + b.x })).x / squareResults.length;
				averagePerceivedDiameterNormalizedSquares = squareResults.reduce((a, b) => ({ perceivedDiameterNormalized: a.perceivedDiameterNormalized + b.perceivedDiameterNormalized })).perceivedDiameterNormalized / circleResults.length;
				averageActualDiameterNormalizedSquares = squareResults.reduce((a, b) => ({ actualDiameterNormalized: a.actualDiameterNormalized + b.actualDiameterNormalized })).actualDiameterNormalized / circleResults.length;
				averageX = results.reduce((a, b) => ({ x: a.x + b.x })).x / results.length;
				page = 'result';
			}
		}
	};

	

	document.addEventListener("keydown", (e) => {
		if ((e.code === "KeyK") | (e.code === "ArrowDown") | (e.code === "ArrowLeft")) decrement();
		if ((e.code === "KeyL") | (e.code === "ArrowUp") | (e.code === "ArrowRight")) increment();
		if (page === 'circles' && e.code === "Enter") submitGuess(diameter, true);
		if (page === 'squares' && e.code === "Enter") submitGuess(diameter);
	});

</script>

<main>

	{#if page === 'circles'}
		<div class="home" out:fly>
			<h1>Visualization: Übung 1</h1>
			<p>Nutze den Slider oder die Pfeiltasten um die Größe des rechten Kreises anzupassen bis er dem angezeigten Verhältnis entspricht.</p>

			<div class="stage">
				<div
					class="item circle diameter-transition"
					style="width: {cases[currentCaseIndex].diameter[0] * 5}vw; height: {cases[currentCaseIndex].diameter[0] * 5}vw"
				>
					{cases[currentCaseIndex].ratio[0]}
				</div>
				<span>:</span>
				<div class="item circle controlled" style="width: {diameter * 5}vw; height: {diameter * 5}vw">
					{cases[currentCaseIndex].ratio[1]}
				</div>
			</div>

			<div class="controls">
				<button on:click={decrement}>{'<'}</button>
				<input type="range" {min} {max} bind:value={diameter} step="0.1" />
				<button on:click={increment}>{'>'}</button>
			</div>
			<div class="controls">
				<button on:click={submitGuess(diameter, true)}>Submit</button>
			</div>
		</div>
	{/if}


	{#if page === 'squares'}
		<div class="home" out:fly>
			<h1>Visualization: Übung 1</h1>
			<p>Nutze den Slider oder die Pfeiltasten um die Größe des rechten Quadrats anzupassen bis er dem angezeigten Verhältnis entspricht.</p>

			<div class="stage">
				<div
					class="item square diameter-transition"
					style="width: {cases[currentCaseIndex].diameter[0] * 5}vw; height: {cases[currentCaseIndex].diameter[0] * 5}vw"
				>
					{cases[currentCaseIndex].ratio[0]}
				</div>
				<span>:</span>
				<div class="item square controlled" style="width: {diameter * 5}vw; height: {diameter * 5}vw">
					{cases[currentCaseIndex].ratio[1]}
				</div>
			</div>

			<div class="controls">
				<button on:click={decrement}>{'<'}</button>
				<input type="range" {min} {max} bind:value={diameter} step="0.1" />
				<button on:click={increment}>{'>'}</button>
			</div>
			<div class="controls">
				<button on:click={submitGuess(diameter)}>Submit</button>
			</div>
		</div>
	{/if}


	{#if page === 'result'}
		<div class="result" in:slide>
			<h1>Dein Ergebnis</h1>
			<p>
				Die subjektive Wahrnehmung der Größe einer Form ist entspricht meist nicht deren tatsächlichen Flächeninhalt.
				Über die Formel (wahrgenommenes Größenverhältnis) = (tatsächliches Verhältnis der Flächeninhalte)<sup>x</sup>, kann ein Wert "X" ermittelt werden, der diese subjektive Abweichung beschreibt.
			</p>
			<p class="legend">
				<br><span class="legend-item"></span> Tatsächliche Fläche<span class="legend-item perceived"></span> Empfundene Fläche
			</p>
			<h2>Dein X: <br><span class="average-x">{trunc(averageX, 4)}</span></h2>
			<div class="result-averages">
				<div class="averages-wrapper">
					<div class="item circle result" style="width: {averageActualDiameterNormalizedCircles * 15}vw; height: {averageActualDiameterNormalizedCircles * 15}vw; z-index: {averageActualDiameterNormalizedCircles < averagePerceivedDiameterNormalizedCircles ? '100' : '1'}">
						<span>{trunc(averageXCircles, 2)}</span>
					</div>
					<div class="item circle result perceived" style="width: {averagePerceivedDiameterNormalizedCircles * 15}vw; height: {averagePerceivedDiameterNormalizedCircles * 15}vw; z-index: {averagePerceivedDiameterNormalizedCircles < averageActualDiameterNormalizedCircles ? '100' : '1'}">
						<span>{trunc(averageXCircles, 2)}</span>
					</div>	
				</div>
				<div class="averages-wrapper">
					<div class="item square result" style="width: {averageActualDiameterNormalizedSquares * 15}vw; height: {averageActualDiameterNormalizedSquares * 15}vw; z-index: {averageActualDiameterNormalizedSquares < averagePerceivedDiameterNormalizedSquares ? '100' : '1'}">
						<span>{trunc(averageXSquares, 2)}</span>
					</div>
					<div class="item square result perceived" style="width: {averagePerceivedDiameterNormalizedSquares * 15}vw; height: {averagePerceivedDiameterNormalizedSquares * 15}vw; z-index: {averagePerceivedDiameterNormalizedSquares < averageActualDiameterNormalizedSquares ? '100' : '1'}">
						<span>{trunc(averageXSquares, 2)}</span>
					</div>	
				</div>
			</div>
			<h3>Deine Schätzungen bei Kreisen:</h3>
			<div class="show-results">
				{#each circleResults as result, i}
				<div class="result-wrapper">
					<div class="item circle result" style="width: {result.actualDiameterNormalized * 6}vw; height: {result.actualDiameterNormalized * 6}vw; z-index: {result.actualDiameterNormalized < result.perceivedDiameterNormalized ? '100' : '1'}"></div>
					<div class="item circle result perceived" style="width: {result.perceivedDiameterNormalized * 6}vw; height: {result.perceivedDiameterNormalized * 6}vw; z-index: {result.actualDiameterNormalized < result.perceivedDiameterNormalized ? '1' : '100'}"></div>	
				</div>
				{/each}
			</div>
			
			<h3>Deine Schätzungen bei Quadraten:</h3>
			<div class="show-results">
				{#each squareResults as result, i}
				<div class="result-wrapper">
					<div class="item square result" style="width: {result.actualDiameterNormalized * 6}vw; height: {result.actualDiameterNormalized * 6}vw; z-index: {result.actualDiameterNormalized < result.perceivedDiameterNormalized ? '100' : '1'}"></div>
					<div class="item square result perceived" style="width: {result.perceivedDiameterNormalized * 6}vw; height: {result.perceivedDiameterNormalized * 6}vw; z-index: {result.actualDiameterNormalized < result.perceivedDiameterNormalized ? '1' : '100'}"></div>
				</div>
				{/each}
			</div>

		</div>
	{/if}
</main>

<style>
	* {
		box-sizing: border-box;
	}

	html, body, main {
		width: 100%;
		height: 100%;
	}

	h1 {
		text-align: center;
	}

	.result h2 {
		text-align: center;
		margin-top: 3rem;
	}

	p {
		max-width: 500px;
		color: rgb(150, 150, 150);
		font-size: .9rem;
		margin: 0 auto;
		line-height: 1.2;
	}

	.home {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
		display: flex;
		justify-content: center;
		flex-direction: column;
		height: 100%;
	}

	.result {
		padding: 1em;
		max-width: 800px;
		margin: 0 auto;
	}

	span {
		font-size: 2rem;
	}

	.average-x {
		font-size: 5rem;
	}

	.controls {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.stage {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.item {
		margin-right: 4vh;
		background: rgb(134, 154, 225);
		font-weight: 600;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.2rem;
		position: relative;
	}

	.circle {
		border-radius: 50%;
	}

	.item.result {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate3d(-50%, -50%, 0);
	}

	.item.result.perceived {
		background: rgb(253, 162, 162);
	}

	.result-wrapper {
		position: relative;
		min-width: 8vw;
		min-height: 8vw;
	}

	.result-averages {
		display: flex;
		justify-content: center;
	}

	.averages-wrapper {
		position: relative;
		min-width: 16vw;
		min-height: 16vw;
		margin-bottom: 2rem;
	}

	.averages-wrapper span {
		font-size: 1.25rem;
	}

	.show-results {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
	}

	.item.controlled {
		margin-left: 4vh;
	}

	.diameter-transition {
		transition: width 150ms ease-in, height 150ms ease-in;
	}

	.legend {
		line-height: 1.5;
	}
	
	.legend-item {		
		width: 0.8rem;
		height: 0.8rem;
		display: inline-block;
		line-height: 3;
		background: rgb(134, 154, 225);
	}

	.legend-item.perceived {
		background: rgb(253, 162, 162);
		margin-left: 1rem;
	}

	button {
		background: transparent;
		border: 1px solid #aaa;
		border-radius: 5px;
		min-width: 40px;
		height: 40px;
		padding: 7px;
		text-align: center;
		display: flex;
		justify-content: center;
		font-size: 0.9rem;
		opacity: 0.5;
		margin: 0.3rem;
		cursor: pointer;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
