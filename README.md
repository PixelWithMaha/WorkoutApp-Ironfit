# IronFit App 💪

Hi! This is my project for my mobile development coursework. It's a fitness tracking app called IronFit. I built it using React Native and Expo. 

## What it does

- **Step & Health Tracking:** Uses `react-native-health-connect` on Android and the pedometer on iOS to track your daily steps, active calories burned, and distance.
- **AI Coach:** I integrated an AI health coach using `groq-sdk` and `@google/generative-ai` to give you personalized workout advice based on your daily stats! It's super cool.
- **History & Progress:** Uses `react-native-chart-kit` to show nice graphs of your workout history and step count over the week.
- **Data Saving:** All the user profile data and workout history is saved in Firebase Firestore so you don't lose anything if you close the app.


## Tech Stack
- **Frontend:** React Native / Expo
- **Language:** TypeScript (I had to fix a lot of type errors but I think they are all gone now!)
- **Backend:** Firebase (Firestore)
- **Navigation:** React Navigation (Native Stack & Bottom Tabs)
- **APIs:** Health Connect API, Groq AI API

## How to run my code

If you want to run this locally, follow these steps:

1. Clone the repository and go into the folder:
   ```bash
   cd ironfit-app
   ```
2. Install the dependencies. I used npm for this project:
   ```bash
   npm install
   ```
3. **Important:** You need a `.env` file for the API keys (Firebase config, Groq API key, etc.). I didn't commit it to the repo for security reasons, so you'll have to put your own keys there.
4. Start the Expo development server:
   ```bash
   npm start
   ```
5. Since this app uses native modules like Health Connect, you can't just use standard Expo Go. You have to run a custom development build. For Android, plug in your phone or start an emulator and run:
   ```bash
   npx expo run:android
   ```

## Things I struggled with 
- Getting `react-native-health-connect` to initialize without crashing was honestly really hard. I had to configure specific permissions in `app.json` (`ACTIVITY_RECOGNITION`, etc.) and make sure it initialized correctly on Android before fetching data.
- The AI coach originally just spit out raw markdown text which looked pretty bad. I spent some time fixing it by using `react-native-markdown-display` to format the text into nice UI cards.
- I had some annoying issues with the Metro bundler crashing because of TypeScript identifier collisions and legacy styles, but I refactored the code to fix them.
- Dealing with state management for phone-based step counting so it auto-resets on a new day and saves properly to Firestore took a bit of trial and error.

Hope you like it! Let me know if you have any questions about how the code works.
