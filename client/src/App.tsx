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
import { Tags } from "@/pages/Tags";
import { DocTypes } from "@/pages/DocTypes";
import { Customize } from "@/pages/Customize";

function Wrap({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Desktop} />
      <Route path="/dashboard">{() => <Wrap><Home /></Wrap>}</Route>
      <Route path="/documents/:id">{() => <Wrap><DocumentView /></Wrap>}</Route>
      <Route path="/documents">{() => <Wrap><Documents /></Wrap>}</Route>
      <Route path="/tags">{() => <Wrap><Tags /></Wrap>}</Route>
      <Route path="/doc-types">{() => <Wrap><DocTypes /></Wrap>}</Route>
      <Route path="/settings">{() => <Wrap><Settings /></Wrap>}</Route>
      <Route path="/customize">{() => <Wrap><Customize /></Wrap>}</Route>
      <Route path="/groups">{() => <Wrap><Groups /></Wrap>}</Route>
      <Route path="/history">{() => <Wrap><History /></Wrap>}</Route>
      <Route path="/upload">{() => <Wrap><Upload /></Wrap>}</Route>
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
