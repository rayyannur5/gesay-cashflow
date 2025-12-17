import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-3 pt-1 text-sm font-medium leading-5 transition duration-200 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-sky-500 text-sky-700 focus:border-sky-600'
                    : 'border-transparent text-sky-600 hover:border-sky-300 hover:text-sky-700 focus:border-sky-300 focus:text-sky-700') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
