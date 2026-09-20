import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const FAVORITES_STORAGE_KEY = 'servicehub-favorite-services';
const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = (serviceId) => favorites.some((service) => String(service.id) === String(serviceId));

  const toggleFavorite = (service) => {
    setFavorites((current) => {
      const exists = current.some((item) => String(item.id) === String(service.id));
      return exists
        ? current.filter((item) => String(item.id) !== String(service.id))
        : [{ ...service }, ...current];
    });
  };

  const value = useMemo(() => ({ favorites, isFavorite, toggleFavorite }), [favorites]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};
