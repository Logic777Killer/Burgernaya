import { combineReducers, configureStore } from '@reduxjs/toolkit';

import {
	TypedUseSelectorHook,
	useDispatch as dispatchHook,
	useSelector as selectorHook,
} from 'react-redux';
import { reducer as ingredientsReducer } from './../slices/ingredients';
import { reducer as ordersReducer } from '../slices/orders';
import { reducer as builderReducer } from '../slices/builder';
import { reducer as feedsReducer } from '../slices/feeds';
import { reducer as userReducer } from '../slices/user';
import { middleware as ordersMiddleware} from '../middlewares/orders';

const rootReducer = combineReducers({
	ingredientsReducer,
	ordersReducer,
	builderReducer,
	feedsReducer,
	userReducer
});

const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(ordersMiddleware),
	devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export const useDispatch: () => AppDispatch = () => dispatchHook();
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;

export default store;
