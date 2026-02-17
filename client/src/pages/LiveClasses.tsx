import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, Users, PlayCircle, ExternalLink } from "lucide-react";
import { format, addHours, isAfter, isBefore } from "date-fns";
import { motion } from "framer-motion";
import { useLiveClasses } from "@/hooks/use-resources";

export default function LiveClasses() {
  const { lang } = useTheme();
  const { data: classes, isLoading } = useLiveClasses();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{lang === 'en' ? 'Live Sessions' : 'لائیو کلاسز'}</h1>
        <p className="text-muted-foreground">{lang === 'en' ? 'Join interactive classes with qualified scholars.' : 'کوالیفائیڈ علماء کے ساتھ انٹرایکٹو کلاسز میں شامل ہوں۔'}</p>
      </div>

      <div className="grid gap-6">
        {classes?.map((cls) => {
          const startTime = new Date(cls.startTime);
          const endTime = addHours(startTime, 1);
          const isLive = cls.isLive || (isAfter(currentTime, startTime) && isBefore(currentTime, endTime));
          
          return (
            <motion.div 
              key={cls.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`overflow-hidden border-2 transition-all ${isLive ? 'border-primary shadow-xl shadow-primary/10 bg-primary/5' : 'border-border'}`}>
                <div className="flex flex-col md:flex-row">
                  <div className={`p-6 md:w-48 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-border ${isLive ? 'bg-primary text-primary-foreground' : 'bg-muted/50'}`}>
                    <CalendarIcon className="h-6 w-6 mb-2 opacity-80" />
                    <div className="text-2xl font-bold">{format(startTime, "MMM d")}</div>
                    <div className="text-sm font-medium opacity-80">{format(startTime, "EEEE")}</div>
                  </div>
                  
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {isLive && (
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                          )}
                          <span className={`text-xs font-bold uppercase tracking-wider ${isLive ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {isLive ? (lang === 'en' ? 'Happening Now' : 'ابھی ہو رہا ہے') : (lang === 'en' ? 'Upcoming' : 'آنے والا')}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold">{cls.title}</h3>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                          <Users className="h-4 w-4" />
                          {cls.instructor}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-start md:items-end gap-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Clock className="h-4 w-4 text-primary" />
                          {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                        </div>
                        <Button 
                          className={isLive ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/90'}
                          size="lg"
                          disabled={!isLive && !cls.joinUrl}
                        >
                          {isLive ? (
                            <>
                              <PlayCircle className="mr-2 h-5 w-5" />
                              {lang === 'en' ? 'Join Now' : 'ابھی شامل ہوں'}
                            </>
                          ) : (
                            <>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              {lang === 'en' ? 'Details' : 'تفصیلات'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
