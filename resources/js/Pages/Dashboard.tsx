import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Plus, ArrowRight } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    type: 'income' | 'expense';
    icon: string;
    color: string;
}

interface Transaction {
    id: number;
    category_id: number;
    type: 'income' | 'expense';
    amount: string;
    description: string;
    transaction_date: string;
    category: Category;
}

interface ChartData {
    [key: string]: string | number;
    name: string;
    value: number;
    color: string;
    icon: string;
}

interface DashboardProps {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    recentTransactions: Transaction[];
    expenseByCategory: ChartData[];
    incomeByCategory: ChartData[];
    currentMonth: number;
    currentYear: number;
}

export default function Dashboard({
    totalIncome,
    totalExpense,
    balance,
    recentTransactions,
    expenseByCategory,
    incomeByCategory,
    currentMonth,
    currentYear,
}: DashboardProps) {
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p className="text-sky-100 text-sm mt-1">
                            Ringkasan keuangan {monthNames[currentMonth - 1]} {currentYear}
                        </p>
                    </div>
                    <Link href={route('transactions.create')}>
                        <Button className="shadow-lg">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Transaksi
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Balance Card */}
                    <Card className="bg-gradient-to-br from-sky-500 to-sky-700 text-white border-0">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sky-100 text-sm font-medium flex items-center gap-2">
                                <Wallet className="w-4 h-4" />
                                Saldo
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-white' : 'text-red-200'}`}>
                                {formatCurrency(balance)}
                            </p>
                            <p className="text-sky-200 text-sm mt-2">
                                Selisih pemasukan dan pengeluaran
                            </p>
                        </CardContent>
                    </Card>

                    {/* Income Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sky-600 text-sm font-medium flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                                </div>
                                Pemasukan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-emerald-600">
                                {formatCurrency(totalIncome)}
                            </p>
                            <p className="text-sky-500 text-sm mt-2">
                                Total pemasukan bulan ini
                            </p>
                        </CardContent>
                    </Card>

                    {/* Expense Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sky-600 text-sm font-medium flex items-center gap-2">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                </div>
                                Pengeluaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-red-600">
                                {formatCurrency(totalExpense)}
                            </p>
                            <p className="text-sky-500 text-sm mt-2">
                                Total pengeluaran bulan ini
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts and Recent Transactions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Expense Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingDown className="w-5 h-5 text-red-500" />
                                Pengeluaran per Kategori
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {expenseByCategory.length > 0 ? (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={expenseByCategory}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {expenseByCategory.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => formatCurrency(Number(value) || 0)}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '2px solid #e0f2fe',
                                                    borderRadius: '12px',
                                                }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-sky-400">
                                    <div className="text-center">
                                        <TrendingDown className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Belum ada data pengeluaran</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Income Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                                Pemasukan per Kategori
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {incomeByCategory.length > 0 ? (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={incomeByCategory}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={2}
                                                dataKey="value"
                                            >
                                                {incomeByCategory.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => formatCurrency(Number(value) || 0)}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '2px solid #e0f2fe',
                                                    borderRadius: '12px',
                                                }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-sky-400">
                                    <div className="text-center">
                                        <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Belum ada data pemasukan</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Transaksi Terbaru</CardTitle>
                            <Link href={route('transactions.index')}>
                                <Button variant="ghost" size="sm" className="text-sky-600">
                                    Lihat Semua
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentTransactions.length > 0 ? (
                            <div className="space-y-4">
                                {recentTransactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-sky-50/50 to-transparent hover:from-sky-100/50 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md"
                                                style={{ backgroundColor: transaction.category.color + '20' }}
                                            >
                                                {transaction.category.icon}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sky-900">
                                                    {transaction.category.name}
                                                </p>
                                                <p className="text-sm text-sky-500">
                                                    {transaction.description || 'Tidak ada keterangan'}
                                                </p>
                                                <p className="text-xs text-sky-400 mt-1">
                                                    {formatDate(transaction.transaction_date)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-lg ${
                                                transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                                            }`}>
                                                {transaction.type === 'income' ? '+' : '-'}
                                                {formatCurrency(parseFloat(transaction.amount))}
                                            </p>
                                            <Badge variant={transaction.type === 'income' ? 'income' : 'expense'}>
                                                {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-sky-400">
                                <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">Belum ada transaksi</p>
                                <p className="text-sm mt-1">Mulai catat transaksi pertama kamu!</p>
                                <Link href={route('transactions.create')} className="inline-block mt-4">
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Tambah Transaksi
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
