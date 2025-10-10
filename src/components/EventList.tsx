import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, User, Trash2 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  organizer: string;
  organizer_email: string;
  created_by?: string;
}

interface EventListProps {
  events: Event[];
  currentUserId?: string;
  onDelete?: (id: string) => void;
}

export const EventList = ({ events, currentUserId, onDelete }: EventListProps) => {
  if (events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
        <p className="text-muted-foreground">Create your first event to get started!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card key={event.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
              {event.description && (
                <p className="text-muted-foreground mb-4">{event.description}</p>
              )}
            </div>
            {currentUserId === event.created_by && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(event.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">Start:</span>
              <span>{format(new Date(event.start_time), 'PPp')}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-accent" />
              <span className="font-medium">End:</span>
              <span>{format(new Date(event.end_time), 'PPp')}</span>
            </div>

            {event.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">Location:</span>
                <span>{event.location}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium">Organizer:</span>
              <span>{event.organizer}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <Badge variant="outline" className="bg-primary/10">
              {format(new Date(event.start_time), 'MMMM d, yyyy')}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
};