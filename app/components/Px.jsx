import React from "react";
import { iconLayers } from "../icons/pixel.js";
export function Px({ name, size = 20, color, className = "" }) {
  const layers = iconLayers(name, color);
  return <svg className={"pxi " + className} viewBox="0 0 12 12" width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
      {layers.map((l, i) => <path key={i} fill={l.fill} d={l.d} />)}
    </svg>;
}
