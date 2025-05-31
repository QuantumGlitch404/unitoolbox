"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  Home,
  Settings2,
  LifeBuoy,
  ChevronDown,
  Menu,
  FileText,
  Wand2,
  Image as ImageIcon,
  Film,
  Database,
  type LucideIcon,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/icons';
import { tools, type ToolCategory, toolCategories } from '@/lib/tools';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  subItems?: NavItem[];
  isCategory?: boolean;
}

const categoryIcons: Record<ToolCategory, LucideIcon> = {
  'Image': ImageIcon,
  'Document & Data': Database,
  'Text & AI': Wand2,
  'Media': Film,
  'Converter': Settings2,
};

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  {
    href: '/tools',
    label: 'All Tools',
    icon: Settings2,
    isCategory: true,
    subItems: toolCategories.map(category => ({
      href: `/tools?category=${encodeURIComponent(category)}`,
      label: category,
      icon: categoryIcons[category] || Settings2,
    })),
  },
  {
    href: '/support',
    label: 'Support',
    icon: LifeBuoy,
    subItems: [
      { href: '/support/faq', label: 'FAQ', icon: FileText },
      { href: '/support/contact', label: 'Contact Us', icon: FileText },
    ],
  },
];


export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="border-r" collapsible="icon">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8 text-primary" />
            <h1 className="font-headline text-xl font-semibold group-data-[collapsible=icon]:hidden">
              UniToolBox
            </h1>
          </Link>
        </SidebarHeader>
        <ScrollArea className="flex-grow">
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  {item.subItems ? (
                    <SidebarGroup>
                       <SidebarMenuButton
                        href={item.isCategory ? undefined : item.href}
                        asChild={!item.isCategory}
                        className="justify-between"
                        isActive={pathname.startsWith(item.href) && item.href !== '/'}
                        tooltip={item.label}
                      >
                        {item.isCategory ? (
                           <div className="flex items-center gap-2 w-full">
                            <item.icon />
                            <span className="flex-grow">{item.label}</span>
                            <ChevronDown className="h-4 w-4 shrink-0 group-data-[collapsible=icon]:hidden" />
                          </div>
                        ) : (
                          <Link href={item.href} className="flex items-center gap-2 w-full">
                            <item.icon />
                            <span className="flex-grow">{item.label}</span>
                             <ChevronDown className="h-4 w-4 shrink-0 group-data-[collapsible=icon]:hidden" />
                          </Link>
                        )}
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => (
                          <SidebarMenuItem key={subItem.href}>
                            <SidebarMenuSubButton
                              href={subItem.href}
                              asChild
                              isActive={pathname === subItem.href}
                            >
                              <Link href={subItem.href} className="flex items-center gap-2">
                                <subItem.icon className="h-3.5 w-3.5" />
                                <span>{subItem.label}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenuSub>
                    </SidebarGroup>
                  ) : (
                    <SidebarMenuButton
                      href={item.href}
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </ScrollArea>
        <SidebarFooter className="p-4">
           {/* Footer content if any, e.g. settings, user profile (collapsed) */}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" /> {/* Hamburger for mobile */}
            <Link href="/" className="flex items-center gap-2 md:hidden">
                <Logo className="w-7 h-7 text-primary" />
                <span className="font-headline text-lg font-semibold">UniToolBox</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="@shadcn" data-ai-hint="user avatar" />
                    <AvatarFallback>UT</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">UniToolBox User</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      user@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {children}
        </main>
        
        <footer className="border-t p-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} UniToolBox. All rights reserved.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
