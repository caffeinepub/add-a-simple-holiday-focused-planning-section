import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NNSProgressTab from './tabs/NNSProgressTab';
import FinancesTab from './tabs/FinancesTab';
import HorseBetsTab from './tabs/HorseBetsTab';
import TodoListTab from './tabs/TodoListTab';
import HabitTrackerTab from './tabs/HabitTrackerTab';
import PlanningTab from './tabs/PlanningTab';

type TabType = 'nns' | 'finances' | 'bets' | 'todo' | 'habits' | 'planning';

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<TabType>('nns');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const tabs = [
    { id: 'nns' as TabType, label: 'NNS Progress' },
    { id: 'finances' as TabType, label: 'Finances' },
    { id: 'bets' as TabType, label: 'Horse Bets' },
    { id: 'todo' as TabType, label: 'To-Do List' },
    { id: 'habits' as TabType, label: 'Habit Tracker' },
    { id: 'planning' as TabType, label: 'Planning' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'nns':
        return <NNSProgressTab />;
      case 'finances':
        return <FinancesTab />;
      case 'bets':
        return <HorseBetsTab />;
      case 'todo':
        return <TodoListTab />;
      case 'habits':
        return <HabitTrackerTab />;
      case 'planning':
        return <PlanningTab />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ease-in-out flex-shrink-0 ${
          isSidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden hidden md:block`}
      >
        <Sidebar className="border-r border-border bg-card/80 backdrop-blur-xl h-full">
          <SidebarHeader className="border-b border-border p-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold truncate">
                Kians Cloud
              </h2>
              <p className="text-xs text-muted-foreground truncate">{userProfile?.name || 'User'}</p>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarMenu>
              {tabs.map((tab) => (
                <SidebarMenuItem key={tab.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(tab.id)}
                    isActive={activeTab === tab.id}
                    className="w-full justify-start h-12"
                  >
                    <span className="font-medium truncate">{tab.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-border p-4 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full justify-start"
            >
              <span className="truncate">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-destructive hover:text-destructive"
            >
              <span className="truncate">Logout</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile Header with Tab Selector */}
        <div className="p-3 sm:p-4 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0 flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex"
          >
            Menu
          </Button>
          
          {/* Mobile Tab Selector - Always visible on small screens */}
          <div className="flex-1 md:hidden">
            <Select value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tabs.map((tab) => (
                  <SelectItem key={tab.id} value={tab.id}>
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Actions */}
          <div className="flex gap-2 md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-destructive hover:text-destructive"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
            {renderTabContent()}
          </div>
          
          <footer className="mt-auto p-4 sm:p-6 text-center text-sm text-muted-foreground border-t border-border bg-card/50 backdrop-blur-sm">
            © {new Date().getFullYear()}. Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}
