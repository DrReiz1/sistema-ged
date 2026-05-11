import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Desktop } from "@/pages/Desktop";
import { AppLayout } from "@/layouts/AppLayout";
import { Home } from "@/pages/Home";
import { Documents } from "@/pages/Documents";
import { DocumentView } from "@/pages/DocumentView";
import { Upload } from "@/pages/Upload";
import { History } from "@/pages/History";
import { Groups } from "@/pages/Groups";
import { Settings } from "@/pages/Settings";
import { Profile } from "@/pages/Profile";

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Desktop} />
      <Route path="/dashboard">
        {() => (
          <AppLayout>
            <Home />
          </AppLayout>
        )}
      </Route>
      <Route path="/documents/:id">
        {(params) => (
          <AppLayout>
            <DocumentView />
          </AppLayout>
        )}
      </Route>
      <Route path="/documents">
        {() => (
          <AppLayout>
            <Documents />
          </AppLayout>
        )}
      </Route>
      <Route path="/upload">
        {() => (
          <AppLayout>
            <Upload />
          </AppLayout>
        )}
      </Route>
      <Route path="/history">
        {() => (
          <AppLayout>
            <History />
          </AppLayout>
        )}
      </Route>
      <Route path="/groups">
        {() => (
          <AppLayout>
            <Groups />
          </AppLayout>
        )}
      </Route>
      <Route path="/settings">
        {() => (
          <AppLayout>
            <Settings />
          </AppLayout>
        )}
      </Route>
      <Route path="/profile">
        {() => (
          <AppLayout>
            <Profile />
          </AppLayout>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRoutes />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
