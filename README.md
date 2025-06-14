# HomeOS - Smart Home Automation Dashboard

A modern, responsive dashboard for managing your smart home devices. Built with React, TypeScript, and Material-UI.

## Features

- Real-time device control and monitoring
- Dark/Light mode support
- Responsive design for all devices
- Device status visualization
- Settings management
- Firebase integration for real-time updates

## Tech Stack

- React
- TypeScript
- Material-UI
- Firebase
- Framer Motion for animations

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/HomeOS.git
cd HomeOS
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project and add your configuration in `src/config/firebase.ts`

4. Start the development server:
```bash
npm start
```

## Deployment

This project is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel for automatic deployments.

## Environment Variables

Create a `.env` file in the root directory with your Firebase configuration:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## License

MIT

## Project Structure

```
src/
  ├── components/
  │   ├── Dashboard.tsx    # Main dashboard component
  │   └── Reports.tsx      # Door status reports
  ├── config/
  │   └── firebase.ts      # Firebase configuration
  ├── App.tsx             # Main app component
  └── index.tsx           # Entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request