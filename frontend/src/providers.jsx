import { useEffect } from "react";
import { useThemeStore } from "./store/themeStore";

export default function Providers({ children }) {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return children;
}
