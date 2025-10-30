"use client";

import { useState, useEffect } from "react";
import { showSuccess } from "@/utils/toast";

interface UseLocalStorageStateReturn<T> {
  items: T[];
  addItem: (newItem: T) => void;
  editItem: (originalItem: T, updatedItem: T) => void;
  deleteItem: (itemToDelete: T) => void;
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
}

export function useLocalStorageState<T extends { id?: string }>(
  key: string,
  initialValue: T[] = [],
  itemName: string = "item"
): UseLocalStorageStateReturn<T> {
  const [items, setItems] = useState<T[]>(() => {
    if (typeof window !== "undefined") {
      const savedItems = localStorage.getItem(key);
      try {
        return savedItems ? JSON.parse(savedItems) : initialValue;
      } catch (e) {
        console.error(`Failed to parse localStorage item for key "${key}":`, e);
        return initialValue;
      }
    }
    return initialValue;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(items));
    }
  }, [key, items]);

  const addItem = (newItem: T) => {
    setItems((prev) => [...prev, newItem]);
    showSuccess(`${itemName} ajouté avec succès !`);
  };

  const editItem = (originalItem: T, updatedItem: T) => {
    setItems((prev) =>
      prev.map((item) => (item.id === originalItem.id ? updatedItem : item))
    );
    showSuccess(`${itemName} modifié avec succès !`);
  };

  const deleteItem = (itemToDelete: T) => {
    setItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
    showSuccess(`${itemName} supprimé avec succès !`);
  };

  return { items, addItem, editItem, deleteItem, setItems };
}