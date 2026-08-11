import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Safety net for legacy/native <a href="/internal-route"> links.
 *
 * The application should preferably use Link/NavLink/useNavigate. This guard
 * prevents a full browser reload when an internal same-origin anchor remains
 * in a page that has not yet been migrated.
 *
 * It deliberately ignores downloads, new tabs, modified clicks, hashes,
 * external URLs and API/file endpoints.
 */
export default function SpaNavigationGuard() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (event.defaultPrevented || event.button !== 0) return;
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

            const target = event.target as HTMLElement | null;
            const anchor = target?.closest('a');
            if (!anchor) return;

            if (anchor.hasAttribute('download')) return;
            if (anchor.target && anchor.target !== '_self') return;

            const href = anchor.getAttribute('href');
            if (!href || href.startsWith('#')) return;
            if (/^(mailto:|tel:|javascript:)/i.test(href)) return;

            let url: URL;
            try {
                url = new URL(href, window.location.origin);
            } catch {
                return;
            }

            if (url.origin !== window.location.origin) return;
            if (url.pathname.startsWith('/api/')) return;

            event.preventDefault();

            const next = `${url.pathname}${url.search}${url.hash}`;
            navigate(next);
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [navigate]);

    return null;
}
