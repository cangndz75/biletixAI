# EventMate

EventMate is a comprehensive event management and ticketing application that allows users to create, join, and engage in events. It offers different features based on **Organizer** and **User** roles and enhances the experience with AI-powered recommendation systems.

## Features

### Event Management
- **Organizers** can create, edit, and manage events.
- **Participants** can browse events and purchase tickets.

### Subscription System (Stripe Integration)
- **Organizer Plus** and **User Plus** subscription plans with additional features.
- Premium features such as **messaging, friend requests, VIP badges**, and more.

### QR Code Verification
- Quick event check-in via QR code scanning.
- **Controllers** can verify event entries and send notifications upon successful check-in.

### AI-Powered Recommendations
- Content-based filtering suggests events based on user preferences and past interactions.

### Admin & Staff Roles
- **Admin Dashboard** for event and user management.
- **Staff users** can moderate events and verify users.

### Additional Features
- Public communities where users can join and interact without authentication.
- Event feedback system with AI-powered analysis.
- Advertisements for **Organizer Plus** users to promote events.

## Installation & Setup

### Prerequisites
- Node.js & npm
- React Native CLI
- MongoDB (for backend database)
- Stripe API keys (for payment processing)

### Backend Setup
```bash
cd EventMate/api
npm install
npm start

###Frontend Setup
git clone https://github.com/cangndz75/biletixAI.git
npm install
npm start

## Roadmap

- [x] **User & Organizer Registration/Login System**  
- [x] **Event Creation and Management**  
- [x] **Stripe Integration for Subscriptions**  
- [x] **QR Code Event Check-in System**  
- [x] **Admin & Staff Role Management**  
- [x] **AI-Powered Event Recommendations**  
- [ ] **Seat Selection for Paid Events**  
- [ ] **Dynamic Seat Availability Updates**  
- [ ] **In-App Messaging System for User Plus Subscribers**  
- [ ] **Advanced Analytics Dashboard for Organizers**  
- [ ] **Multi-language Support**  
- [ ] **Push Notifications for Event Reminders**  

Usage
	•	Sign up as an Organizer or User.
	•	Browse, create, or join events.
	•	Subscribe to Organizer Plus for enhanced features.
	•	Scan QR codes for event entry.
	•	Get AI-based event recommendations.
   
@2025 | Can Gündüz