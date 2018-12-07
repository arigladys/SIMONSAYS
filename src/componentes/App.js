import React, { Component } from 'react';

import SimonGame from './SimonGame';

import '../App.css';

class App extends Component {
	render () {
		return (
			<div>

				<div className='dual'>
					<div className='dual1'>
						<SimonGame/>
					</div>
					<div className='dual2'>
					</div>
				</div>
			</div>
		);
	}
}

export default App;
