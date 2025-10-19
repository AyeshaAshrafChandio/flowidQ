# **App Name**: FlowIDQ

## Core Features:

- User Authentication: Secure signup/login with email, phone, or Google via Firebase Auth, with unique encrypted profile ID.
- Document Management: Upload and securely store documents (CNIC, certificates) in Firebase Storage, organized into folders. Limited file-size and file-type support.
- QR Code Integration: Scan QR codes to connect with verified organizations; enable secure, request-based data sharing using the camera.
- AI-Driven Data Control: AI tool to assist users in choosing data sharing options (full, partial, deny) with OTP authentication and access logs.
- Smart Queue System: Organizations generate tokens; users join digital queues via QR or ID with real-time updates and notifications.
- Document Analysis: Use Gemini AI to automatically detect and analyze the document types of uploaded documents.
- User Interface: Clean, minimal UI with key pages: Login, Dashboard, Upload/Scan, My Documents, QR Scanner/Generator, Queue Tracker, Settings/Logs.

## Style Guidelines:

- Primary color: Saturated blue (#2979FF) for trust and security.
- Background color: Light blue (#E3F2FD) to provide a clean and calm backdrop.
- Accent color: Purple (#7C4DFF) to highlight key interactive elements.
- Body and headline font: 'Inter', a grotesque sans-serif font, providing a modern and objective feel suitable for digital interfaces.
- Use a consistent set of minimalist icons to represent document types, actions, and settings.
- Employ a grid-based layout with generous use of whitespace to maintain a clean, uncluttered interface.
- Subtle transition animations to enhance the user experience, such as when loading documents or updating queue status.