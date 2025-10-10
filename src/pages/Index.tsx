import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EventCalendar } from "@/components/EventCalendar";
import { EventDialog } from "@/components/EventDialog";
import { EventList } from "@/components/EventList";
import { AuthForms } from "@/components/AuthForms";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchEvents();
      
      // Subscribe to realtime changes
      const channel = supabase
        .channel('events-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'events'
          },
          () => {
            fetchEvents();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch events",
      });
    } else {
      setEvents(data || []);
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    const { error } = await supabase
      .from('events')
      .insert([{
        ...eventData,
        created_by: user?.id,
      }]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create event",
      });
    } else {
      toast({
        title: "Success!",
        description: "Event created successfully",
      });
      setDialogOpen(false);
      fetchEvents();
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete event",
      });
    } else {
      toast({
        title: "Success!",
        description: "Event deleted successfully",
      });
      fetchEvents();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
        <AuthForms onSuccess={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              College Event Scheduler
            </h1>
            <p className="text-muted-foreground">
              Manage and track all college events in one place
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Event
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </header>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-6">
            <EventCalendar
              events={events}
              onDateClick={(date) => {
                setSelectedDate(date);
                setDialogOpen(true);
              }}
              onEventClick={(event) => {
                toast({
                  title: event.title,
                  description: event.description || 'No description',
                });
              }}
            />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <EventList
              events={events}
              currentUserId={user?.id}
              onDelete={handleDeleteEvent}
            />
          </TabsContent>
        </Tabs>

        <EventDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleCreateEvent}
          initialDate={selectedDate}
        />
      </div>
    </div>
  );
};

export default Index;