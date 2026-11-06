/**
 * Inline blocking script to apply `.dark` before paint (reduces FOUC).
 * Matches next-themes storage key `theme` and system preference.
 */
export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var dark=t==='dark'||((t==null||t===''||t==='system')&&d);if(dark){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.style.colorScheme='light';}}catch(e){}})();`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: code }}
      suppressHydrationWarning
    />
  );
}
