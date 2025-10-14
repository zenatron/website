"use client";

import React from "react";
import { LinkItem } from "@/types/types";
import * as FaIcons from "react-icons/fa";
import { FaBluesky } from "react-icons/fa6";

interface LinkCardProps {
  item: LinkItem;
}

// A mapping from icon names (string) to actual icon components
const iconMap: { [key: string]: React.ElementType } = {
  ...FaIcons,
  FaBluesky,
};

export default function LinkCard({ item }: LinkCardProps) {
  let IconComponent: React.ElementType | null = null;
  if (typeof item.icon === "string") {
    IconComponent = iconMap[item.icon] || null;
  } else if (item.icon) {
    IconComponent = item.icon;
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex flex-row items-center gap-2.5 px-3 py-2 rounded-lg
        border transition-all duration-200 hover:scale-[1.01] hover:shadow-lg
        ${
          item.featured
            ? "border-accent/40 bg-accent/5 hover:border-accent/60 hover:bg-accent/10"
            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
        }`}
    >
      {IconComponent && (
        <div className="relative flex-shrink-0">
          <IconComponent className="text-accent transition-transform duration-200 group-hover:scale-110 h-5 w-5" />
        </div>
      )}
      <div className="relative flex-grow min-w-0">
        <h3 className="font-semibold group-hover:text-accent transition-colors text-sm leading-tight">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-muted-text text-xs leading-tight mt-0.5 line-clamp-1 opacity-70">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
}
