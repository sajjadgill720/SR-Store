'use client';

import { useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';

function MotionController() {
  const pathname = usePathname();

  useEffect(() => {
    // Respect user's motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let rafId: number | null = null;

    // ------------------------------------------------------------------------
    // 1. Apple-Grade Scroll Reveal via IntersectionObserver
    // ------------------------------------------------------------------------
    const revealSelectors = [
      '.knovera-hero-content',
      '.knovera-featured-box',
      '.knovera-section-header',
      '.knovera-book-card',
      '.knovera-bundle-banner',
      '.sp-praise-card',
      '.knovera-pillar-card',
      '.edition-card',
      '.sp-book-hero-layout',
      '.sp-toc-section',
      '.apple-reveal',
    ];

    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08,
    });

    const initRevealElements = () => {
      const elements = document.querySelectorAll<HTMLElement>(revealSelectors.join(', '));
      
      // Auto-assign stagger indexes to siblings in grids
      const grids = document.querySelectorAll<HTMLElement>(
        '.knovera-books-grid, .sp-praise-grid, .knovera-pillars-grid, .edition-grid'
      );
      grids.forEach((grid) => {
        const children = Array.from(grid.children) as HTMLElement[];
        children.forEach((child, index) => {
          child.style.setProperty('--stagger', String(index));
          child.classList.add('apple-reveal');
        });
      });

      elements.forEach((el) => {
        el.classList.add('apple-reveal');
        // If already in viewport upon mount, reveal immediately with staggered effect
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('is-revealed');
        } else {
          observer.observe(el);
        }
      });
    };

    // ------------------------------------------------------------------------
    // 2. Linear-Style Mouse-Tracking Radial Spotlight & Border Glow
    // ------------------------------------------------------------------------
    const spotlightCards = document.querySelectorAll<HTMLElement>(
      '.knovera-book-card, .knovera-featured-box, .knovera-bundle-banner, .edition-card, .sp-praise-card, .knovera-pillar-card'
    );

    const handlePointerMove = (e: PointerEvent) => {
      const target = e.currentTarget as HTMLElement;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      target.style.setProperty('--mouse-x', `${x}px`);
      target.style.setProperty('--mouse-y', `${y}px`);
      target.style.setProperty('--spotlight-opacity', '1');
    };

    const handlePointerLeave = (e: PointerEvent) => {
      const target = e.currentTarget as HTMLElement;
      if (!target) return;
      target.style.setProperty('--spotlight-opacity', '0');
    };

    spotlightCards.forEach((card) => {
      card.addEventListener('pointermove', handlePointerMove as EventListener);
      card.addEventListener('pointerleave', handlePointerLeave as EventListener);
    });

    // ------------------------------------------------------------------------
    // 3. Apple 3D Perspective Card & Cover Tilt with Specular Glare
    // ------------------------------------------------------------------------
    const tiltCovers = document.querySelectorAll<HTMLElement>(
      '.knovera-card-cover-container, .knovera-featured-cover-wrap, .edition-card-art'
    );

    const handleCoverTilt = (e: MouseEvent) => {
      const container = e.currentTarget as HTMLElement;
      const cover = container.querySelector<HTMLElement>('.edition-cover, .knovera-cover-link');
      if (!cover) return;

      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const rotateY = x * 14; // -7deg to +7deg
      const rotateX = -y * 14;

      cover.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.035, 1.035, 1.035)`;
      cover.style.transition = 'transform 0.1s ease-out';

      // Specular sheen tracking
      const glareX = ((x + 0.5) * 100).toFixed(1);
      const glareY = ((y + 0.5) * 100).toFixed(1);
      cover.style.setProperty('--glare-x', `${glareX}%`);
      cover.style.setProperty('--glare-y', `${glareY}%`);
    };

    const handleCoverReset = (e: MouseEvent) => {
      const container = e.currentTarget as HTMLElement;
      const cover = container.querySelector<HTMLElement>('.edition-cover, .knovera-cover-link');
      if (!cover) return;

      cover.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      cover.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    };

    tiltCovers.forEach((container) => {
      container.addEventListener('mousemove', handleCoverTilt as EventListener);
      container.addEventListener('mouseleave', handleCoverReset as EventListener);
    });

    // ------------------------------------------------------------------------
    // 4. Dynamic Header Elevation on Scroll (Apple Glassmorphism)
    // ------------------------------------------------------------------------
    const header = document.querySelector<HTMLElement>('.studio-header');
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!header) return;
        if (window.scrollY > 20) {
          header.classList.add('header-scrolled');
        } else {
          header.classList.remove('header-scrolled');
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Initialize all observer elements
    initRevealElements();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
      spotlightCards.forEach((card) => {
        card.removeEventListener('pointermove', handlePointerMove as EventListener);
        card.removeEventListener('pointerleave', handlePointerLeave as EventListener);
      });
      tiltCovers.forEach((container) => {
        container.removeEventListener('mousemove', handleCoverTilt as EventListener);
        container.removeEventListener('mouseleave', handleCoverReset as EventListener);
      });
    };
  }, [pathname]);

  return null;
}

export default function MotionProvider() {
  return (
    <Suspense fallback={null}>
      <MotionController />
    </Suspense>
  );
}
