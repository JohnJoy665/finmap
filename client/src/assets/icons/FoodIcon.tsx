type FoodIconProps = {
  size?: number;
  color?: string;
};

function FoodIcon({ size = 40, color = "#56CCF2" }: FoodIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M8.5 10.5C7.2 10.5 6 11.7 6 13.6C6 16.8 7.8 20 9.7 20C10.4 20 10.8 19.6 11.5 19.6C12.2 19.6 12.6 20 13.3 20C15.2 20 17 16.8 17 13.6C17 11.7 15.8 10.5 14.5 10.5C13.4 10.5 12.7 11.1 11.5 11.1C10.3 11.1 9.6 10.5 8.5 10.5Z"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 10.8C11.5 8.9 12.4 7.6 14 7"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M12.6 8.2C11.4 6.6 9.7 5.8 8 6.2"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M5 16.5C3.6 16.1 2.8 15.2 3.1 14.1C3.5 12.6 5.6 11.9 7.8 12.4"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default FoodIcon;
