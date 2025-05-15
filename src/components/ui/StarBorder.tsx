import React from "react";

type StarBorderProps<T extends React.ElementType> =
  React.ComponentPropsWithoutRef<T> & {
    as?: T;
    className?: string;
    children?: React.ReactNode;
    color?: string;
    speed?: React.CSSProperties["animationDuration"];
  };

const StarBorder = <T extends React.ElementType = "button">({
  as,
  className = "",
  color = "white",
  speed = "6s",
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || "button";

  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-[20px] ${className}`}
      {...rest}
    >
      {/* Bottom animation */}
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-0 right-[-250%] rounded-full animate-star-movement-bottom"
        style={
          {
            background: `radial-gradient(circle, ${color} 2%, transparent 8%)`,
            "--speed": speed,
            zIndex: 2,
          } as React.CSSProperties
        }
      ></div>
      {/* Top animation */}
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-0 left-[-250%] rounded-full animate-star-movement-top"
        style={
          {
            background: `radial-gradient(circle, ${color} 2%, transparent 8%)`,
            "--speed": speed,
            zIndex: 2,
          } as React.CSSProperties
        }
      ></div>
      {/* Content container */}
      <div className="relative border border-gray-800/50 rounded-[20px] h-full w-full">
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
