// lucide-react no longer ships trademarked brand glyphs, so these are
// small inline SVGs kept minimal and monochrome to match the icon buttons.
export function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

export function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.6 7.2s-.21-1.5-.86-2.16c-.82-.87-1.74-.87-2.16-.92C15.6 4 12 4 12 4h-.01s-3.6 0-6.58.12c-.42.05-1.34.05-2.16.92C2.6 5.7 2.4 7.2 2.4 7.2S2.18 8.96 2.18 10.71v1.58c0 1.75.22 3.51.22 3.51s.21 1.5.85 2.16c.83.87 1.91.84 2.39.94 1.74.17 7.36.22 7.36.22s3.6-.01 6.59-.13c.42-.05 1.34-.05 2.16-.92.65-.66.86-2.16.86-2.16s.22-1.75.22-3.51v-1.58c0-1.75-.22-3.51-.22-3.51ZM9.99 14.5v-5.5l5.29 2.76-5.29 2.74Z" />
    </svg>
  );
}
