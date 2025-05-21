import { FC, useEffect, useMemo } from 'react';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useDispatch, useSelector } from '@store';
import { fetchOrder } from '../../services/slices/orders';
import { useParams } from 'react-router-dom';

export const OrderInfo: FC = () => {
	/** TODO: взять переменные orderData и ingredients из стора */
	const dispatch = useDispatch();
	const { number } = useParams<{ number: string }>();

	const {isOrderLoading, orderModalData: orderData} = useSelector(store => store.ordersReducer);

	const {isLoading: isIngredientsLoading, data: ingredients} = useSelector(store => store.ingredientsReducer);

	useEffect(() => {
		dispatch(fetchOrder(Number(number)));
	  }, [dispatch]);

	/* Готовим данные для отображения */
	const orderInfo = useMemo(() => {
		if (!orderData || !ingredients.length) return null;

		const date = new Date(orderData.createdAt);

		type TIngredientsWithCount = {
			[key: string]: TIngredient & { count: number };
		};

		const ingredientsInfo = orderData.ingredients.reduce(
			(acc: TIngredientsWithCount, item) => {
				if (!acc[item]) {
					const ingredient = ingredients.find((ing) => ing._id === item);
					if (ingredient) {
						acc[item] = {
							...ingredient,
							count: 1,
						};
					}
				} else {
					acc[item].count++;
				}

				return acc;
			},
			{}
		);

		const total = Object.values(ingredientsInfo).reduce(
			(acc, item) => acc + item.price * item.count,
			0
		);

		return {
			...orderData,
			ingredientsInfo,
			date,
			total,
		};
	}, [orderData, ingredients]);

	if (!orderInfo || isIngredientsLoading || isOrderLoading) {
		return <Preloader />;
	}

	return <OrderInfoUI orderInfo={orderInfo} />;
};
