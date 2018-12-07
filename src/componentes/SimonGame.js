import React, { Component } from 'react';
import { createStore } from 'redux';
import '../styles/SimonGame.css';
const sound1 = new Audio(
	'https://s3.amazonaws.com/freecodecamp/simonSound1.mp3'
);
const sound2 = new Audio(
	'https://s3.amazonaws.com/freecodecamp/simonSound2.mp3'
);
const sound3 = new Audio(
	'https://s3.amazonaws.com/freecodecamp/simonSound3.mp3'
);
const sound4 = new Audio(
	'https://s3.amazonaws.com/freecodecamp/simonSound4.mp3'
);
const soundBoard = [ sound1, sound2, sound3, sound4 ];


function getRandomIntInclusive (min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getSeries () {
	var series = [];
	for (var i = 0; i < 24; i++) {
		series[i] = getRandomIntInclusive(0, 3);
		console.log(series[i]);
	}
	return series;
}

export function lightUp (tile) {
	var toAnimate = document.getElementById('tile' + tile);

	toAnimate.classList.add('anim');

	soundBoard[tile].playbackRate = 0.7;
	soundBoard[tile].play();

	setTimeout(function () {
		toAnimate.classList.remove('anim');
	}, 500);
}

function checkEquality (partialSeries, lengthController, playerInput) {
	console.log(partialSeries[lengthController]);
	//==
	return partialSeries[lengthController] === playerInput[lengthController]
		? true
		: false;
}

const initialStore = {
	series: getSeries(),
	partialSeries: [],
	playerInputs: [],
	strictMode: false,
	turn: '',
	status: 'Beginning',
	clickable: false,
	lightUp: lightUp,
	lengthController: -1
};

function reducer (state = initialStore, { type, payload }) {
	switch (type) {
		case 't.start': {
			return { ...state, status: payload };
		}

		case 't.changeTurn': {
			return { ...state, turn: payload, clickable: true };
		}

		case 't.partialS': {
			return { ...state, partialSeries: payload };
		}

		case 't.updateController': {
			return { ...state, lengthController: payload };
		}

		case 't.setStrict': {
			return { ...state, strictMode: !state.strictMode };
		}

		case 't.restart': {
			return {
				...initialStore,
				series: getSeries(),
				strictMode: state.strictMode
			};
		}

		case 't.updateInputs': {
			state.lengthController++;
			state.playerInputs = [ ...state.playerInputs, payload ];

			var nextTurn = checkEquality(
				state.partialSeries,
				state.lengthController,
				state.playerInputs
			);
			//==
			if (state.partialSeries.length === state.series.length) {
				alert('You Won');
				return { ...initialStore, series: getSeries() };
			}
			//==
			if (state.playerInputs.length === state.partialSeries.length && nextTurn) {
				console.log(payload);
				state.lightUp(payload);
				let incremented = state.series.slice(0, state.playerInputs.length + 1);

				return {
					...state,
					partialSeries: incremented,
					turn: 'PlaySeq',
					playerInputs: []
				};
			}

			if (nextTurn) {
				state.lightUp(payload);
				return { ...state };
			} else if (!state.strictMode) {
				alert('color erroneo, aqui va de nuevo la secuencia');
				return { ...state, turn: 'PlaySeq', playerInputs: [] };
			} else {
				alert('WrongInput, Strict Mode Will Reset Everything');
				return {
					...initialStore,
					series: getSeries(),
					strictMode: state.strictMode
				};
			}
		}

		default:
			return state;
	}
}

function updateInputs (num) {
	return {
		type: 't.updateInputs',
		payload: num
	};
}

function updateController () {
	return {
		type: 't.updateController',
		payload: -1
	};
}

function start () {
	return {
		type: 't.start',
		payload: 'Running'
	};
}

function partialS (arr) {
	return {
		type: 't.partialS',
		payload: arr
	};
}

function changeTurnToPlayer () {
	return {
		type: 't.changeTurn',
		payload: 'player'
	};
}

function toggleStrict () {
	return {
		type: 't.setStrict',
		payload: null
	};
}

function restart () {
	return {
		type: 't.restart',
		payload: null
	};
}

const store = createStore(reducer);

class SimonGame extends Component {
	componentDidMount () {
		this.unsubscribe = store.subscribe(() =>
			this.forceUpdate()
		);
	}

	componentWillUnmount () {
		this.unsubscribe();
	}

	render () {
		let state = store.getState();
		return (
			<div className='simon-container'>
				<div className={'flex-container'}>
					<Color1 name='colors t-l' id='tile0' clickable={state.clickable} />
					<Color2 name='colors t-r' id='tile1' clickable={state.clickable} />
					<Color3 name='colors b-l' id='tile2' clickable={state.clickable} />
					<Color4 name='colors b-r' id='tile3' clickable={state.clickable} />
					<Control
						name='center'
						series={state.series}
						lightUp={state.lightUp}
						turn={state.turn}
						status={state.status}
						partialSeries={state.partialSeries}
						mode={state.strictMode}
					/>
				</div>
			</div>
		);
	}
}

class Control extends Component {
	startGame = () => {
		let first = this.props.series.slice(0, 3);
		this.playSeq(first);

		store.dispatch(start());
		store.dispatch(partialS(first));
	};

	toggle = () => {
		store.dispatch(toggleStrict());
	};

	restart = () => {
		store.dispatch(restart());
	};

	playSeq = (sequence) => {
		let i = 0;
		var interval = setInterval(() => {
			this.props.lightUp(sequence[i]);
			i++;
			if (i >= sequence.length) {
				clearInterval(interval);
				store.dispatch(changeTurnToPlayer());
				store.dispatch(updateController());
			}
		}, 1200);
	};

	render () {
		if (this.props.turn === 'PlaySeq') {
			this.playSeq(this.props.partialSeries);
		}

		return (
			<div className={this.props.name}>
				<h2 style={{ marginTop: 10 }}>Simon Dice</h2>
				<div>
					<h1 className='count' style={{ float: 'left' }}>
						{this.props.partialSeries.length}
					</h1>

					<button
					//!=
						className={
							this.props.status !== 'Beginning' ? (
								'btn btn-danger disabled'
							) : (
								'btn btn-danger  active'
							)
						}
						//==
						onClick={this.props.status === 'Beginning' ? this.startGame : null}
						style={{ float: 'left', marginRight: 6 }}
					>
						{' '}
						COMENZAR{' '}
					</button>
				</div>
				<div>
				</div>
					<br></br>
				<button
					className='btn btn-success'
					id='restart-btn'
					style={{ marginTop: -8 }}
					onClick={this.restart}
				>
					{' '}
					Reiniciar{' '}
				</button>
			</div>
			
		);

	}
}

class Color1 extends Component {
	onClick = () => {
		if (this.props.clickable) {
			console.log('presionaron el color 1');
			store.dispatch(updateInputs(0));
		}
	};

	render () {
		return (
			<div
				className={this.props.name}
				onClick={this.onClick}
				id={this.props.id}
			/>
		);
	}
}
class Color2 extends Component {
	onClick = (item) => {
		if (this.props.clickable) {
			console.log('presionaron el color 2');
			store.dispatch(updateInputs(1));
		}
	};

	render () {
		var item = this.props.item;
		return (
			<div
				className={this.props.name}
				onClick={this.onClick}
				id={this.props.id}
			/>
		);
	}
}
class Color3 extends Component {
	onClick = (item) => {
		if (this.props.clickable) {
			console.log('presionaron el color 3');
			store.dispatch(updateInputs(2));
		}
	};

	render () {
		var item = this.props.item;
		return (
			<div
				className={this.props.name}
				onClick={this.onClick}
				id={this.props.id}
			/>
		);
	}
}
class Color4 extends Component {
	onClick = (item) => {
		if (this.props.clickable) {
			console.log('presionaron el color 4');
			store.dispatch(updateInputs(3));
		}
	};

	render () {
		var item = this.props.item;
		return (
			<div
				className={this.props.name}
				onClick={this.onClick}
				id={this.props.id}
			/>
		);
	}
}

export default SimonGame;
