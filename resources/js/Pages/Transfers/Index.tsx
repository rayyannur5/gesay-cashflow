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
import { Textarea } from '@/Components/ui/textarea';
import { Plus, ArrowRightLeft, Trash2, ArrowRight } from 'lucide-react';

interface Balance {
    id: number;
    name: string;
    icon: string;
    color: string;
    amount: number;
}

interface Transfer {
    id: number;
    from_balance_id: number;
    to_balance_id: number;
    amount: number;
    description: string | null;
    transfer_date: string;
    from_balance: Balance;
    to_balance: Balance;
}

interface PaginatedTransfers {
    data: Transfer[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    transfers: PaginatedTransfers;
    balances: Balance[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export default function Index({ transfers, balances }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const [form, setForm] = useState({
        from_balance_id: '',
        to_balance_id: '',
        amount: '',
        description: '',
        transfer_date: new Date().toISOString().split('T')[0],
    });

    const resetForm = () => {
        setForm({
            from_balance_id: '',
            to_balance_id: '',
            amount: '',
            description: '',
            transfer_date: new Date().toISOString().split('T')[0],
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        router.post(route('transfers.store'), {
            ...form,
            amount: parseFloat(form.amount) || 0,
        }, {
            onSuccess: () => {
                setIsOpen(false);
                resetForm();
            },
        });
    };

    const handleDelete = (id: number) => {
        router.delete(route('transfers.destroy', id), {
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    const selectedFromBalance = balances.find(b => b.id.toString() === form.from_balance_id);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Transfer</h1>
                        <p className="text-sky-100 text-sm mt-1">
                            Pindahkan saldo antar dompet
                        </p>
                    </div>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="shadow-lg" onClick={() => { resetForm(); setIsOpen(true); }}>
                                <Plus className="w-4 h-4 mr-2" />
                                Transfer Baru
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Transfer Baru</DialogTitle>
                                <DialogDescription>
                                    Pindahkan saldo antar dompet
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end">
                                    <div className="space-y-2">
                                        <Label>Dari</Label>
                                        <Select
                                            value={form.from_balance_id}
                                            onValueChange={(value) => setForm({ ...form, from_balance_id: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih balance" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {balances.map((balance) => (
                                                    <SelectItem
                                                        key={balance.id}
                                                        value={balance.id.toString()}
                                                        disabled={balance.id.toString() === form.to_balance_id}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <span>{balance.icon}</span>
                                                            <span>{balance.name}</span>
                                                            <span className="text-gray-400 text-xs">
                                                                ({formatCurrency(balance.amount)})
                                                            </span>
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="pb-2">
                                        <ArrowRight className="w-5 h-5 text-gray-400" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Ke</Label>
                                        <Select
                                            value={form.to_balance_id}
                                            onValueChange={(value) => setForm({ ...form, to_balance_id: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih balance" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {balances.map((balance) => (
                                                    <SelectItem
                                                        key={balance.id}
                                                        value={balance.id.toString()}
                                                        disabled={balance.id.toString() === form.from_balance_id}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <span>{balance.icon}</span>
                                                            <span>{balance.name}</span>
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amount">Jumlah</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        placeholder="0"
                                        min="1"
                                        max={selectedFromBalance?.amount || undefined}
                                        required
                                    />
                                    {selectedFromBalance && (
                                        <p className="text-xs text-gray-500">
                                            Saldo tersedia: {formatCurrency(selectedFromBalance.amount)}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="transfer_date">Tanggal</Label>
                                    <Input
                                        id="transfer_date"
                                        type="date"
                                        value={form.transfer_date}
                                        onChange={(e) => setForm({ ...form, transfer_date: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Keterangan (opsional)</Label>
                                    <Textarea
                                        id="description"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="Catatan transfer..."
                                        rows={2}
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
                                        Transfer
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            }
        >
            <Head title="Transfers" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Transfer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {transfers.data.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <ArrowRightLeft className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Belum ada transfer</p>
                                    <p className="text-sm">Transfer antar balance akan muncul di sini</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Dari</TableHead>
                                            <TableHead></TableHead>
                                            <TableHead>Ke</TableHead>
                                            <TableHead className="text-right">Jumlah</TableHead>
                                            <TableHead>Keterangan</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transfers.data.map((transfer) => (
                                            <TableRow key={transfer.id}>
                                                <TableCell className="text-gray-500">
                                                    {formatDate(transfer.transfer_date)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                            style={{ backgroundColor: `${transfer.from_balance.color}20` }}
                                                        >
                                                            {transfer.from_balance.icon}
                                                        </span>
                                                        <span>{transfer.from_balance.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                            style={{ backgroundColor: `${transfer.to_balance.color}20` }}
                                                        >
                                                            {transfer.to_balance.icon}
                                                        </span>
                                                        <span>{transfer.to_balance.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {formatCurrency(transfer.amount)}
                                                </TableCell>
                                                <TableCell className="text-gray-500 max-w-[200px] truncate">
                                                    {transfer.description || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {deleteConfirm === transfer.id ? (
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDelete(transfer.id)}
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
                                                            onClick={() => setDeleteConfirm(transfer.id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}

                            {/* Pagination */}
                            {transfers.last_page > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    {Array.from({ length: transfers.last_page }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={page === transfers.current_page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => router.get(route('transfers.index', { page }))}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
