import React, { createContext, useEffect, useReducer } from 'react';
import userReducer from './userReducer';
import { User } from '../../types';
import { useAuth, useLocalStorage } from '../../hooks';
import { getUser, parseJwt } from '../../utils';
import { userActionTypes } from './types';
import { UNAUTHORIZED } from '../../constants/status';
export interface UserInfoState {
  user: User | null;
  loading: boolean;
}

const initialState : UserInfoState = {
  user: null,
  loading: true,
};

export const userInfoContext = createContext<{
  user: User | null;
  loading: boolean;
  dispatch: React.Dispatch<any>;
}>({
  ...initialState,
  dispatch: () => null,
});

const UserInfoProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const [token, setToken] = useLocalStorage('token');

  const { setIsAuthenticated } = useAuth();

    useEffect(() => {
  if (!token) {
    setIsAuthenticated(false);
    return;
  }

  const info = parseJwt(token);
  const userId = info?.userId;

  if (!userId) {
    setIsAuthenticated(false);
    return;
  }

  getUser(userId, token)
    .then((res) => {
      dispatch({ type: userActionTypes.SET_USER, payload: res });
      dispatch({
        type: userActionTypes.SET_USER_LOADING,
        payload: false,
      });
    })
    .catch((error) => {
      dispatch({
        type: userActionTypes.SET_USER_LOADING,
        payload: false,
      });
      if (error.status === UNAUTHORIZED) {
        setToken(null);
        setIsAuthenticated(false);
      }
      console.log(error);
    });

}, [token, setIsAuthenticated, setToken]);

  return (
    <userInfoContext.Provider
      value={{ user: state.user, loading: state.loading, dispatch }}
    >
      {children}
    </userInfoContext.Provider>
  );
};

export default UserInfoProvider;
