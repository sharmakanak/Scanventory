import { useEffect, useRef } from 'react';

/**
 * useScrollReveal — lightweight IntersectionObserver hook.
 * Attach the returned ref to any element that has a "reveal",
 * "reveal-left", "reveal-right", or "reveal-scale" class.
 * When the element enters the viewport the hook adds "revealed"
 * to trigger the CSS transition defined in App.css.
 *
 * @param {number} threshold  - 0–1, fraction of element visible before triggering (default 0.12)
 * @param {string} rootMargin - Optional root margin (default "0px 0px -60px 0px")
 */
export function useScrollReveal(threshold = 0.12, rootMargin = '0px 0px -60px 0px') {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('revealed');
                    observer.unobserve(el); // fire once
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold, rootMargin]);

    return ref;
}

/**
 * useScrollRevealChildren — observes every direct child of a container
 * and reveals them with staggered delays using the .stagger-N classes.
 */
export function useScrollRevealChildren(threshold = 0.1) {
    const ref = useRef(null);

    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const children = Array.from(container.children);
        const observers = [];

        children.forEach((child, i) => {
            // Add stagger class if not already present
            if (!child.className.includes('stagger-')) {
                child.classList.add(`stagger-${Math.min(i + 1, 8)}`);
            }

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        child.classList.add('revealed');
                        observer.unobserve(child);
                    }
                },
                { threshold }
            );
            observer.observe(child);
            observers.push(observer);
        });

        return () => observers.forEach((o) => o.disconnect());
    }, [threshold]);

    return ref;
}
