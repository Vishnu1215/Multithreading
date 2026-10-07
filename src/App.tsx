import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';

const LandingPage = lazy(() => import('@/pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LearnPage = lazy(() => import('@/pages/LearnPage').then(m => ({ default: m.LearnPage })));
const SimulatorPage = lazy(() => import('@/pages/SimulatorPage').then(m => ({ default: m.SimulatorPage })));
const CpuPage = lazy(() => import('@/pages/CpuPage').then(m => ({ default: m.CpuPage })));
const SchedulerPage = lazy(() => import('@/pages/SchedulerPage').then(m => ({ default: m.SchedulerPage })));
const LifecyclePage = lazy(() => import('@/pages/LifecyclePage').then(m => ({ default: m.LifecyclePage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ComparePage = lazy(() => import('@/pages/ComparePage').then(m => ({ default: m.ComparePage })));
const TimelinePage = lazy(() => import('@/pages/TimelinePage').then(m => ({ default: m.TimelinePage })));
const ResourcesPage = lazy(() => import('@/pages/ResourcesPage').then(m => ({ default: m.ResourcesPage })));
const DeadlockPage = lazy(() => import('@/pages/DeadlockPage').then(m => ({ default: m.DeadlockPage })));
const SyncPage = lazy(() => import('@/pages/SyncPage').then(m => ({ default: m.SyncPage })));
const MonitorPage = lazy(() => import('@/pages/MonitorPage').then(m => ({ default: m.MonitorPage })));
const GraphsPage = lazy(() => import('@/pages/GraphsPage').then(m => ({ default: m.GraphsPage })));
const CaseStudyPage = lazy(() => import('@/pages/CaseStudyPage').then(m => ({ default: m.CaseStudyPage })));
const QuizPage = lazy(() => import('@/pages/QuizPage').then(m => ({ default: m.QuizPage })));
const ReportPage = lazy(() => import('@/pages/ReportPage').then(m => ({ default: m.ReportPage })));
const HelpPage = lazy(() => import('@/pages/HelpPage').then(m => ({ default: m.HelpPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const FallbackLoader: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
    <div className="w-12 h-12 rounded-2xl border-2 border-primary border-t-transparent animate-spin" />
    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
      Allocating Task Context...
    </span>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Suspense fallback={<FallbackLoader />}><LandingPage /></Suspense> },
      { path: 'learn', element: <Suspense fallback={<FallbackLoader />}><LearnPage /></Suspense> },
      { path: 'simulator', element: <Suspense fallback={<FallbackLoader />}><SimulatorPage /></Suspense> },
      { path: 'cpu', element: <Suspense fallback={<FallbackLoader />}><CpuPage /></Suspense> },
      { path: 'scheduler', element: <Suspense fallback={<FallbackLoader />}><SchedulerPage /></Suspense> },
      { path: 'lifecycle', element: <Suspense fallback={<FallbackLoader />}><LifecyclePage /></Suspense> },
      { path: 'dashboard', element: <Suspense fallback={<FallbackLoader />}><DashboardPage /></Suspense> },
      { path: 'compare', element: <Suspense fallback={<FallbackLoader />}><ComparePage /></Suspense> },
      { path: 'timeline', element: <Suspense fallback={<FallbackLoader />}><TimelinePage /></Suspense> },
      { path: 'resources', element: <Suspense fallback={<FallbackLoader />}><ResourcesPage /></Suspense> },
      { path: 'deadlock', element: <Suspense fallback={<FallbackLoader />}><DeadlockPage /></Suspense> },
      { path: 'sync', element: <Suspense fallback={<FallbackLoader />}><SyncPage /></Suspense> },
      { path: 'monitor', element: <Suspense fallback={<FallbackLoader />}><MonitorPage /></Suspense> },
      { path: 'graphs', element: <Suspense fallback={<FallbackLoader />}><GraphsPage /></Suspense> },
      { path: 'case-study', element: <Suspense fallback={<FallbackLoader />}><CaseStudyPage /></Suspense> },
      { path: 'quiz', element: <Suspense fallback={<FallbackLoader />}><QuizPage /></Suspense> },
      { path: 'report', element: <Suspense fallback={<FallbackLoader />}><ReportPage /></Suspense> },
      { path: 'help', element: <Suspense fallback={<FallbackLoader />}><HelpPage /></Suspense> },
      { path: '*', element: <Suspense fallback={<FallbackLoader />}><NotFoundPage /></Suspense> },
    ],
  },
]);

export const App: React.FC = () => {
  return <RouterProvider router={router} />;
};
