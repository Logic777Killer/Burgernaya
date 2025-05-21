import { Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from '@store';
import { createOrder } from '../../../services/slices/orders';
import { resetConstructor } from '../../../services/slices/builder';

export const middleware: Middleware = (store: MiddlewareAPI<AppDispatch, RootState>) => (next) => (action) => {
    if (createOrder.fulfilled.match(action)) {
      store.dispatch(resetConstructor());
    }

    next(action);
};
