import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Banknote, CreditCard, Plus, Loader2, Save, Edit } from "lucide-react";
import { useFees, useUsers, useCreateFee, useUpdateFee } from "@/hooks/use-resources";
import { useToast } from "@/hooks/use-toast";

export default function Fees() {
    const { lang } = useTheme();
    const { toast } = useToast();
    const { data: fees, isLoading: feesLoading } = useFees();
    const { data: users, isLoading: usersLoading } = useUsers();
    const createFee = useCreateFee();
    const updateFeeMutation = useUpdateFee();

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingFee, setEditingFee] = useState<any>(null);
    const [formData, setFormData] = useState({
        userId: "",
        amount: "",
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear().toString(),
        status: "Paid"
    });

    const t = {
        title: lang === 'en' ? 'Fee Management' : 'فیس کا انتظام',
        addPayment: lang === 'en' ? 'Record Payment' : 'ادائیگی ریکارڈ کریں',
        student: lang === 'en' ? 'Student' : 'طالب علم',
        amount: lang === 'en' ? 'Amount' : 'رقم',
        status: lang === 'en' ? 'Status' : 'حیثیت',
        month: lang === 'en' ? 'Month' : 'مہینہ',
        actions: lang === 'en' ? 'Actions' : 'عمل',
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createFee.mutateAsync({
                userId: formData.userId,
                amount: Number(formData.amount),
                month: formData.month,
                year: Number(formData.year),
                status: formData.status
            });
            setIsAddOpen(false);
            resetForm();
            toast({ title: "Success", description: "Fee record saved successfully." });
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to save fee record.", variant: "destructive" });
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFee) return;
        try {
            await updateFeeMutation.mutateAsync({
                id: editingFee.id,
                data: {
                    userId: formData.userId,
                    amount: Number(formData.amount),
                    month: formData.month,
                    year: Number(formData.year),
                    status: formData.status
                }
            });
            setIsEditOpen(false);
            setEditingFee(null);
            resetForm();
            toast({ title: "Success", description: "Fee record updated successfully." });
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to update fee record.", variant: "destructive" });
        }
    };

    const resetForm = () => {
        setFormData({
            userId: "",
            amount: "",
            month: new Date().toLocaleString('default', { month: 'long' }),
            year: new Date().getFullYear().toString(),
            status: "Paid"
        });
    };

    const startEdit = (record: any) => {
        setEditingFee(record);
        setFormData({
            userId: record.userId.toString(),
            amount: record.amount.toString(),
            month: record.month,
            year: record.year.toString(),
            status: record.status
        });
        setIsEditOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Paid": return "bg-green-100 text-green-800 hover:bg-green-100";
            case "Pending": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
            case "Overdue": return "bg-red-100 text-red-800 hover:bg-red-100";
            default: return "";
        }
    };

    const students = users?.filter((u: any) => u.role?.toLowerCase() === 'student') || [];
    const totalCollected = fees?.filter(f => f.status === "Paid").reduce((acc, f) => acc + f.amount, 0) || 0;
    const pendingDues = fees?.filter(f => f.status !== "Paid").reduce((acc, f) => acc + f.amount, 0) || 0;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Banknote className="h-8 w-8 text-primary" />
                        {t.title}
                    </h1>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t.addPayment}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleSave}>
                            <DialogHeader>
                                <DialogTitle>{t.addPayment}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>{t.student}</Label>
                                    <Select
                                        value={formData.userId}
                                        onValueChange={(val) => setFormData({ ...formData, userId: val })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Student" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((u: any) => (
                                                <SelectItem key={u.id} value={u.id.toString()}>
                                                    {u.firstName} {u.lastName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t.amount}</Label>
                                    <Input
                                        type="number"
                                        placeholder="5000"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t.month}</Label>
                                        <Select
                                            value={formData.month}
                                            onValueChange={(val) => setFormData({ ...formData, month: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t.status}</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(val) => setFormData({ ...formData, status: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Paid">Paid</SelectItem>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Overdue">Overdue</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="gap-2" disabled={createFee.isPending}>
                                    {createFee.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save Record
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <form onSubmit={handleUpdate}>
                            <DialogHeader>
                                <DialogTitle>Edit Fee Record</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>{t.student}</Label>
                                    <Select
                                        value={formData.userId}
                                        onValueChange={(val) => setFormData({ ...formData, userId: val })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Student" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((u: any) => (
                                                <SelectItem key={u.id} value={u.id.toString()}>
                                                    {u.firstName} {u.lastName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t.amount}</Label>
                                    <Input
                                        type="number"
                                        placeholder="5000"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t.month}</Label>
                                        <Select
                                            value={formData.month}
                                            onValueChange={(val) => setFormData({ ...formData, month: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t.status}</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(val) => setFormData({ ...formData, status: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Paid">Paid</SelectItem>
                                                <SelectItem value="Pending">Pending</SelectItem>
                                                <SelectItem value="Overdue">Overdue</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="gap-2" disabled={updateFeeMutation.isPending}>
                                    {updateFeeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Update Record
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₨ {totalCollected.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Across all recorded payments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
                        <Banknote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">₨ {pendingDues.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Unpaid and overdue records</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-0">
                    {feesLoading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t.student}</TableHead>
                                    <TableHead>{t.month}</TableHead>
                                    <TableHead>{t.amount}</TableHead>
                                    <TableHead>{t.status}</TableHead>
                                    <TableHead className="text-right">{t.actions}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fees?.map((record: any) => {
                                    const student = users?.find((u: any) => u.id === record.userId);
                                    return (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">
                                                {student ? `${student.firstName} ${student.lastName}` : record.userId}
                                            </TableCell>
                                            <TableCell>{record.month} {record.year}</TableCell>
                                            <TableCell>₨ {record.amount.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusBadge(record.status)}>
                                                    {record.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => startEdit(record)}>
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {fees?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No fee records found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
