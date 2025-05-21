import { useSelector} from '@store';
import { Preloader } from '@ui';
import { FC, ReactElement } from "react";
import { Navigate, useLocation } from 'react-router-dom';

export type TProtectedRouteProps = {
	onlyUnAuth?: boolean;
	children: ReactElement;
};

export const ProtectedRoute: FC<TProtectedRouteProps> = ({
	onlyUnAuth = false,
	children
}) => {
	const { isAuthChecked, data: user } = useSelector((state) => state.userReducer);
  
	const location = useLocation();
  
	/*if (!isAuthChecked) {
		return <Preloader />;
	}*/
  
	if (onlyUnAuth && user.email && user.name) {
		const { from } = location.state || { from: { pathname: '/' } };
		return <Navigate to={from} />;
	}
  
	if (!onlyUnAuth && (!user.email || !user.name)) {
	  	return <Navigate to='/login' state={{ from: location }} />;
	}
  
	return children;
  };