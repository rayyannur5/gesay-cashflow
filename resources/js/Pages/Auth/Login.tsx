import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import { Wallet, LogIn } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-sky-100 to-sky-200 p-4">
            <Head title="Log in" />

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 shadow-lg mb-4">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-sky-900">Cashflow App</h1>
                    <p className="text-sky-600 mt-1">Kelola keuangan dengan mudah</p>
                </div>

                <Card className="shadow-xl border-sky-200">
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Selamat Datang!</CardTitle>
                        <CardDescription>
                            Masuk ke akun kamu untuk melanjutkan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {status && (
                            <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-sm font-medium text-emerald-600 border border-emerald-200">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    autoComplete="username"
                                    autoFocus
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="current-password"
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) =>
                                        setData('remember', checked === true)
                                    }
                                />
                                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                                    Ingat saya
                                </Label>
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" className="w-full" disabled={processing}>
                                <LogIn className="w-4 h-4 mr-2" />
                                {processing ? 'Memproses...' : 'Masuk'}
                            </Button>

                            {/* Links */}
                            <div className="flex items-center justify-between text-sm">
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sky-600 hover:text-sky-700 hover:underline"
                                    >
                                        Lupa password?
                                    </Link>
                                )}
                                <Link
                                    href={route('register')}
                                    className="text-sky-600 hover:text-sky-700 hover:underline ml-auto"
                                >
                                    Belum punya akun?
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center text-sky-500 text-sm mt-6">
                    © 2024 Cashflow App. All rights reserved.
                </p>
            </div>
        </div>
    );
}
