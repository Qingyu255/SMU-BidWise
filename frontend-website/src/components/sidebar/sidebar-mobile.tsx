'use client';

import { SidebarItems } from '@/types';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '../ui/sheet';
import { Button } from '../ui/button';
import { LogOut, Menu, MoreHorizontal, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { SidebarButtonSheet as SidebarButton } from './sidebar-button';
import { usePathname } from 'next/navigation';
import { Separator } from '../ui/separator';
import { Drawer, DrawerContent, DrawerTrigger } from '../ui/drawer';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import Image from 'next/image';

interface SidebarMobileProps {
  sidebarItems: SidebarItems;
}

export function SidebarMobile(props: SidebarMobileProps) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size='icon' variant='ghost' className='fixed top-3 left-3 border-2'>
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='px-3 py-4 bg-inherit'>
        <SheetHeader className='flex flex-row justify-between items-center space-y-0'>
          <Link href={"/"}>
            <SidebarButton className='px-0'>
              <div className='flex justify-start items-center'>
                <Image
                  className='inline'
                  src="/icon.png"
                  alt="logo"
                  width={35}
                  height={35}
                />
                <span className='text-lg font-semibold text-foreground mx-2'>SMU BidWise</span>
              </div>
            </SidebarButton>
          </Link>
        </SheetHeader>
        <div className='h-full'>
          <div className='mt-5 flex flex-col w-full gap-1'>
            {props.sidebarItems.links.map((link, idx) => (
              <Link key={idx} href={link.href}>
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
          <div className='absolute w-full bottom-4 px-1 left-0'>
            <Separator className='absolute -top-3 left-0 w-full' />
            <SignedOut>
                <SignInButton>
                  <Button className='w-full p-0'>
                    <SidebarButton className='w-full flex justify-center hover:text-inherit hover:bg-slate-800'>
                      Sign In
                    </SidebarButton>
                  </Button>
                </SignInButton>
            </SignedOut>
            <SignedIn>
              <Drawer>
                    <div className='flex justify-between items-center w-full'>
                      <div className='flex pl-2 gap-2'>
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
              </Drawer>
            </SignedIn>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
