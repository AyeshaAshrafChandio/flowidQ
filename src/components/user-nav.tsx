'use client';

import { signOut } from 'firebase/auth';
import { User, Settings, LogOut, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { doc } from 'firebase/firestore';

type UserProfile = {
  displayName: string;
  email: string;
  photoURL?: string;
};

export function UserNav() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const avatarImage = PlaceHolderImages.find(img => img.id === 'avatar-1');

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      // Redirect is handled by AuthProvider
    } catch (error) {
      console.error('Logout failed', error);
    }
  };
  
  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return <Loader2 className="h-6 w-6 animate-spin" />;
  }
  
  if (!user) {
    return null;
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return name.substring(0, 2);
  };

  const displayName = userProfile?.displayName || user.displayName || 'User';
  const displayEmail = userProfile?.email || user.email;
  const displayPhotoUrl = userProfile?.photoURL || user.photoURL || avatarImage?.imageUrl;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-full justify-start gap-2 px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={displayPhotoUrl} alt={displayName} />
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
           <div className="flex flex-col items-start truncate group-data-[collapsible=icon]:hidden">
            <span className="font-medium truncate">{displayName}</span>
            <span className="text-xs text-muted-foreground truncate">{displayEmail}</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {displayEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
