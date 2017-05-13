# Models (Extra modules)
This folder is named `models` because that's what the Webix Jet boilerplate uses. I'm not sure of the meaning behind the name. Basically, these are extra modules that are called from the views.

## Files
* `EventForm.ts`: Webix form ui for editing schedule events. Put in it's own module because it is used twice in the schedules view - once for the "Add Event" popup, and once for the "Event Editor" form.
* `InfoCard.ts`: Used in attendance view. A simple window that displays html strings of different sizes.
* `uiWrappers`: Common functions for wrapping Webix elements in windows and layouts.
* `WeeklyScheduler.ts`: FullCalendar wrapper used to display a weekly schedule.