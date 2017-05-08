# fec-database
Program for managing employees, schedules and customer attendance records. Created for the FBLA 2017 Coding and Programming competition.

# Overview
- Written in [Typescript](https://www.typescriptlang.org/) and [SQLite](https://www.sqlite.org/)
- Run with [electron](https://electron.atom.io/)/[Nodejs](https://nodejs.org/en/)
- Made using the [Webix](https://webix.com/) and [FullCalendar](https://fullcalendar.io/) libraries

# Notes
- Though this was created in Typescript, the large amount of javascript files are all libraries I needed to include in the folder structure itself.
- This was made using webix jet, which wasn't built with Typescript in mind. Therefore, I had to use a few hacky solutions such as the above, and exposing `ipcRender` to the window using index.html.
- Also because of that, there are two `tsconfig.json` files. The base one is for code to be run on the process, and the one in app is for the renderer process. `main.js` and the files in `managers` use `commonjs`, while everything else uses `requirejs`.
- Commercial use of this code would likely require Commercial licenses for Webix and FullCalendar. This implentation uses their open-source versions.

# File structure
1. All the managers for getting/setting data in the database are in `managers`.
2. The modules for each view (schedules, attendance, etc) are under `app/views`
3. Extra misc. files are under `app/models`. Those are all helpers and reusable ui elements as well as wrappers for communications for other apis (for example, `app/models/WeeklyScheduler.ts` is for creating/communicating with a FullCalendar instance)

# Building
This was made for/on windows. It was not tested on other platforms, though it should with minor effort.
1. Install `Nodejs`, then also install `Typescript` and `electron-rebuild` via `npm`.
```
npm install -g typescript
npm install -g electron-rebuild
```
2. Clone this repository
```
cd some/directory
git clone https://github.com/Pixelrobin/fec-database/
cd fec-database
```
3. Install packages and rebuild them for electron
```
npm install
electron-rebuild
```
4. Run the build command. This uses a bat file so it works on windows only.
```
npm run build
```
5. Run the start command and everything should work.
```
npm run start
```