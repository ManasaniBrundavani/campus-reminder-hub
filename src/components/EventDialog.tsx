import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Mail, User, Bell } from "lucide-react";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (event: any) => void;
  initialDate?: Date;
}

export const EventDialog = ({ open, onOpenChange, onSave, initialDate }: EventDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start_time: initialDate ? format(initialDate, "yyyy-MM-dd'T'HH:mm") : '',
    end_time: initialDate ? format(initialDate, "yyyy-MM-dd'T'HH:mm") : '',
    organizer: '',
    organizer_email: '',
    reminder_minutes: 60,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      title: '',
      description: '',
      location: '',
      start_time: '',
      end_time: '',
      organizer: '',
      organizer_email: '',
      reminder_minutes: 60,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Event Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Tech Symposium 2025"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the event..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Start Time *
              </Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                End Time *
              </Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Main Auditorium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizer" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Organizer Name *
              </Label>
              <Input
                id="organizer"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizer_email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Organizer Email *
              </Label>
              <Input
                id="organizer_email"
                type="email"
                value={formData.organizer_email}
                onChange={(e) => setFormData({ ...formData, organizer_email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder_minutes" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Reminder (minutes before event)
            </Label>
            <Input
              id="reminder_minutes"
              type="number"
              value={formData.reminder_minutes}
              onChange={(e) => setFormData({ ...formData, reminder_minutes: parseInt(e.target.value) })}
              min="5"
              step="5"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Create Event
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};