import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start rounded-xl border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-sky-500 bg-sky-50 text-sky-700 focus:border-sky-600 focus:bg-sky-100 focus:text-sky-800'
                    : 'border-transparent text-sky-600 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 focus:border-sky-300 focus:bg-sky-50 focus:text-sky-700'
            } text-base font-medium transition duration-200 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
