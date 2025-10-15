'use client';

// This barrel file re-exports all the necessary Firebase hooks and providers
// from the client-provider. This simplifies imports in other parts of the app.

export { 
    FirebaseClientProvider,
    useFirebase,
    useAuth,
    useUser 
} from './client-provider';
