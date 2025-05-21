import { FC, useMemo } from 'react';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { useDispatch, useSelector } from '@store';
import { createOrder, resetOrderModalData } from '../../services/slices/orders';
import { useNavigate } from 'react-router-dom';

export const BurgerConstructor: FC = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	/** TODO: взять переменные constructorItems, orderRequest и orderModalData из стора */
	const constructorItems = useSelector(store => store.builderReducer);
	const orderRequest = useSelector(store => store.ordersReducer.orderRequest);
	const { isAuthenticated } = useSelector(store => store.userReducer);

	const orderModalData = useSelector(store => store.ordersReducer.orderModalData);

	const onOrderClick = () => {
		if (!constructorItems.bun || orderRequest) return;
		if (!isAuthenticated) {
			return navigate('/login');
		}
		const data = [
			constructorItems.bun._id,
			...constructorItems.ingredients.map((ingredient) => ingredient._id),
			constructorItems.bun._id
		];
	  
		dispatch(createOrder(data));
	};
	const closeOrderModal = () => {
		dispatch(resetOrderModalData());
	};

	const price = useMemo(
		() =>
			(constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
			constructorItems.ingredients.reduce(
				(s: number, v: TConstructorIngredient) => s + v.price,
				0
			),
		[constructorItems]
	);

	//return null;

	return (
		<BurgerConstructorUI
			price={price}
			orderRequest={orderRequest}
			constructorItems={constructorItems}
			orderModalData={orderModalData}
			onOrderClick={onOrderClick}
			closeOrderModal={closeOrderModal}
		/>
	);
};
