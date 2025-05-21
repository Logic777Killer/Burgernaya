import { FC } from 'react';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { useSelector } from '@store';
import { useParams } from 'react-router-dom';

export const IngredientDetails: FC = () => {
	const { id } = useParams<{ id: string }>();

	/** TODO: взять переменную из стора */
	const ingredientData = useSelector(store => store.ingredientsReducer.data.find(ingredient => ingredient._id === id));

	if (!ingredientData) {
		return <Preloader />;
	}

	return <IngredientDetailsUI ingredientData={ingredientData} />;
};
