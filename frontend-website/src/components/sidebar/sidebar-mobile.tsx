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

interface SidebarMobileProps {
  sidebarItems: SidebarItems;
}

export function SidebarMobile(props: SidebarMobileProps) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size='icon' variant='ghost' className='fixed top-3 left-3'>
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='px-3 py-4 bg-inherit'>
        <SheetHeader className='flex flex-row justify-between items-center space-y-0'>
          <span className='text-lg font-semibold text-foreground mx-3'>
            <Link href={"/"}>SMU BidWise</Link>
          </span>
          <SheetClose asChild>
            <Button className='h-7 w-7 p-0' variant='ghost'>
              <X size={15} />
            </Button>
          </SheetClose>
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
                  <Button className='w-full'>
                    Sign In
                  </Button>
                </SignInButton>
            </SignedOut>
            <SignedIn>
              <Drawer>
                {/* <DrawerTrigger asChild> */}
                  {/* <Button variant='ghost' className='w-full justify-start'> */}
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
                        
                        {/* <Avatar className='h-5 w-5'>
                          <AvatarImage src='https://github.com/shadcn.png' />
                          <AvatarFallback>Kylean</AvatarFallback>
                        </Avatar>
                        <span>Kylean</span> */}
                      </div>
                      {/* <MoreHorizontal size={20} /> */}
                    </div>
                  {/* </Button> */}
                {/* </DrawerTrigger>
                <DrawerContent className='mb-2 p-2'>
                  <div className='flex flex-col space-y-2 mt-2'>
                    <Link href='/'>
                      <SidebarButton size='sm' icon={Settings} className='w-full'>
                        Account Settings
                      </SidebarButton>
                    </Link>
                    <SidebarButton size='sm' icon={LogOut} className='w-full'>
                      Log Out
                    </SidebarButton>
                  </div>
                </DrawerContent> */}
              </Drawer>
            </SignedIn>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
