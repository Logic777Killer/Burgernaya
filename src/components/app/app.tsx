import {
	ConstructorPage,
	Feed,
	ForgotPassword,
	Login,
	NotFound404,
	Profile,
	ProfileOrders,
	Register,
	ResetPassword,
} from '@pages';
import '../../index.css';
import styles from './app.module.css';

import {
	AppHeader,
	IngredientDetails,
	Modal,
	OrderInfo,
	ProtectedRoute,
} from '@components';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from '@store';
import { fetchIngredients } from '../../services/slices/ingredients';
import { resetOrderModalData } from '../../services/slices/orders';

const App = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const state = location.state as { background?: Location };

	useEffect(() => {
		dispatch(fetchIngredients());
	}, [dispatch]);

	const handleModalClose = () => {
		navigate(-1);
		dispatch(resetOrderModalData());
	};

	return (
		<div className={styles.app}>
			<AppHeader />
			<Routes location={state?.background || location}>
				<Route path='*' element={<NotFound404 />} />
				<Route path='/' element={<ConstructorPage />} />
				<Route path='/feed' element={<Feed />} />
				<Route
					path='/feed/:number'
					element={
						<Modal title='Детали заказа' onClose={handleModalClose}>
							<OrderInfo />
						</Modal>
					}
				/>
				<Route
					path='/ingredients/:id'
					element={
						<Modal title='Детали ингредиента' onClose={handleModalClose}>
							<IngredientDetails />
						</Modal>
					}
				/>
				<Route
					path='/profile/orders/:number'
					element={
						<ProtectedRoute>
							<Modal title='Детали заказа' onClose={handleModalClose}>
								<OrderInfo />
							</Modal>
						</ProtectedRoute>
					}
				/>
				<Route
					path='/login'
					element={
						<ProtectedRoute onlyUnAuth>
							<Login />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/register'
					element={
						<ProtectedRoute onlyUnAuth>
							<Register />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/forgot-password'
					element={
						<ProtectedRoute onlyUnAuth>
							<ForgotPassword />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/reset-password'
					element={
						<ProtectedRoute onlyUnAuth>
							<ResetPassword />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/profile'
					element={
						<ProtectedRoute>
							<Profile />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/profile/orders'
					element={
						<ProtectedRoute>
							<ProfileOrders />
						</ProtectedRoute>
					}
				/>
			</Routes>
			{state?.background && (
			<Routes>
				<Route
				path='/ingredients/:id'
				element={
					<Modal title='Детали ингредиента' onClose={handleModalClose}>
						<IngredientDetails />
					</Modal>
				}
				/>
			</Routes>
			)}
			{state?.background && (
			<Routes>
				<Route
				path='/feed/:number'
				element={
					<Modal title='Детали заказа' onClose={handleModalClose}>
						<OrderInfo />
					</Modal>
				}
				/>
			</Routes>
			)}
			{state?.background && (
			<Routes>
				<Route
				path='/profile/orders/:number'
				element={
					<Modal title='Детали заказа' onClose={handleModalClose}>
						<OrderInfo />
					</Modal>
				}
				/>
			</Routes>
			)}
		</div>
	);
}

export default App;
