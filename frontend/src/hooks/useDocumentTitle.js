import { useEffect } from "react";

/**
 * Updates the document title based on the active page.
 * @param {string} title 
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    const originalTitle = document.title;
    if (title) {
       document.title = `${title} | OneStack`;
    }
    
    // Cleanup if component unmounts
    return () => {
       document.title = originalTitle;
    };
  }, [title]);
}
