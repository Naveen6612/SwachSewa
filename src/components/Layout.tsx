import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenuButton,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  MapPin,
  FileText,
  Trophy,
  Users,
  Settings,
  LogOut,
  Leaf,
  Recycle,
  Camera,
  Building,
} from "lucide-react";
import { Link } from "react-router-dom";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: BookOpen },
  { name: "Training", href: "/training", icon: BookOpen },
  { name: "Report Waste", href: "/report", icon: Camera },
  { name: "Facilities", href: "/facilities", icon: Building },
  // { name: "Green Champions", href: "/champions", icon: Users },
  { name: "Incentives", href: "/incentives", icon: Trophy },
  { name: "Profile", href: "/profile", icon: Settings },
];

export default function Layout() {
  const { user, signOut, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-full p-2">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <Recycle className="h-5 w-5 text-primary" />
              <span className="font-bold text-sidebar-foreground">
                Swach Sewa
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                  >
                    <Link to={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-4">
            <Button
              variant="ghost"
              onClick={signOut}
              className="w-full justify-start text-sidebar-foreground hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold text-card-foreground">
                Waste Management System
              </h1>
            </div>
          </header>

          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
