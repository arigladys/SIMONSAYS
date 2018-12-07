
import createStore from 'pure-store';
//Se crea el store y el estado inicial
const state = {
	appName: 'Simon Says Fuck You',
	user: null
};

export const store = createStore(state);