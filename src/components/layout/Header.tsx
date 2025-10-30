"use client";

import React from "react";
import { useMatches } from "react-router-dom";

interface RouteHandle {
  title?: string;
}

const Header = () => {
  const matches = useMatches();
  const currentMatch = matches[matches.length - 1]; // Get the last match (current route)
  const handle = currentMatch?.handle as RouteHandle | undefined;
  const title = handle?.title || "Bienvenue"; // Default title if not specified

  return (
    <header className="mb-6">
      <h1 className="text-3xl font-bold text-foreground">{title}</h1>
    </header>
  );
};

export default Header;