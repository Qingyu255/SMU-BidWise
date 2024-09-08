'use client';

import { SidebarButton } from './sidebar-button';
import { SidebarItems } from '@/types';
import Link from 'next/link';
import { Separator } from '../ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { LogOut, MoreHorizontal, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
// import { currentUser } from '@clerk/nextjs/server'


interface SidebarDesktopProps {
  sidebarItems: SidebarItems;
}

export function SidebarDesktop(props: SidebarDesktopProps) {
  const pathname = usePathname();

  return (
    <aside className='w-[270px] max-w-xs h-screen fixed left-0 top-0 z-40 border-r'>
      <div className='h-full px-3 py-4'>
        <Link href={"/"} className='mx-3 text-lg font-semibold text-foreground'>SMU BidWise</Link>
        <div className='mt-5'>
          <div className='flex flex-col gap-1 w-full'>
            {props.sidebarItems.links.map((link: any, index: number) => (
              <Link key={index} href={link.href}>
                <SidebarButton
                  variant={pathname === link.href ? 'secondary' : 'ghost'}
                  icon={link.icon}
                  className='w-full'
                >
                  {link.label}
                </SidebarButton>
              </Link>
            ))}
            {props.sidebarItems.extras}
          </div>
          <div className='absolute left-0 bottom-3 w-full px-3'>
            <Separator className='absolute -top-3 left-0 w-full' />
            <SignedOut>
                <SignInButton>
                  <Button className='w-full'>
                    Sign In
                  </Button>
                </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className='flex justify-between items-center w-full'>
                <div className='flex gap-2'>
                  <UserButton 
                    appearance={{
                      elements: {
                        userButtonBox: {
                          flexDirection: "row-reverse",
                        },
                      },
                    }}
                    showName
                  />
                </div>
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </aside>
  );
}
