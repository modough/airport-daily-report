import React from "react";

import { Button } from "./ui/button";
import { SERVICES } from "@/lib/services";
import { FileText, Calendar, Download, Menu } from "lucide-react";
import logo from "../assets/xcr_airport.webp";
import { Link } from "@tanstack/react-router";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "./ui/drawer";

function Header({ service }: { service: string }) {
  return (
    <header className="border-b-[3px] border-red-500  bg-white sticky top-0 z-10">
      
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="XCR Airport Logo" className="h-10 w-24 rounded-sm object-cover" />
            <h1 className="text-md font-bold tracking-tight text-[#002a55] uppercase">Briefing / Remise de poste</h1>
          </div>
          <nav className="hidden sm:flex mt-3 flex-wrap gap-6">
            {SERVICES.map((s) => (
              <Button
              className="uppercase"
                key={s.key}
                asChild
                size="default"
                variant={s.key === service ? "custom" : "outline"}
              >
                <Link to={s.path}>{s.label}</Link>
              </Button>
            ))}
          </nav>
          {/* Mobile burger menu */}
          <div className="sm:hidden">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu />
                </Button>
              </DrawerTrigger>

              <DrawerContent>
                <DrawerHeader>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <img src={logo} alt="XCR Airport Logo" className="h-8 w-20 rounded-sm object-cover" />
                      <DrawerTitle>Briefing / Remise de poste</DrawerTitle>
                    </div>
                    <DrawerClose asChild>
                      <Button variant="ghost" size="icon">
                        ✕
                      </Button>
                    </DrawerClose>
                  </div>
                  <DrawerDescription>Navigation</DrawerDescription>
                </DrawerHeader>

                <div className="flex flex-col gap-2 p-4">
                  {SERVICES.map((s) => (
                    <Button className="uppercase" key={s.key} asChild variant={s.key === service ? "custom" : "outline"} >
                      <Link to={s.path} >{s.label}</Link>
                    </Button>
                  ))}
                </div>

                <DrawerFooter>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
