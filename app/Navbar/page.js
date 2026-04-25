"use client";

import Image from "next/image";
import React, { useState } from "react";
import { ModeToggle } from "../../components/ModeToggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookText, Menu, MenuIcon, UserCircle, X, XIcon } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
  const [Sm_Open, setSm_Open] = useState(false);
  const { data: session } = useSession();
  return (
    <nav className="w-full z-10  p-2  ">
      <div className="max-w-6xl md:w-[70vw]  rounded-md mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center  group relative">
        <Link href="/">
          <Image
            alt="logo of skillSync"
            width={36}
            height={36}
            src="/images/c-square.png"
            className="dark:invert"
          />
          </Link>  
          <span className="text-2xl  font-extrabold tracking-tight opacity-0 group-hover:opacity-100 delay-100 transition-all duration-150 group-hover:translate-x-2  text-zinc-800 dark:text-white">
            Welcome 
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 text-zinc-700 dark:text-zinc-200 font-medium">
          <Link
            href="/developer"
            className="hover:text-blue-600 hover:underline transition duration-200"
          >
            Developer
          </Link>
          <Link
            href="#features"
            className="hover:text-blue-600 hover:underline transition duration-200"
          >
            Features
          </Link>
         
                  {session?.user ? (
            <>
              <span className="flex items-center text-primary font-pixel">
                <UserCircle className="mr-2" />
                {session.user.name?.split(" ")[0] || session.user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/Login" })}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/Login">
              <Button size="sm" variant="outline">
                Login
              </Button>
            </Link>
          )}
  
          <ModeToggle />
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSm_Open(!Sm_Open)}
          >
            {Sm_Open ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {Sm_Open && (
        <div className="md:hidden flex flex-col items-center space-y-4 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 shadow-md py-4 px-6 animate-fade-in-down">
          <Link
            href="/developer"
            className="w-full text-center py-2 border-b hover:text-blue-600 hover:underline transition"
          >
            Developer
          </Link>
          <Link
            href="#features"
            className="w-full text-center py-2 border-b hover:text-blue-600 hover:underline transition"
          >
            Features
          </Link>
         
          {session?.user && (
            <span className="font-pixel text-blue-500">
              {session.user.name?.split(" ")[0] || session.user.email}
            </span>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
