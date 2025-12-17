import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Plus, Edit2, Trash2, Star, Wallet } from 'lucide-react';

interface Balance {
    id: number;
    name: string;
    icon: string;
    color: string;
    amount: number;
    is_default: boolean;
    transactions_count: number;
}

interface Props {
    balances: Balance[];
    totalBalance: number;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

const ICONS = ['💵', '🏦', '📱', '💳', '🪙', '💰', '🔐', '🎯', '🏠', '🚗'];
const COLORS = ['#22C55E', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#6366F1', '#64748B', '#0EA5E9'];

export default function Index({ balances, totalBalance }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingBalance, setEditingBalance] = useState<Balance | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const [form, setForm] = useState({
        name: '',
        icon: '💵',
        color: '#22C55E',
        amount: '',
        is_default: false,
    });

    const resetForm = () => {
        setForm({
            name: '',
            icon: '💵',
            color: '#22C55E',
            amount: '',
            is_default: false,
        });
        setEditingBalance(null);
    };

    const openCreate = () => {
        resetForm();
        setIsOpen(true);
    };

    const openEdit = (balance: Balance) => {
        setEditingBalance(balance);
        setForm({
            name: balance.name,
            icon: balance.icon,
            color: balance.color,
            amount: balance.amount.toString(),
            is_default: balance.is_default,
        });
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            ...form,
            amount: parseFloat(form.amount) || 0,
        };

        if (editingBalance) {
            router.put(route('balances.update', editingBalance.id), data, {
                onSuccess: () => {
                    setIsOpen(false);
                    resetForm();
                },
            });
        } else {
            router.post(route('balances.store'), data, {
                onSuccess: () => {
                    setIsOpen(false);
                    resetForm();
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        router.delete(route('balances.destroy', id), {
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    const handleSetDefault = (balance: Balance) => {
        router.post(route('balances.setDefault', balance.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Dompet</h1>
                        <p className="text-sky-100 text-sm mt-1">
                            Kelola dompet dan rekening kamu
                        </p>
                    </div>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="shadow-lg" onClick={openCreate}>
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Dompet
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingBalance ? 'Edit Dompet' : 'Tambah Dompet Baru'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingBalance
                                        ? 'Update informasi dompet'
                                        : 'Tambahkan dompet atau rekening baru'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Dompet</Label>
                                    <Input
                                        id="name"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Cash, Bank BCA, GoPay..."
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Icon</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {ICONS.map((icon) => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => setForm({ ...form, icon })}
                                                className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${
                                                    form.icon === icon
                                                        ? 'border-sky-500 bg-sky-50'
                                                        : 'border-gray-200 hover:border-sky-300'
                                                }`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Warna</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setForm({ ...form, color })}
                                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                                    form.color === color
                                                        ? 'border-sky-500 scale-110'
                                                        : 'border-transparent'
                                                }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amount">Saldo Awal</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        placeholder="0"
                                        min="0"
                                        step="1000"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit">
                                        {editingBalance ? 'Simpan' : 'Tambah'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            }
        >
            <Head title="Balances" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Total Balance Card */}
                    <Card className="bg-gradient-to-r from-sky-500 to-sky-600 text-white border-0">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <Wallet className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-sky-100 text-sm">Total Saldo</p>
                                    <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Balance List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {balances.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Belum ada balance</p>
                                    <p className="text-sm">Tambahkan dompet atau rekening pertamamu</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Balance</TableHead>
                                            <TableHead className="text-right">Saldo</TableHead>
                                            <TableHead className="text-center">Transaksi</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {balances.map((balance) => (
                                            <TableRow key={balance.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                                            style={{ backgroundColor: `${balance.color}20` }}
                                                        >
                                                            {balance.icon}
                                                        </div>
                                                        <span className="font-medium">{balance.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {formatCurrency(balance.amount)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary">
                                                        {balance.transactions_count} transaksi
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {balance.is_default ? (
                                                        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                                                            <Star className="w-3 h-3 mr-1 fill-yellow-500" />
                                                            Default
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleSetDefault(balance)}
                                                            className="text-gray-500 hover:text-yellow-600"
                                                        >
                                                            <Star className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openEdit(balance)}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        {deleteConfirm === balance.id ? (
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => handleDelete(balance.id)}
                                                                    disabled={balance.transactions_count > 0}
                                                                >
                                                                    Ya
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setDeleteConfirm(null)}
                                                                >
                                                                    Tidak
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setDeleteConfirm(balance.id)}
                                                                disabled={balance.transactions_count > 0}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
