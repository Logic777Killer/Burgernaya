import { FC, SyntheticEvent, useState } from 'react';
import { RegisterUI } from '@ui-pages';
import { useDispatch, useSelector } from '@store';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/slices/user';

export const Register: FC = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
  
	const { registerError } = useSelector(store => store.userReducer);

	const [userName, setUserName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = async (e: SyntheticEvent) => {
		e.preventDefault();

		try {
			await dispatch(register({ name: userName, email, password })).unwrap();
			navigate('/profile', { replace: true });
		} 
		catch (_) {}
	};

	return (
		<RegisterUI
			errorText={registerError?.message}
			email={email}
			userName={userName}
			password={password}
			setEmail={setEmail}
			setPassword={setPassword}
			setUserName={setUserName}
			handleSubmit={handleSubmit}
		/>
	);
};
