import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGroupAnnouncementSchema } from "@shared/schema";
import { useGroups } from "@/hooks/use-groups";
import { useAuthContext } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Megaphone, Plus, Loader2, Send, Paperclip, X } from "lucide-react";

interface AnnouncementUploadProps {
    category?: string;
}

export default function AnnouncementUpload({ category }: AnnouncementUploadProps) {
    const { lang } = useTheme();
    const { user } = useAuthContext();
    const isAdminOrTeacher = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'teacher';
    const [isOpen, setIsOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();
    const { getGroups, createAnnouncement } = useGroups();
    
    // Fetch groups for the category
    // We pass category to getGroups to filter only relevant groups
    const { data: groupsData, isLoading: loadingGroups } = getGroups({ 
        category,
        limit: 100 
    });
    
    const groups = groupsData?.groups || [];

    const form = useForm({
        resolver: zodResolver(insertGroupAnnouncementSchema),
        defaultValues: {
            groupId: "",
            authorId: user?.id || "",
            content: "",
            fileUrl: null,
            fileType: "text",
        },
    });

    // Reset groupId when groups load or dialog opens
    useEffect(() => {
        if (isOpen && groups.length > 0) {
            form.setValue("groupId", groups[0].id);
        }
    }, [groups, form, isOpen]);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();

            form.setValue("fileUrl", data.url);
            form.setValue("fileType", file.type.startsWith("image/") ? "image" : "file");
            
            toast({
                title: lang === "en" ? "File Attached" : "فائل منسلک ہو گئی",
                description: lang === "en" ? "File is ready to be posted" : "فائل پوسٹ کرنے کے لیے تیار ہے",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: lang === "en" ? "Upload Error" : "اپ لوڈ کی غلطی",
                description: error.message,
            });
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = async (values: any) => {
        if (!values.groupId) {
            toast({
                variant: "destructive",
                title: lang === "en" ? "Validation Error" : "تصدیق کی غلطی",
                description: lang === "en" ? "Please select a group" : "برائے مہربانی گروپ منتخب کریں",
            });
            return;
        }

        try {
            await createAnnouncement.mutateAsync({
                groupId: values.groupId,
                data: values
            });
            toast({
                title: lang === "en" ? "Announcement Posted" : "اعلان پوسٹ کر دیا گیا",
                description: lang === "en" ? "Your message has been sent to the group" : "آپ کا پیغام گروپ میں بھیج دیا گیا ہے",
            });
            setIsOpen(false);
            form.reset({
                groupId: values.groupId, // Keep the selected group
                authorId: user?.id || "",
                content: "",
                fileUrl: null,
                fileType: "text"
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: lang === "en" ? "Error" : "غلطی",
                description: error.message,
            });
        }
    };

    if (!isAdminOrTeacher) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-xl gap-2 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all font-bold">
                    <Plus className="h-4 w-4" />
                    {lang === 'en' ? 'New Announcement' : 'نیا اعلان'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-primary">
                        <Megaphone className="h-6 w-6" />
                        {lang === 'en' ? 'Post New Announcement' : 'نیا اعلان پوسٹ کریں'}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                        <FormField
                            control={form.control}
                            name="groupId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">{lang === 'en' ? 'Target Group' : 'ٹارگٹ گروپ'}</FormLabel>
                                    <Select 
                                        onValueChange={field.onChange} 
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="rounded-xl h-11 border-primary/20 focus:ring-primary">
                                                <SelectValue placeholder="Select a group" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl">
                                            {loadingGroups ? (
                                                <SelectItem value="loading" disabled>Loading groups...</SelectItem>
                                            ) : groups.length === 0 ? (
                                                <SelectItem value="none" disabled>No groups found</SelectItem>
                                            ) : (
                                                groups.map(g => (
                                                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">{lang === 'en' ? 'Message content' : 'پیغام کی تفصیل'}</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            {...field} 
                                            placeholder={lang === 'en' ? "Write your announcement here..." : "اپنا پیغام یہاں لکھیں..."} 
                                            className="rounded-xl min-h-[120px] resize-none border-primary/20 focus:ring-primary"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {form.watch("fileUrl") && (
                            <div className="flex items-center justify-between bg-primary/5 p-3 rounded-xl border border-dashed border-primary/30">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Paperclip className="h-4 w-4 text-primary shrink-0" />
                                    <span className="text-xs truncate font-medium text-primary/80">Attachment ready</span>
                                </div>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 rounded-full text-red-500 hover:bg-red-50"
                                    onClick={() => {
                                        form.setValue("fileUrl", null);
                                        form.setValue("fileType", "text");
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <div className="flex items-center gap-3 mt-4">
                            <div className="relative">
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    onChange={onFileChange}
                                    disabled={isUploading}
                                />
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className={`rounded-xl h-12 gap-2 font-bold border-primary/20 hover:bg-primary/5 ${isUploading ? 'opacity-50' : ''}`}
                                    disabled={isUploading}
                                >
                                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                                    {lang === 'en' ? 'Attach File' : 'فائل منسلک کریں'}
                                </Button>
                            </div>

                            <Button
                                type="submit"
                                className="flex-1 rounded-xl h-12 text-md font-bold shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                                disabled={createAnnouncement.isPending || isUploading || !form.watch("content")}
                            >
                                {createAnnouncement.isPending ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        {lang === 'en' ? 'Post Announcement' : 'پوسٹ کریں'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
