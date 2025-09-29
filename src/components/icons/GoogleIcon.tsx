import type * as React from "react";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Google icon"
    {...props}
  >
    <title>Google icon</title>
    <g>
      <path
        d="M21.6 12.227c0-.818-.073-1.604-.209-2.364H12v4.482h5.406a4.62 4.62 0 01-2.004 3.034v2.522h3.24c1.895-1.747 2.988-4.32 2.988-7.674z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.43 0 4.47-.805 5.96-2.188l-3.24-2.522c-.9.604-2.05.962-3.32.962-2.554 0-4.724-1.724-5.498-4.04H2.56v2.54A9.997 9.997 0 0012 22z"
        fill="#34A853"
      />
      <path
        d="M6.502 14.212A5.996 5.996 0 016 12c0-.762.136-1.5.376-2.212V7.248H2.56A9.997 9.997 0 002 12c0 1.604.388 3.123 1.06 4.452l3.442-2.24z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.958c1.324 0 2.51.456 3.444 1.35l2.582-2.522C16.47 4.805 14.43 4 12 4A9.997 9.997 0 002.56 7.248l3.442 2.54C7.276 8.682 9.446 6.958 12 6.958z"
        fill="#EA4335"
      />
    </g>
  </svg>
);

export default GoogleIcon;
