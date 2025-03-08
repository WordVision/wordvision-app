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
- [Running the Project](#running-the-project)
  - [Running on Android](#running-on-android)
  - [Running on IOS](#running-on-ios)
  - [Running on Web](#running-on-web)

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
