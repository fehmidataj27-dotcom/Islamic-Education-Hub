import { useBooks } from "@/hooks/use-resources";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book as BookIcon, Download, Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function Books() {
  const { data: books, isLoading } = useBooks();
  const { lang } = useTheme();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-80 bg-muted/20 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{lang === 'en' ? 'Darse Nizami Library' : 'درس نظامی لائبریری'}</h1>
        <p className="text-muted-foreground">{lang === 'en' ? 'Explore classical texts and their commentaries.' : 'کلاسیکی کتب اور ان کی شروحات دیکھیں۔'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books?.map((book, idx) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 group border-border/60">
              <div className="relative h-48 bg-muted overflow-hidden rounded-t-xl">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/20 text-secondary-foreground">
                    <BookIcon className="h-16 w-16 opacity-50" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur text-foreground">
                    {book.className}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="line-clamp-2 leading-tight">{book.title}</CardTitle>
                <div className="text-sm text-muted-foreground">{book.category}</div>
              </CardHeader>
              
              <CardFooter className="mt-auto pt-0 gap-2">
                <Button variant="outline" className="flex-1">
                  <Eye className="mr-2 h-4 w-4" /> {lang === 'en' ? 'Read' : 'پڑھیں'}
                </Button>
                {book.pdfUrl && (
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
