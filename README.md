# Lumina AI Chatbot

Lumina AI is a modern AI-powered chatbot built with **Next.js**, **Tailwind CSS**, and **Firebase**. It uses **Gemini 2.5 Flash model** to provide intelligent and interactive responses.  
> **Note:** This chatbot uses Google DeepMind's Gemini model. I do not own or claim ownership of the Gemini AI model.

---

## Features

- **Real-time chat**: Each user has a separate chat stored in **Firebase Firestore**.  
- **User authentication**: Secure email/password login and registration with **Firebase Auth**.  
- **AI responses**: Powered by **Gemini 2.5 Flash** via a Next.js API route.  
- **Markdown & code support**: AI messages render markdown and code blocks with proper styling.  
- **Responsive UI**: Fully mobile-friendly, smooth scrolling, animated message transitions.  
- **Animated login/signup background**: Particle canvas animation for a modern feel (disabled on mobile for performance).

---

## Tech Stack

- **Frontend**: Next.js 13, React, Tailwind CSS, Framer Motion  
- **Backend / DB**: Firebase Firestore & Firebase Authentication  
- **AI**: Gemini 2.5 Flash model (by Google DeepMind)  
- **Utilities**: `marked` for Markdown, `GSAP` for animations, `shadcn` for UI  

---

## How it works

1. **User Authentication**:  
   - Users register or login with email & password.  
   - Firebase creates a user and stores basic info (`username`, `email`, `createdAt`).

2. **Chat System**:  
   - Every user has a **separate Firestore collection** for messages.  
   - Messages are stored in real-time and displayed instantly.  

3. **AI Interaction**:  
   - When a user sends a message, the Next.js API route sends it to **Gemini 2.5 Flash**.  
   - The AI response is stored in Firestore and displayed in the chat.  

4. **UI & Performance**:  
   - Messages animate in with Framer Motion.  
   - Markdown messages support code blocks and formatted text.  
   - Background particle animation runs smoothly and adapts to window resize.

---

## Live Demo

Check out the chatbot live here: [Lumina AI Live](https://your-live-link.com)
