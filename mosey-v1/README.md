# Mosey prototype (v1: policy considerations)

A clickable prototype of an insurance-policy app: upload policies, read plain
summaries with page citations, see insights, and ask Moe, the assistant.

Everything runs on your machine. There is no backend and no sign-in; the data
is sample data and Moe's answers are canned, not a live model.

## What you need

- **Node 22** (built with 22.13.1). Check with `node -v`.
- **For the iOS simulator:** a Mac with Xcode installed and opened once, so the
  simulator and command-line tools are set up.
- **For a real phone instead:** the free Expo Go app, with the phone on the same
  Wi-Fi as your computer.

## Run it

From this folder, install the dependencies. You only need to do this the first
time:

```bash
npm install
```

Then start the app:

```bash
npx expo start
```

This starts a local server on your machine. It keeps running in that terminal
until you stop it with Ctrl+C, and you run it again each time you want to view
the prototype.

While it is running, in that same terminal:

- press `i` to open it in the iOS simulator (Expo Go is installed there for you
  the first time),
- or press `w` to open it in a web browser, at http://localhost:8081,
- or scan the QR code with your phone's camera to open it in Expo Go.

To start the server and open the simulator in one step:

```bash
npx expo start --ios
```

If the simulator does not open, or it reports that the simulator did not open in
time, open the Simulator app yourself (Xcode > Open Developer Tool > Simulator),
wait for a phone to boot, and press `i` again.

## Build it as its own app (optional)

The steps above run the prototype inside Expo Go, which is enough to view
everything. To build it as a standalone app in the simulator you also need
CocoaPods (`brew install cocoapods`), then:

```bash
npx expo run:ios
```

This generates an `ios/` folder and compiles the app with Xcode; the first
build takes several minutes. This route has not been tested for this
prototype, only the Expo Go route has.

## Finding your way around

- **Home**: what needs attention, and the bell for notifications.
- **Files**: policies, policies shared with you, and supporting documents. Use
  **Add > Try a sample policy** to watch an upload run.
- **Insights**: everything Moe noticed, by policy. **Ask Moe** on a card opens a
  chat about that insight.
- **Compare**: two policies side by side.
- Open any policy for its details. Tap a card or row to see where in the
  document it came from.

## Good to know

- Nothing is saved. Reloading the app returns it to its starting state.
- Most sample policies are past terms, so they show as Expired.
- "View in document" opens a sample PDF hosted online, so it needs internet.
  Only some policies have one.
- The sample policies come from the client's reference material and include
  names and policy numbers as they appear there. Please don't pass this on.

## For developers

- `npx tsc --noEmit` typechecks the project.
- Policy data lives in `src/lib/policies/`; its shape is in
  `src/lib/policyTypes.ts`, and `docs/client-framework.md` explains how it maps
  to the client's section framework.
- `docs/explorations.md` is the log of what has been tried and why.
