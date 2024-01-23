'use client';

import { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';
import { Button } from './ui/button';

function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user;

  return (
    <nav className="p-4 md:p-6 shadow-md fixed w-full top-0 h-20 bg-white z-50">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <a href="#" className="text-xl font-bold mb-4 md:mb-0">
          HashTalk
        </a>
        {session ? (
          <>
            <span className="mr-4">Welcome, {user.username || user.email}</span>
            <Button onClick={() => signOut()} className="w-full md:w-auto">
              Logout
            </Button>
          </>
        ) : (
          <Link href="/sign-in">
            <button className="w-full md:w-auto">Login</button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
