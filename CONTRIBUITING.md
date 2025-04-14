# Contributing to WordVision

This guide will assist you in setting up the project for development.

> Note: Major changes have been made  
> The `backend/` folder is no longer relvant as we are now relying on supabase - an open source backend-as-a-service.  
> This guide will help you get started with running the frontend as well as working through the supabase backend.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
  - [Core Frameworks & Libraries](#core-frameworks--libraries)
  - [Key Integrations](#key-integrations)
- [Getting Started](#getting-started)
  - [Clone the Project](#clone-the-project)
  - [Setup Environment Variables](#setup-environment-variables)
  - [Install Dependencies](#install-dependencies)
  - [Setting up the Supabase Development Environment](#setting-up-the-supabase-development-environment)
- [Running the Project](#running-the-project)
  - [Running on Android](#running-on-android)
  - [Running on IOS](#running-on-ios)
  - [Running on Web](#running-on-web)
- [Add a book to the library](#add-a-book-to-the-library)

## Overview

A new way of reading books. Combining ePub books with AI-powered image generation, WordVision allows readers to create custom visuals by simply highlighting text, providing a uniquely immersive experience.

## Technology Stack

### Core Frameworks & Libraries

- [**Frontend**](https://github.com/WordVision/wordvision-app/tree/main/frontend): [Expo React Native](https://expo.dev/) – A cross-platform framework for mobile development.
- **Backend**: [Supabase](https://supabase.com/) – An open-source Firebase alternative

### Key Integrations

- **Hugging Face Inference**: Utilized for AI-driven image generation, ensuring efficient and high-quality visuals.

## Getting Started

### Clone the project

```bash
git clone https://github.com/WordVision/wordvision-app.git wordvision
```

### Setup environment variables

```text
# wordvision/frontend/.env

# Supabase database url
EXPO_PUBLIC_SUPABASE_URL=<ask for supabase url>

# Supabase public anon key
EXPO_PUBLIC_SUPABASE_ANON_KEY=<ask for anon key>
```

### Install dependencies

Run npm install inside `/frontend`

```bash
npm install
```

Then run expo install to ensure expo packages installed are compatible with current expo version

```bash
npx expo install
```

## Running the project

```bash
npm start
```

### Running on Android

#### Prerequisites

- android emulator or connected local android device

To run on android, press `a`

> Note:
> I recommend using the development build for better compatibility. You can do so by pressing `s` to switch away from Expo Go.

### Running on IOS

- iOS emulator

To run on android, press `i`

> Note:
> I recommend using the **Expo Go**. Otherwise, you might find the following error:

```
CommandError: No development build (com.wordvision.WordVision) for this project is installed. Please make and install a development build on the device first.
```

### Running on Web

> Needs more work

## Setting up the Supabase Development Environment

> This project relies on Supabase to handle backend logic, storage, and database. The local environment emulates the full backend experience without relying on the hosted version.

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

Or on macOS:

```bash
brew install supabase/tap/supabase
```

### Step 2: Set up Docker

Install [Docker Desktop](https://www.docker.com/products/docker-desktop) and ensure it’s running.

---

### Step 3: Configure Environment Variables

Ask for the .env file with all the keys.

---

### Step 4: Set up and Run the Supabase Setup Script

```bash
cd frontend/scripts

python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

pip install --upgrade pip
pip install python-dotenv boto3

python3 setup-local-supabase.py
```

This will:

- Initialize Supabase locally
- Start the database
- Apply migrations
- Seed with test data
- Upload EPUBs and images

---

### Step 5: Serve Edge Functions

```bash
supabase functions serve --env-file ./supabase/.env.local
```

---

## Add a book to the library

1. Rename the epub file to the book title (words separated by underscores instead of spaces)
   - ex. Infinite Jest -> infinite_jest.epub
2. Upload the epub to the [books](https://supabase.com/dashboard/project/szlxwnautzzqyrsnlenr/storage/buckets/books) bucket in supabase
   - Optional:
     1. Extract the cover image from the epub and rename it to the book's title just like you did with the epub
        - ex. Infinite Jest -> infinite_jest.[jpg|png]
     2. Upload the cover image to the public [images](https://supabase.com/dashboard/project/szlxwnautzzqyrsnlenr/storage/buckets/images) bucket under the book_covers folder
     3. Save the public url of the image for later
3. Add a new record for the book in the `books` table in our supabase [database](https://supabase.com/dashboard/project/szlxwnautzzqyrsnlenr/editor/45888?schema=public)
4. Add new records in the `user_books` table to give the users of your choice access to the book.
