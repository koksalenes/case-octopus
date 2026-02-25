'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';

import { initAuth } from '@/features/auth/store/authSlice';
import { store } from '@/store';
import { useAppDispatch } from '@/store/hooks';

function AuthInit({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  return children;
}

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <AuthInit>{children}</AuthInit>
    </Provider>
  );
}
