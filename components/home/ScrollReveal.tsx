'use client';

import { useEffect, useRef } from 'react';

/**
 * Premium scroll-reveal wrapper.
 * - Applies staggered fade-in-up to `[data-reveal]` sections below the fold.
 * - Also discovers `[data-stagger]` containers and applies cascading delays
 *   to their direct children for a cinematic entrance effect.
 * - Content stays visible when JavaScript or IntersectionObserver is unavailable.
 */
export default function ScrollReveal({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current || !('IntersectionObserver' in window)) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches) return;

    const revealElements = root.current.querySelectorAll<HTMLElement>('[data-reveal]');
    const staggerContainers = root.current.querySelectorAll<HTMLElement>('[data-stagger]');

    /* ——— Section-level reveal ——— */
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('reveal-pending');
            sectionObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.85) {
        el.classList.add('reveal-pending');
        sectionObserver.observe(el);
      }
    });

    /* ——— Staggered children reveal ——— */
    const staggerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const container = entry.target as HTMLElement;
            const staggerDelay = parseInt(container.dataset.stagger || '80', 10);
            const children = container.children;
            for (let i = 0; i < children.length; i++) {
              const child = children[i] as HTMLElement;
              child.style.transitionDelay = `${i * staggerDelay}ms`;
              child.classList.remove('stagger-pending');
            }
            staggerObserver.unobserve(container);
          }
        });
      },
      { threshold: 0.1 }
    );

    staggerContainers.forEach((container) => {
      if (container.getBoundingClientRect().top > window.innerHeight * 0.7) {
        const children = container.children;
        for (let i = 0; i < children.length; i++) {
          (children[i] as HTMLElement).classList.add('stagger-pending');
        }
        staggerObserver.observe(container);
      }
    });

    /* ——— Cleanup & a11y ——— */
    const showAll = () => {
      if (preference.matches) {
        sectionObserver.disconnect();
        staggerObserver.disconnect();
        revealElements.forEach((el) => el.classList.remove('reveal-pending'));
        staggerContainers.forEach((container) => {
          const children = container.children;
          for (let i = 0; i < children.length; i++) {
            (children[i] as HTMLElement).classList.remove('stagger-pending');
            (children[i] as HTMLElement).style.transitionDelay = '';
          }
        });
      }
    };

    preference.addEventListener('change', showAll);

    return () => {
      sectionObserver.disconnect();
      staggerObserver.disconnect();
      preference.removeEventListener('change', showAll);
      revealElements.forEach((el) => el.classList.remove('reveal-pending'));
      staggerContainers.forEach((container) => {
        const children = container.children;
        for (let i = 0; i < children.length; i++) {
          (children[i] as HTMLElement).classList.remove('stagger-pending');
          (children[i] as HTMLElement).style.transitionDelay = '';
        }
      });
    };
  }, []);

  return <div ref={root}>{children}</div>;
}
