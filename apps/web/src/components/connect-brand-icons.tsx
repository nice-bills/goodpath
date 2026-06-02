/** Brand / UI icons for the connect sheet (inline SVG, no icon font). */

export function GoogleLogoIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function EmailLogoIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M3 7l9 6 9-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WalletLogoIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 8V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="16.5" cy="13" r="1.25" fill="currentColor" />
    </svg>
  );
}

/** MetaMask fox mark (simplified official colors) for wallet row. */
export function MetaMaskLogoIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path fill="#E17726" d="M21.5 4.5 13.2 9.8l1.5-3.5 6.8-1.8Z" />
      <path fill="#E27625" d="M2.5 4.5l8.2 5.3-1.4-3.5L2.5 4.5Z" />
      <path fill="#E27625" d="m18.7 16.8-2.2 3.4-4.5-2.1 4.6-6.3 2.1 4.9Z" />
      <path fill="#E27625" d="m5.3 16.8 2.1-4.9 4.6 6.3-4.5 2.1-2.2-3.4Z" />
      <path fill="#D5BFB2" d="M6.1 11.9 8.4 14.5 6.5 15.8 6.1 11.9Z" />
      <path fill="#D5BFB2" d="m17.9 11.9-2.3 3.9-1.9-1.3 4.2-2.6Z" />
      <path fill="#233447" d="M6.5 15.8 8.4 18.2 6.1 19.5 6.5 15.8Z" />
      <path fill="#233447" d="m17.5 15.8 1.4 3.7-2.3-1.3 1-2.4Z" />
      <path fill="#CC6228" d="M18.7 16.8 17.5 19.5 13 21.6l-1-5.8 6.7-1Z" />
      <path fill="#CC6228" d="M5.3 16.8 7.3 15.8 6 21.6 2.5 19.5 3.3 16.8Z" />
      <path fill="#E27525" d="M7.3 15.8 9.5 13.2 14.5 13.2l2.2 2.6 1 5.8-5.5-3.2-5.4 3.2Z" />
      <path fill="#F5841F" d="M13 9.8 14.5 13.2 9.5 13.2 11 9.8 13 9.8Z" />
      <path fill="#C0AC9D" d="M13 9.8 14.5 6.3 18.7 4.5 13 9.8Z" />
      <path fill="#C0AC9D" d="M11 9.8 5.3 4.5 9.5 6.3 11 9.8Z" />
      <path fill="#763E1A" d="M14.5 13.2 13 21.6 14.5 20.5 18.7 16.8 14.5 13.2Z" />
      <path fill="#763E1A" d="M7.3 15.8 9.5 13.2 5.3 16.8 6 21.6 7.3 15.8Z" />
    </svg>
  );
}
