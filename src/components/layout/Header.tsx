"use client";

import React from "react";
import { useMatches } from "react-router-dom";
import NotificationCenter from "./NotificationCenter"; // Importez le NotificationCenter

interface RouteHandle {
  title?: string;
}

const Header = () => {
  const matches = useMatches();
  const currentMatch = matches[matches.length - 1]; // Get the last match (current route)
  const handle = currentMatch?.handle as RouteHandle | undefined;
  const title = handle?.title || "Bienvenue"; // Default title if not specified

  return (
    <header className="mb-6 flex justify-between items-center animate-fadeIn"> {/* Ajout de flex et justify-between */}
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
      <NotificationCenter /> {/* Affichez le NotificationCenter ici */}
    </header>
  );
};

export default Header;