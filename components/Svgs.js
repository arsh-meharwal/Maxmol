import {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Polyline,
  Rect,
  Stop,
  Svg,
} from "react-native-svg";

export const Cart = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-shopping-cart"
    >
      <Circle cx="8" cy="21" r="1" />
      <Circle cx="19" cy="21" r="1" />
      <Path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </Svg>
  );
};

export const Heart = ({ fill, outline, stroke }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill={fill}
      stroke={outline}
      strokeWidth={stroke}
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-heart"
    >
      <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </Svg>
  );
};

export const AddProduct = ({ height, width, color }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    class="lucide lucide-square-plus"
  >
    <Rect width="18" height="18" x="3" y="3" rx="2" />
    <Path d="M8 12h8" />
    <Path d="M12 8v8" />
  </Svg>
);

export const ViewProduct = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      class="lucide lucide-package-search"
    >
      <Path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
      <Path d="m7.5 4.27 9 5.15" />
      <Polygon points="3.29 7 12 12 20.71 7" />
      <Line x1="12" x2="12" y1="22" y2="12" />
      <Circle cx="18.5" cy="15.5" r="2.5" />
      <Path d="M20.27 17.27 22 19" />
    </Svg>
  );
};

export const Orders = ({ height, width, color }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-list-ordered"
  >
    <Line x1="10" x2="21" y1="6" y2="6" />
    <Line x1="10" x2="21" y1="12" y2="12" />
    <Line x1="10" x2="21" y1="18" y2="18" />
    <Path d="M4 6h1v4" />
    <Path d="M4 10h2" />
    <Path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
  </Svg>
);

export const Users = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-users"
    >
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
};

export const Down = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-arrow-down"
    >
      <Path d="M12 5v14" />
      <Path d="m19 12-7 7-7-7" />
    </Svg>
  );
};

export const DeleteButton = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-trash-2"
    >
      <Path d="M3 6h18" />
      <Path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <Path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <Line x1="10" x2="10" y1="11" y2="17" />
      <Line x1="14" x2="14" y1="11" y2="17" />
    </Svg>
  );
};

export const Plus = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-plus"
    >
      <Path d="M5 12h14" />
      <Path d="M12 5v14" />
    </Svg>
  );
};

export const Minus = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-minus"
    >
      <Path d="M5 12h14" />
    </Svg>
  );
};

export const UpArrow = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-chevron-up"
    >
      <Path d="m18 15-6-6-6 6" />
    </Svg>
  );
};

export const DownArrow = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-chevron-down"
    >
      <Path d="m6 9 6 6 6-6" />
    </Svg>
  );
};

export const ArrowUp = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-arrow-up-right"
    >
      <Path d="M7 7h10v10" />
      <Path d="M7 17 17 7" />
    </Svg>
  );
};

export const Cross = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-x"
    >
      <Path d="M18 6 6 18" />
      <Path d="m6 6 12 12" />
    </Svg>
  );
};

export const Setting = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-settings"
    >
      <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <Circle cx="12" cy="12" r="3" />
    </Svg>
  );
};

export const Pencil = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-pencil"
    >
      <Path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <Path d="m15 5 4 4" />
    </Svg>
  );
};

export const ShareIcon = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-share-2"
    >
      <Circle cx="18" cy="5" r="3" />
      <Circle cx="6" cy="12" r="3" />
      <Circle cx="18" cy="19" r="3" />
      <Line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <Line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </Svg>
  );
};

export const Star = ({ height, width, fillPercentage }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="gray"
      strokeWidth="1"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-star"
    >
      <Defs>
        <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          {/* This stops define the percentage of the fill */}
          <Stop offset={fillPercentage} stopColor="green" stopOpacity="1" />
          <Stop offset={fillPercentage} stopColor="white" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Polyline
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill="url(#grad)" // This applies the gradient fill
        stroke="gray"
      />
    </Svg>
  );
};

export const BannerSvg = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.1"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-gallery-thumbnails"
    >
      <Rect width="18" height="14" x="3" y="3" rx="2" />
      <Path d="M4 21h1" />
      <Path d="M9 21h1" />
      <Path d="M14 21h1" />
      <Path d="M19 21h1" />
    </Svg>
  );
};

export const Copy = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-copy"
    >
      <Rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <Path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </Svg>
  );
};

export const Delivered = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-package-open"
    >
      <Path d="M12 22v-9" />
      <Path d="M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z" />
      <Path d="M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13" />
      <Path d="M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z" />
    </Svg>
  );
};

export const CancelledOrders = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#404040"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-circle-x"
    >
      <Circle cx="12" cy="12" r="10" />
      <Path d="m15 9-6 6" />
      <Path d="m9 9 6 6" />
    </Svg>
  );
};

export const Replace = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-repeat"
    >
      <Path d="m17 2 4 4-4 4" />
      <Path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <Path d="m7 22-4-4 4-4" />
      <Path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </Svg>
  );
};

export const Truck = ({ height, width, color, fill }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-truck"
    >
      <Path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <Path d="M15 18H9" />
      <Path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <Circle cx="17" cy="18" r="2" />
      <Circle cx="7" cy="18" r="2" />
    </Svg>
  );
};

export const OpenEye = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-eye"
    >
      <Path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <Circle cx="12" cy="12" r="3" />
    </Svg>
  );
};

export const CloseEye = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-eye-off"
    >
      <Path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <Path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <Path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <Path d="m2 2 20 20" />
    </Svg>
  );
};

export const Forward = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-chevron-right"
    >
      <Path d="m9 18 6-6-6-6" />
    </Svg>
  );
};
export const Back = ({ height, width, color }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-chevron-left"
    >
      <Path d="m15 18-6-6 6-6" />
    </Svg>
  );
};
