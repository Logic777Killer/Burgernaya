import { getOrderByNumberApi, getOrdersApi, orderBurgerApi } from "@api";
import { createAsyncThunk, createSlice, SerializedError } from "@reduxjs/toolkit";
import { TOrder } from "@utils-types";


export const fetchOrders = createAsyncThunk(
    'fetch/orders',
    async () => getOrdersApi() 
);

type TNewOrder = {
    order: TOrder;
    name: string;
};

export const createOrder = createAsyncThunk<TNewOrder, string[]>(
    'create/order',
    async (data, { rejectWithValue }) => {
        const response = await orderBurgerApi(data);
        if (!response?.success) {
            return rejectWithValue(response);
        }
        return {
            order: response.order,
            name: response.name
        }
    }
);

export const fetchOrder = createAsyncThunk<TOrder, number>(
    'fetch/order',
    async (data, { rejectWithValue }) => {
        const response = await getOrderByNumberApi(data);
        if (!response?.success) {
            return rejectWithValue(response);
        }
        return response.orders[0];
      }
);

type TOrdersState = {
    isOrderLoading: boolean;
    isOrdersLoading: boolean;
    orderRequest: boolean;
    orderModalData: TOrder | null;
    error: null | SerializedError;
    data: TOrder[];
  };
  
export const initialState: TOrdersState = {
    isOrderLoading: true,
    isOrdersLoading: true,
    orderRequest: false,
    orderModalData: null,
    error: null,
    data: []
};

export const slice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        resetOrderModalData(state) {
            state.orderModalData = null;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchOrder.pending, (state) => {
            state.isOrderLoading = true;
        })
        .addCase(fetchOrder.fulfilled, (state, action) => {
            state.isOrderLoading = false;
            state.orderModalData = action.payload;
        })
        .addCase(fetchOrder.rejected, (state) => {
            state.isOrderLoading = false;
        })
        .addCase(fetchOrders.pending, (state) => {
            state.isOrdersLoading = true;
            state.error = null;
        })
        .addCase(fetchOrders.fulfilled, (state, action) => {
            state.isOrdersLoading = false;
            state.error = null;
            state.data = action.payload;
        })
        .addCase(fetchOrders.rejected, (state, action) => {
            state.isOrdersLoading = false;
            state.error = action.error;
        })
        .addCase(createOrder.pending, (state) => {
            state.orderRequest = true;
        })
        .addCase(createOrder.fulfilled, (state, action) => {
            state.orderRequest = false;
            state.orderModalData = action.payload.order;
        })
        .addCase(createOrder.rejected, (state) => {
            state.orderRequest = false;
        });
    }
});

export const { resetOrderModalData } = slice.actions;
export const reducer = slice.reducer;