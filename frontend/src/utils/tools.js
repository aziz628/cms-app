import { useEffect } from "react";

/**
 * getCurrentPage
 * Determines the current page based on the URL path.
 * @returns {string} - The name of the current page or 'not found' if it doesn't match known pages.
 */
export function getCurrentPage() {
  const pages = ['login','classes','schedule','pricing','trainers',"events","gallery","reviews","transformations"];
  const path = window.location.pathname;
  const pathSegments = path.split('/');
  let currentPage = pages.find(page => pathSegments.includes(page));
  if(!currentPage && path === "/") {
    currentPage = 'dashboard';
  }
    //load real port and domain in production
  return currentPage || "'not found' !!";
}

/**
 * useBodyOverflow
 * Locks or unlocks body scroll based on the `locked` parameter.
 * @param {boolean} locked - If true, disables body scroll.
 */
export function useBodyOverflow(locked) {
  useEffect(() => {
    if (locked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [locked]);
}