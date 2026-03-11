import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVideoSchema, type InsertVideo } from "@shared/schema";
import { useCreateVideo } from "@/hooks/use-resources";
import { useAuth } from "@/hooks/use-auth";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Upload, Plus, Loader2, Image as ImageIcon, Video as VideoIcon, Check } from "lucide-react";

interface MediaUploadProps {
    category?: string;
}

export default function MediaUpload({ category = "Fiqh" }: MediaUploadProps) {
    const { lang } = useTheme();
    const { user } = useAuth();
    const isAdminOrTeacher = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'teacher';
    const [isOpen, setIsOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
    const { toast } = useToast();
    const createVideoMutation = useCreateVideo();
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<InsertVideo>({
        resolver: zodResolver(insertVideoSchema),
        defaultValues: {
            title: { en: "", ur: "" },
            category: category,
            url: "",
            thumbnail: "",
            duration: "45 min",
            viewCount: 0,
        },
    });

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'media' | 'thumbnail') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === 'media') setIsUploading(true);
        else setIsUploadingThumbnail(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorBody = await res.text();
                throw new Error(errorBody || `Upload failed with status ${res.status}`);
            }

            const data = await res.json();

            if (type === 'media') {
                form.setValue("url", data.url);
            } else {
                form.setValue("thumbnail", data.url);
            }

            toast({
                title: lang === "en" ? "File Uploaded" : "فائل اپ لوڈ ہو گئی",
                description: lang === "en"
                    ? `${type === 'media' ? 'Media' : 'Thumbnail'} has been uploaded successfully.`
                    : `${type === 'media' ? 'میڈیا' : 'تھمب نیل'} کامیابی کے ساتھ اپ لوڈ ہو گئی ہے۔`,
            });
        } catch (error: any) {
            console.error("Upload error:", error);
            toast({
                variant: "destructive",
                title: lang === "en" ? "Upload Error" : "اپ لوڈ کی غلطی",
                description: error.message,
            });
        } finally {
            if (type === 'media') setIsUploading(false);
            else setIsUploadingThumbnail(false);
        }
    };

    const onSubmit = async (values: InsertVideo) => {
        if (!values.url) {
            toast({
                variant: "destructive",
                title: lang === "en" ? "Missing File" : "فائل غائب ہے",
                description: lang === "en" ? "Please upload a media file first." : "برائے مہربانی پہلے میڈیا فائل اپ لوڈ کریں۔",
            });
            return;
        }

        try {
            await createVideoMutation.mutateAsync(values);
            toast({
                title: lang === "en" ? "Lecture Added" : "لیکچر شامل کر دیا گیا",
                description: lang === "en" ? "New lecture has been added to the course." : "کورس میں نیا لیکچر شامل کر دیا گیا ہے۔",
            });
            setIsOpen(false);
            form.reset();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: lang === "en" ? "Error" : "غلطی",
                description: error.message,
            });
        }
    };

    const t = {
        button: lang === "en" ? "Upload Lecture" : "لیکچر اپ لوڈ کریں",
        title: lang === "en" ? "Add New Lecture" : "نیا لیکچر شامل کریں",
        enTitle: lang === "en" ? "English Title" : "انگریزی عنوان",
        urTitle: lang === "en" ? "Urdu Title" : "اردو عنوان",
        category: lang === "en" ? "Category" : "زمرہ",
        file: lang === "en" ? "Media File (Video/Audio)" : "میڈیا فائل (ویڈیو/آڈیو)",
        thumbnail: lang === "en" ? "Thumbnail Graphic (Optional)" : "تھمب نیل گرافک (اختیاری)",
        submit: lang === "en" ? "Save Lecture" : "لیکچر محفوظ کریں",
        duration: lang === "en" ? "Duration (e.g. 15:00)" : "دورانیہ (مثلاً 15:00)",
    };

    if (!isAdminOrTeacher) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-xl gap-2 shadow-lg hover:shadow-primary/20 transition-all font-bold">
                    <Plus className="h-4 w-4" />
                    {t.button}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-primary">
                        <VideoIcon className="h-6 w-6" />
                        {t.title}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title.en"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">{t.enTitle}</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Basics of Salah" className="rounded-xl h-11" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="title.ur"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">{t.urTitle}</FormLabel>
                                        <FormControl>
                                            <Input {...field} dir="rtl" placeholder="نماز کی بنیادی باتیں" className="rounded-xl h-11 font-urdu" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">{t.category}</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl h-11">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="Tajweed">Tajweed / تجوید</SelectItem>
                                                <SelectItem value="Tafseer">Tafseer / تفسیر</SelectItem>
                                                <SelectItem value="Hadees">Hadees / حدیث</SelectItem>
                                                <SelectItem value="Fiqh">Fiqh (Namaz) / فقہ</SelectItem>
                                                <SelectItem value="Namaz">Namaz / نماز</SelectItem>
                                                <SelectItem value="History">History / تاریخ</SelectItem>
                                                <SelectItem value="Arabic">Arabic / عربی</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Duration</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value ?? ""} placeholder="45 min" className="rounded-xl h-11" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Media Upload */}
                        <FormItem>
                            <FormLabel className="font-bold">{t.file}</FormLabel>
                            <div className="relative group">
                                <FormControl>
                                    <Input
                                        type="file"
                                        accept="video/*,audio/*"
                                        onChange={(e) => onFileChange(e, 'media')}
                                        disabled={isUploading}
                                        className="rounded-xl cursor-pointer h-14 pt-4 pb-1 pl-12 file:hidden bg-muted/30 border-dashed border-2 hover:border-primary/50 transition-all font-medium"
                                    />
                                </FormControl>
                                <VideoIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors" />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : (form.watch("url") && <Check className="h-4 w-4 text-green-500" />)}
                                </div>
                                <div className="absolute left-12 top-1 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                    {isUploading ? "Uploading..." : form.watch("url") ? "Media ready" : "Choose file"}
                                </div>
                            </div>
                        </FormItem>

                        {/* Thumbnail Upload */}
                        <FormItem>
                            <FormLabel className="font-bold">{t.thumbnail}</FormLabel>
                            <div className="flex gap-4">
                                <div className="relative group flex-1">
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => onFileChange(e, 'thumbnail')}
                                            disabled={isUploadingThumbnail}
                                            className="rounded-xl cursor-pointer h-14 pt-4 pb-1 pl-12 file:hidden bg-muted/30 border-dashed border-2 hover:border-primary/50 transition-all font-medium"
                                        />
                                    </FormControl>
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <div className="absolute left-12 top-1 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                        {isUploadingThumbnail ? "Uploading Graphic..." : form.watch("thumbnail") ? "Graphic ready" : "Choose graphic"}
                                    </div>
                                </div>

                                {form.watch("thumbnail") && (
                                    <div className="h-14 w-24 rounded-xl border overflow-hidden bg-muted flex shrink-0">
                                        <img src={form.watch("thumbnail") || ""} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                Tip: If no graphic is uploaded, a beautiful premium cover will be generated automatically.
                            </p>
                        </FormItem>

                        <Button
                            type="submit"
                            className="w-full rounded-xl h-14 mt-4 text-lg font-bold shadow-xl transition-all active:scale-[0.98] bg-primary hover:bg-primary/90"
                            disabled={createVideoMutation.isPending || isUploading || isUploadingThumbnail || !form.watch("url")}
                        >
                            {(createVideoMutation.isPending || isUploading || isUploadingThumbnail) ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    {isUploading ? "Uploading Video..." : isUploadingThumbnail ? "Uploading Graphic..." : "Saving Lecture..."}
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-5 w-5" />
                                    {t.submit}
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
