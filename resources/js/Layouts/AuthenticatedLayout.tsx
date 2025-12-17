import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';
import { LayoutDashboard, ArrowLeftRight, Tags, User, LogOut, Menu, X, Wallet, ArrowRightLeft } from 'lucide-react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-100">
            <nav className="border-b border-sky-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-200">
                                        <Wallet className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent hidden sm:block">
                                        Cashflow
                                    </span>
                                </Link>
                            </div>

                            <div className="hidden space-x-2 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    className="flex items-center gap-2"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    href={route('transactions.index')}
                                    active={route().current('transactions.*')}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeftRight className="w-4 h-4" />
                                    Transaksi
                                </NavLink>
                                <NavLink
                                    href={route('categories.index')}
                                    active={route().current('categories.*')}
                                    className="flex items-center gap-2"
                                >
                                    <Tags className="w-4 h-4" />
                                    Kategori
                                </NavLink>
                                <NavLink
                                    href={route('balances.index')}
                                    active={route().current('balances.*')}
                                    className="flex items-center gap-2"
                                >
                                    <Wallet className="w-4 h-4" />
                                    Dompet
                                </NavLink>
                                <NavLink
                                    href={route('transfers.index')}
                                    active={route().current('transfers.*')}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowRightLeft className="w-4 h-4" />
                                    Transfer
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-xl border-2 border-sky-200 bg-white px-4 py-2 text-sm font-medium leading-4 text-sky-700 transition duration-200 ease-in-out hover:bg-sky-50 hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                                            >
                                                <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center mr-2 shadow">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-xl p-2 text-sky-600 transition duration-150 ease-in-out hover:bg-sky-100 focus:bg-sky-100 focus:outline-none"
                            >
                                {!showingNavigationDropdown ? (
                                    <Menu className="h-6 w-6" />
                                ) : (
                                    <X className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2 px-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            <LayoutDashboard className="w-4 h-4 inline mr-2" />
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('transactions.index')}
                            active={route().current('transactions.*')}
                        >
                            <ArrowLeftRight className="w-4 h-4 inline mr-2" />
                            Transaksi
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('categories.index')}
                            active={route().current('categories.*')}
                        >
                            <Tags className="w-4 h-4 inline mr-2" />
                            Kategori
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('balances.index')}
                            active={route().current('balances.*')}
                        >
                            <Wallet className="w-4 h-4 inline mr-2" />
                            Dompet
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('transfers.index')}
                            active={route().current('transfers.*')}
                        >
                            <ArrowRightLeft className="w-4 h-4 inline mr-2" />
                            Transfer
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-sky-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-sky-900">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-sky-600">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1 px-2">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                <User className="w-4 h-4 inline mr-2" />
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                <LogOut className="w-4 h-4 inline mr-2" />
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 shadow-lg">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="text-white">
                            {header}
                        </div>
                    </div>
                </header>
            )}

            <main className="py-6">{children}</main>
        </div>
    );
}
