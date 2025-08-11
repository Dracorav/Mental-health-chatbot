'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, MessageSquare, Smile, Heart, Languages, LogIn, LogOut, UserPlus, UserCircle, Loader2 } from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/hooks/use-language';
import { UserProvider, useUser } from '@/hooks/use-user';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { T } from './T';
import { useToast } from '@/hooks/use-toast';

const menuItems = [
  { href: '/', label: 'Chat', icon: MessageSquare },
  { href: '/relaxation', label: 'Relaxation', icon: Smile },
  { href: '/feedback', label: 'Feedback', icon: Heart },
];

function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Languages className="h-5 w-5" />
      <div className="group-data-[collapsible=icon]:hidden">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-full border-0 bg-transparent focus:ring-0">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="hi">हिन्दी</SelectItem>
            <SelectItem value="bn">বাংলা</SelectItem>
            <SelectItem value="ta">தமிழ்</SelectItem>
            <SelectItem value="te">తెలుగు</SelectItem>
            <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="de">Deutsch</SelectItem>
            <SelectItem value="ja">日本語</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function AuthSection() {
    const { user, loading } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast({
                title: 'Logged Out',
                description: "You have been successfully logged out."
            })
            router.push('/');
        } catch (error) {
            console.error("Logout error", error);
            toast({
                title: 'Logout Failed',
                description: 'There was an error logging you out. Please try again.',
                variant: 'destructive',
            })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-2">
            {user ? (
                <div className="flex flex-col gap-2 items-center group-data-[collapsible=icon]:items-start">
                    <div className="flex items-center gap-3 w-full">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.photoURL || undefined} />
                            <AvatarFallback>
                                <UserCircle className="h-6 w-6" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
                            <p className="font-semibold truncate">{user.displayName || 'User'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </div>
                    <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
                        <LogOut className="h-5 w-5 mr-2" />
                        <span className="group-data-[collapsible=icon]:hidden"><T>Logout</T></span>
                    </Button>
                </div>
            ) : (
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="justify-start">
                            <Link href="/login">
                                <LogIn className="h-5 w-5" />
                                <span className="group-data-[collapsible=icon]:hidden"><T>Login</T></span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="justify-start">
                            <Link href="/signup">
                                <UserPlus className="h-5 w-5" />
                                <span className="group-data-[collapsible=icon]:hidden"><T>Sign Up</T></span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            )}
        </div>
    )
}

function AppShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader className="p-0">
          <div className="flex h-14 items-center gap-2 px-3">
            <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
              <Bot className="h-7 w-7" />
            </Link>
            <h1 className="text-xl font-bold text-foreground font-headline group-data-[collapsible=icon]:hidden">
              <T>MindfulMe</T>
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map(item => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  className="justify-start"
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      <T>{item.label}</T>
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-2">
             <LanguageSelector />
          </div>
          <SidebarSeparator />
          <AuthSection />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:hidden">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Bot className="h-6 w-6 text-primary" />
            <span className="">MindfulMe</span>
          </Link>
          <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
    return (
      <UserProvider>
        <LanguageProvider>
            <AppShellContent>{children}</AppShellContent>
        </LanguageProvider>
      </UserProvider>
    )
}
