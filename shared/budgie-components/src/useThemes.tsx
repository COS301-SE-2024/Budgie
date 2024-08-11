import { useEffect } from 'react';

export const useThemeSettings = (): void => {
  useEffect(() => {
    const applySettings = () => {
      const storedTheme = localStorage.getItem('data-theme') || 'light';
      const storedColourTheme =
        localStorage.getItem('colour-theme') || 'light-blue';
      const storedFontSize =
        localStorage.getItem('font-size-multiplier') || '1';

      document.documentElement.setAttribute('data-theme', storedTheme);
      document.documentElement.setAttribute('colour-theme', storedColourTheme);
      document.documentElement.style.setProperty(
        '--font-size-multiplier',
        storedFontSize
      );
    };

    applySettings();
  }, []);
};
