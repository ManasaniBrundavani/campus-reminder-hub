import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Checking for events that need reminders...");

    // Get current time and time 5 minutes from now
    const now = new Date();
    const fiveMinutesLater = new Date(now.getTime() + 5 * 60000);

    // Find events that need reminders sent
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .gte("start_time", now.toISOString())
      .lte("start_time", fiveMinutesLater.toISOString());

    if (eventsError) throw eventsError;

    console.log(`Found ${events?.length || 0} events needing reminders`);

    for (const event of events || []) {
      // Calculate when reminder should be sent
      const eventStartTime = new Date(event.start_time);
      const reminderTime = new Date(
        eventStartTime.getTime() - (event.reminder_minutes || 60) * 60000
      );

      // Check if we're within the reminder window
      if (now >= reminderTime && now <= eventStartTime) {
        // Check if reminder already sent
        const { data: existingReminder } = await supabase
          .from("event_reminders")
          .select("*")
          .eq("event_id", event.id)
          .eq("sent", true)
          .maybeSingle();

        if (!existingReminder) {
          console.log(`Sending reminder for event: ${event.title}`);

          // Send email
          const emailResponse = await resend.emails.send({
            from: "College Events <onboarding@resend.dev>",
            to: [event.organizer_email],
            subject: `Reminder: ${event.title} - Starting Soon!`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .event-card { 
                      background: #f9fafb; 
                      border-left: 4px solid #4F46E5; 
                      padding: 20px; 
                      margin: 20px 0;
                      border-radius: 4px;
                    }
                    .event-title { color: #4F46E5; font-size: 24px; margin: 0 0 10px 0; }
                    .event-detail { margin: 10px 0; }
                    .label { font-weight: bold; color: #666; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>Event Reminder</h1>
                    <p>This is a reminder that your event is starting in ${event.reminder_minutes || 60} minutes!</p>
                    
                    <div class="event-card">
                      <h2 class="event-title">${event.title}</h2>
                      ${event.description ? `<p>${event.description}</p>` : ""}
                      
                      <div class="event-detail">
                        <span class="label">📅 Date & Time:</span> 
                        ${new Date(event.start_time).toLocaleString()}
                      </div>
                      
                      ${event.location ? `
                        <div class="event-detail">
                          <span class="label">📍 Location:</span> ${event.location}
                        </div>
                      ` : ""}
                      
                      <div class="event-detail">
                        <span class="label">👤 Organizer:</span> ${event.organizer}
                      </div>
                    </div>
                    
                    <p>Don't forget to prepare for the event!</p>
                    
                    <div class="footer">
                      <p>College Event Scheduler</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          });

          // Record the reminder as sent
          await supabase.from("event_reminders").insert({
            event_id: event.id,
            recipient_email: event.organizer_email,
            scheduled_for: reminderTime.toISOString(),
            sent: true,
            sent_at: now.toISOString(),
          });

          console.log("Reminder sent successfully:", emailResponse);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: events?.length || 0 }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-event-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
