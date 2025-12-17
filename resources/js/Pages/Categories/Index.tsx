import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Plus, Pencil, Trash2, Tags, TrendingUp, TrendingDown } from 'lucide-react';
import { useState, FormEvent } from 'react';

interface Category {
    id: number;
    name: string;
    type: 'income' | 'expense';
    icon: string;
    color: string;
    transactions_count: number;
}

interface Props {
    categories: Category[];
}

const EMOJI_OPTIONS = [
    '💰', '💼', '💻', '📈', '🎁', '💵', '🏠', '🚗',
    '🍔', '🛒', '📄', '🎮', '💊', '📚', '✈️', '🎬',
    '🎵', '👕', '💄', '⚡', '📱', '🏋️', '🐕', '🎂',
    '☕', '🍕', '🚌', '🏥', '📦', '🔧',
];

const COLOR_OPTIONS = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E',
    '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6',
    '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
    '#F43F5E', '#64748B',
];

export default function Index({ categories }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        type: 'expense' as 'income' | 'expense',
        icon: '💰',
        color: '#0EA5E9',
    });

    const incomeCategories = categories.filter((cat) => cat.type === 'income');
    const expenseCategories = categories.filter((cat) => cat.type === 'expense');

    const openCreateDialog = () => {
        reset();
        setEditingCategory(null);
        setDialogOpen(true);
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        setData({
            name: category.name,
            type: category.type,
            icon: category.icon,
            color: category.color,
        });
        setDialogOpen(true);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            put(route('categories.update', editingCategory.id), {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                },
            });
        } else {
            post(route('categories.store'), {
                onSuccess: () => {
                    setDialogOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (categoryToDelete) {
            router.delete(route('categories.destroy', categoryToDelete.id), {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setCategoryToDelete(null);
                },
            });
        }
    };

    const CategoryCard = ({ category }: { category: Category }) => (
        <div
            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-sky-50/50 to-transparent hover:from-sky-100/50 transition-all duration-200 group"
        >
            <div className="flex items-center gap-4">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md transition-transform group-hover:scale-110"
                    style={{ backgroundColor: category.color + '20' }}
                >
                    {category.icon}
                </div>
                <div>
                    <p className="font-semibold text-sky-900">{category.name}</p>
                    <p className="text-sm text-sky-500">
                        {category.transactions_count} transaksi
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div
                    className="w-6 h-6 rounded-full shadow-inner"
                    style={{ backgroundColor: category.color }}
                />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(category)}
                >
                    <Pencil className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setCategoryToDelete(category);
                        setDeleteDialogOpen(true);
                    }}
                    disabled={category.transactions_count > 0}
                >
                    <Trash2 className={`w-4 h-4 ${category.transactions_count > 0 ? 'text-gray-300' : 'text-red-500'}`} />
                </Button>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Kategori</h1>
                        <p className="text-sky-100 text-sm mt-1">
                            Kelola kategori pemasukan dan pengeluaran
                        </p>
                    </div>
                    <Button className="shadow-lg" onClick={openCreateDialog}>
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Kategori
                    </Button>
                </div>
            }
        >
            <Head title="Kategori" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Income Categories */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                                </div>
                                Kategori Pemasukan
                                <Badge variant="income" className="ml-auto">
                                    {incomeCategories.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {incomeCategories.length > 0 ? (
                                <div className="space-y-3">
                                    {incomeCategories.map((category) => (
                                        <CategoryCard key={category.id} category={category} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-sky-400">
                                    <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada kategori pemasukan</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Expense Categories */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                </div>
                                Kategori Pengeluaran
                                <Badge variant="expense" className="ml-auto">
                                    {expenseCategories.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {expenseCategories.length > 0 ? (
                                <div className="space-y-3">
                                    {expenseCategories.map((category) => (
                                        <CategoryCard key={category.id} category={category} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-sky-400">
                                    <TrendingDown className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada kategori pengeluaran</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory
                                ? 'Ubah data kategori yang sudah ada'
                                : 'Buat kategori baru untuk transaksi'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Type */}
                        <div className="space-y-2">
                            <Label>Tipe</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'income')}
                                    className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                                        data.type === 'income'
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                            : 'border-sky-200 hover:border-sky-300 text-sky-600'
                                    }`}
                                >
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="font-medium">Pemasukan</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('type', 'expense')}
                                    className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                                        data.type === 'expense'
                                            ? 'border-red-500 bg-red-50 text-red-700'
                                            : 'border-sky-200 hover:border-sky-300 text-sky-600'
                                    }`}
                                >
                                    <TrendingDown className="w-4 h-4" />
                                    <span className="font-medium">Pengeluaran</span>
                                </button>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label>Nama Kategori</Label>
                            <Input
                                placeholder="Contoh: Makanan"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        {/* Icon */}
                        <div className="space-y-2">
                            <Label>Ikon</Label>
                            <div className="flex flex-wrap gap-2 p-3 border-2 border-sky-200 rounded-xl max-h-32 overflow-y-auto">
                                {EMOJI_OPTIONS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setData('icon', emoji)}
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                                            data.icon === emoji
                                                ? 'bg-sky-500 shadow-lg scale-110'
                                                : 'hover:bg-sky-100'
                                        }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color */}
                        <div className="space-y-2">
                            <Label>Warna</Label>
                            <div className="flex flex-wrap gap-2">
                                {COLOR_OPTIONS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setData('color', color)}
                                        className={`w-8 h-8 rounded-full transition-all ${
                                            data.color === color
                                                ? 'ring-4 ring-sky-300 scale-110'
                                                : 'hover:scale-110'
                                        }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="p-4 bg-sky-50 rounded-xl">
                            <Label className="text-sky-500 text-xs">Preview</Label>
                            <div className="flex items-center gap-3 mt-2">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                    style={{ backgroundColor: data.color + '20' }}
                                >
                                    {data.icon}
                                </div>
                                <div>
                                    <p className="font-semibold text-sky-900">
                                        {data.name || 'Nama Kategori'}
                                    </p>
                                    <Badge variant={data.type === 'income' ? 'income' : 'expense'}>
                                        {data.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : editingCategory ? 'Update' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Kategori</DialogTitle>
                        <DialogDescription>
                            Apakah kamu yakin ingin menghapus kategori ini?
                        </DialogDescription>
                    </DialogHeader>
                    {categoryToDelete && (
                        <div className="py-4">
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-50">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                    style={{ backgroundColor: categoryToDelete.color + '20' }}
                                >
                                    {categoryToDelete.icon}
                                </div>
                                <div>
                                    <p className="font-semibold text-sky-900">
                                        {categoryToDelete.name}
                                    </p>
                                    <Badge variant={categoryToDelete.type === 'income' ? 'income' : 'expense'}>
                                        {categoryToDelete.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                    </Badge>
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
