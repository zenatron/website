"use client";

import React from "react";
import { LinkItem } from "@/types/types";
import GlassCard from "./GlassCard";
import * as FaIcons from "react-icons/fa";
import { FaBluesky } from "react-icons/fa6";

interface LinkCardProps {
  item: LinkItem;
  viewMode: "grid" | "list";
}

// A mapping from icon names (string) to actual icon components
const iconMap: { [key: string]: React.ElementType } = {
  ...FaIcons,
  FaBluesky,
};

export default function LinkCard({ item, viewMode }: LinkCardProps) {
  let IconComponent: React.ElementType | null = null;
  if (typeof item.icon === "string") {
    IconComponent = iconMap[item.icon] || null;
  } else if (item.icon) {
    IconComponent = item.icon;
  }

  return (
    <GlassCard
      href={item.url}
      external
      className={`h-full w-full transition-all duration-300 ${
        item.featured ? "border-accent/50" : ""
      }`}
      spotlightColor={
        item.featured ? "rgba(108, 22, 222, 0.2)" : "rgba(255, 255, 255, 0.1)"
      }
    >
      <div
        className={`relative z-10 flex h-full w-full items-center transition-all duration-300 ${
          viewMode === "list"
            ? "flex-row gap-4 px-4 py-3"
            : "flex-col justify-center text-center gap-2 p-4"
        }`}
      >
        {IconComponent && (
          <div
            className={`relative ${
              viewMode === "list" ? "flex-shrink-0" : ""
            } mb-0`}
          >
            <IconComponent
              className={`text-accent transition-transform duration-300 group-hover:scale-110 ${
                viewMode === "list" ? "h-8 w-8" : "h-10 w-10"
              }`}
            />
          </div>
        )}
        <div className="relative flex-grow">
          <h3
            className={`font-bold group-hover:text-accent transition-colors ${
              viewMode === "list" ? "text-lg" : "text-md"
            }`}
          >
            {item.title}
          </h3>
          {item.description && (
            <p
              className={`text-muted-text text-sm ${
                viewMode === "list" ? "" : "hidden md:block"
              }`}
            >
              {item.description}
            </p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
