import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Pencil, Trash2, Filter, ArrowLeftRight } from 'lucide-react';
import { useState } from 'react';

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

interface PaginatedData {
    data: Transaction[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Filters {
    [key: string]: string | undefined;
    type?: string;
    start_date?: string;
    end_date?: string;
    category_id?: string;
    balance_id?: string;
}

interface Props {
    transactions: PaginatedData;
    categories: Category[];
    balances: Balance[];
    filters: Filters;
}

export default function Index({ transactions, categories, balances, filters }: Props) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
    const [localFilters, setLocalFilters] = useState<Filters>(filters);

    const handleFilter = () => {
        router.get(route('transactions.index'), localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setLocalFilters({});
        router.get(route('transactions.index'));
    };

    const handleDelete = () => {
        if (transactionToDelete) {
            router.delete(route('transactions.destroy', transactionToDelete.id), {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setTransactionToDelete(null);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Transaksi</h1>
                        <p className="text-sky-100 text-sm mt-1">
                            Kelola semua transaksi pemasukan dan pengeluaran
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
            <Head title="Transaksi" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Filter className="w-5 h-5" />
                            Filter Transaksi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label>Tipe</Label>
                                <Select
                                    value={localFilters.type || 'all'}
                                    onValueChange={(value) =>
                                        setLocalFilters({ ...localFilters, type: value === 'all' ? undefined : value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="income">Pemasukan</SelectItem>
                                        <SelectItem value="expense">Pengeluaran</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Dari Tanggal</Label>
                                <Input
                                    type="date"
                                    value={localFilters.start_date || ''}
                                    onChange={(e) =>
                                        setLocalFilters({ ...localFilters, start_date: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <Label>Sampai Tanggal</Label>
                                <Input
                                    type="date"
                                    value={localFilters.end_date || ''}
                                    onChange={(e) =>
                                        setLocalFilters({ ...localFilters, end_date: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <Label>Kategori</Label>
                                <Select
                                    value={localFilters.category_id || 'all'}
                                    onValueChange={(value) =>
                                        setLocalFilters({ ...localFilters, category_id: value === 'all' ? undefined : value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kategori</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.icon} {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Dompet</Label>
                                <Select
                                    value={localFilters.balance_id || 'all'}
                                    onValueChange={(value) =>
                                        setLocalFilters({ ...localFilters, balance_id: value === 'all' ? undefined : value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Dompet</SelectItem>
                                        {balances.map((balance) => (
                                            <SelectItem key={balance.id} value={balance.id.toString()}>
                                                {balance.icon} {balance.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleFilter}>
                                <Filter className="w-4 h-4 mr-2" />
                                Terapkan Filter
                            </Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Transactions Table */}
                <Card>
                    <CardContent className="p-0">
                        {transactions.data.length > 0 ? (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Dompet</TableHead>
                                            <TableHead>Kategori</TableHead>
                                            <TableHead>Keterangan</TableHead>
                                            <TableHead>Tipe</TableHead>
                                            <TableHead className="text-right">Jumlah</TableHead>
                                            <TableHead className="text-center">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.data.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell className="font-medium">
                                                    {formatDate(transaction.transaction_date)}
                                                </TableCell>
                                                <TableCell>
                                                    {transaction.balance ? (
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
                                                                style={{ backgroundColor: transaction.balance.color + '20' }}
                                                            >
                                                                {transaction.balance.icon}
                                                            </span>
                                                            <span className="text-sm">{transaction.balance.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                                                            style={{ backgroundColor: transaction.category.color + '20' }}
                                                        >
                                                            {transaction.category.icon}
                                                        </span>
                                                        {transaction.category.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {transaction.description || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={transaction.type === 'income' ? 'income' : 'expense'}>
                                                        {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className={`text-right font-bold ${
                                                    transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                                                }`}>
                                                    {transaction.type === 'income' ? '+' : '-'}
                                                    {formatCurrency(parseFloat(transaction.amount))}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link href={route('transactions.edit', transaction.id)}>
                                                            <Button variant="ghost" size="icon">
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setTransactionToDelete(transaction);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {transactions.last_page > 1 && (
                                    <div className="flex items-center justify-between p-4 border-t border-sky-100">
                                        <p className="text-sm text-sky-600">
                                            Menampilkan {transactions.data.length} dari {transactions.total} transaksi
                                        </p>
                                        <div className="flex gap-1">
                                            {transactions.links.map((link, index) => (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url)}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-16 text-sky-400">
                                <ArrowLeftRight className="w-16 h-16 mx-auto mb-4 opacity-50" />
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Transaksi</DialogTitle>
                        <DialogDescription>
                            Apakah kamu yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    {transactionToDelete && (
                        <div className="py-4">
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-50">
                                <span
                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                    style={{ backgroundColor: transactionToDelete.category.color + '20' }}
                                >
                                    {transactionToDelete.category.icon}
                                </span>
                                <div>
                                    <p className="font-medium">{transactionToDelete.category.name}</p>
                                    <p className={`font-bold ${
                                        transactionToDelete.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                                    }`}>
                                        {formatCurrency(parseFloat(transactionToDelete.amount))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
