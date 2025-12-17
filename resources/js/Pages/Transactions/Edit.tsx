import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { ArrowLeft, Save, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { FormEvent } from 'react';

interface Category {
    id: number;
    name: string;
    type: 'income' | 'expense';
    icon: string;
    color: string;
}

interface Balance {
    id: number;
    name: string;
    icon: string;
    color: string;
    amount: number;
}

interface Transaction {
    id: number;
    category_id: number;
    balance_id: number | null;
    type: 'income' | 'expense';
    amount: string;
    description: string;
    transaction_date: string;
    category: Category;
    balance: Balance | null;
}

interface Props {
    transaction: Transaction;
    categories: Category[];
    balances: Balance[];
}

export default function Edit({ transaction, categories, balances }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        category_id: transaction.category_id.toString(),
        balance_id: transaction.balance_id?.toString() || '',
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description || '',
        transaction_date: transaction.transaction_date.split('T')[0],
    });

    const filteredCategories = categories.filter((cat) => cat.type === data.type);
    const selectedBalance = balances.find(b => b.id.toString() === data.balance_id);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(route('transactions.update', transaction.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('transactions.index')}>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Transaksi</h1>
                        <p className="text-sky-100 text-sm mt-1">
                            Ubah data transaksi
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Edit Transaksi" />

            <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Form Transaksi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Transaction Type */}
                            <div className="space-y-2">
                                <Label>Tipe Transaksi</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData({ ...data, type: 'income', category_id: '' });
                                        }}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                                            data.type === 'income'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-sky-200 hover:border-sky-300 text-sky-600'
                                        }`}
                                    >
                                        <TrendingUp className="w-5 h-5" />
                                        <span className="font-medium">Pemasukan</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData({ ...data, type: 'expense', category_id: '' });
                                        }}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                                            data.type === 'expense'
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-sky-200 hover:border-sky-300 text-sky-600'
                                        }`}
                                    >
                                        <TrendingDown className="w-5 h-5" />
                                        <span className="font-medium">Pengeluaran</span>
                                    </button>
                                </div>
                            </div>

                            {/* Balance */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Wallet className="w-4 h-4" />
                                    Dompet
                                </Label>
                                <Select
                                    value={data.balance_id}
                                    onValueChange={(value) => setData('balance_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih dompet" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {balances.map((balance) => (
                                            <SelectItem key={balance.id} value={balance.id.toString()}>
                                                <span className="flex items-center gap-2">
                                                    <span>{balance.icon}</span>
                                                    <span>{balance.name}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedBalance && (
                                    <p className="text-xs text-gray-500">
                                        Saldo saat ini: Rp {selectedBalance.amount.toLocaleString('id-ID')}
                                    </p>
                                )}
                                {errors.balance_id && (
                                    <p className="text-sm text-red-500">{errors.balance_id}</p>
                                )}
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label>Kategori</Label>
                                <Select
                                    value={data.category_id}
                                    onValueChange={(value) => setData('category_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredCategories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                <span className="flex items-center gap-2">
                                                    <span>{category.icon}</span>
                                                    <span>{category.name}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.category_id && (
                                    <p className="text-sm text-red-500">{errors.category_id}</p>
                                )}
                            </div>

                            {/* Amount */}
                            <div className="space-y-2">
                                <Label>Jumlah (Rp)</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    min="0"
                                    step="1"
                                />
                                {errors.amount && (
                                    <p className="text-sm text-red-500">{errors.amount}</p>
                                )}
                            </div>

                            {/* Date */}
                            <div className="space-y-2">
                                <Label>Tanggal</Label>
                                <Input
                                    type="date"
                                    value={data.transaction_date}
                                    onChange={(e) => setData('transaction_date', e.target.value)}
                                />
                                {errors.transaction_date && (
                                    <p className="text-sm text-red-500">{errors.transaction_date}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label>Keterangan (Opsional)</Label>
                                <Textarea
                                    placeholder="Tambah keterangan transaksi..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-4">
                                <Link href={route('transactions.index')} className="flex-1">
                                    <Button type="button" variant="outline" className="w-full">
                                        Batal
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1"
                                    variant={data.type === 'income' ? 'success' : 'default'}
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {processing ? 'Menyimpan...' : 'Update'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
