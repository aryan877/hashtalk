'use client';

import { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';
import { Button } from './ui/button';
import Image from 'next/image';

function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user;

  return (
    <nav className="p-4 md:p-6 shadow-md fixed w-full top-0 bg-white z-50">
      <div className="container mx-auto flex flex-row justify-between items-center space-y-4 md:space-y-0">
        <Link href="/" className="text-xl font-bold flex flex-row gap-2">
          <Image src="/logo.png" alt="logo" width={28} height={28}/>
          HashTalk
        </Link>
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
          {session ? (
            <>
              <span className="text-base md:text-lg">
                Welcome, {user.username || user.email}
              </span>
              <Button onClick={() => signOut()} className="w-full md:w-auto">
                Logout
              </Button>
            </>
          ) : (
            <Link href="/sign-in">
              <Button className="w-full md:w-auto">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
