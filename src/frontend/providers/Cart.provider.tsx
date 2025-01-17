/*
 * @Author: Ning Tang
 * @LastEditors: Ning Tang
 * @email: Ning.Tang@daocloud.io
 * @gitlab: https://gitlab.daocloud.cn/ning.tang/dso-ui.git
 * @Date: 2023-03-02 17:19:51
 * @LastEditTime: 2023-03-10 11:20:00
 * @motto: Still water run deep
 * @Description: Modify here please
 * @FilePath: \opentelemetry-demo\src\frontend\providers\Cart.provider.tsx
 */
import { createContext, useCallback, useContext, useMemo } from 'react';
// import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useMutation, useQueryClient } from 'react-query';
import ApiGateway from '../gateways/Api.gateway';
import { CartItem, OrderResult, PlaceOrderRequest } from '../protos/demo';
import { IProductCart } from '../types/Cart';
import { useCurrency } from './Currency.provider';

interface IContext {
  cart: IProductCart;
  addItem(item: CartItem): void;
  emptyCart(): void;
  placeOrder(order: PlaceOrderRequest): Promise<OrderResult>;
}

export const Context = createContext<IContext>({
  cart: { userId: '', items: [] },
  addItem: () => {},
  emptyCart: () => {},
  placeOrder: () => Promise.resolve({} as OrderResult),
});

interface IProps {
  children: React.ReactNode;
}

export const useCart = () => useContext(Context);

const CartProvider = ({ children }: IProps) => {
  const { selectedCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const mutationOptions = useMemo(
    () => ({
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
      },
    }),
    [queryClient]
  );

  // const { data: cart = { userId: '', items: [] } } = useQuery(['cart', selectedCurrency], () =>
  //   ApiGateway.getCart(selectedCurrency)

  // );
  const addCartMutation = useMutation(ApiGateway.addCartItem, mutationOptions);
  const emptyCartMutation = useMutation(ApiGateway.emptyCart, mutationOptions);
  const placeOrderMutation = useMutation(ApiGateway.placeOrder, mutationOptions);
  const addItem = useCallback(
    (item: CartItem) => addCartMutation.mutateAsync({ ...item, currencyCode: selectedCurrency }),
    [addCartMutation, selectedCurrency]
  );
  const emptyCart = useCallback(() => emptyCartMutation.mutateAsync(), [emptyCartMutation]);
  const placeOrder = useCallback(
    (order: PlaceOrderRequest) => placeOrderMutation.mutateAsync({ ...order, currencyCode: selectedCurrency }),
    [placeOrderMutation, selectedCurrency]
  );

  const value = useMemo(
    () => ({ cart: { userId: '', items: [] }, addItem, emptyCart, placeOrder }),
    [addItem, emptyCart, placeOrder]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default CartProvider;
