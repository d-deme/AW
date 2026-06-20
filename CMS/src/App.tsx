// CMS/src/App.tsx
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CMSProvider, useCMS } from './CMSContext';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';
import { permitsService, ticketsService, budgetsService, tourismPackagesService } from './services/api';
import { PermitRecord, SupportTicket, BudgetAllocation, TourismPackage } from './types/admin';

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useCMS();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  // State
  const [permits, setPermits] = useState<PermitRecord[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [budgets, setBudgets] = useState<BudgetAllocation[]>([]);
  const [packages, setPackages] = useState<TourismPackage[]>([]);

  // Load data after login
  useEffect(() => {
    const loadData = async () => {
      try {
        const permitsData = (await permitsService.getAll()) as PermitRecord[];
        const ticketsData = (await ticketsService.getAll()) as SupportTicket[];
        const budgetsData = (await budgetsService.getAll()) as BudgetAllocation[];
        const packagesData = (await tourismPackagesService.getAll()) as TourismPackage[];
        setPermits(permitsData);
        setTickets(ticketsData);
        setBudgets(budgetsData);
        setPackages(packagesData);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      }
    };
    loadData();
  }, []);

  // CRUD handlers (unchanged)
  const addPermit = async (p: PermitRecord) => {
    setPermits(prev => [p, ...prev]);
    try {
      await permitsService.create(p);
    } catch (err) {
      console.error(err);
      setPermits(prev => prev.filter(permit => permit.id !== p.id));
    }
  };
  const updatePermit = async (updated: PermitRecord) => {
    setPermits(prev => prev.map(p => p.id === updated.id ? updated : p));
    try {
      await permitsService.update(updated.id, updated);
    } catch (err) { console.error(err); }
  };
  const deletePermit = async (id: string) => {
    const deleted = permits.find(p => p.id === id);
    setPermits(prev => prev.filter(p => p.id !== id));
    try {
      await permitsService.delete(id);
    } catch (err) {
      console.error(err);
      if (deleted) setPermits(prev => [deleted, ...prev]);
    }
  };

  const addTicket = async (t: SupportTicket) => {
    setTickets(prev => [t, ...prev]);
    try {
      await ticketsService.create(t);
    } catch (error) {
      console.error('Failed to sync added ticket:', error);
      setTickets(prev => prev.filter(ticket => ticket.id !== t.id));
    }
  };
  const updateTicket = async (updated: SupportTicket) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
    try {
      await ticketsService.update(updated.id, updated);
    } catch (error) {
      console.error('Failed to sync updated ticket:', error);
      const original = await ticketsService.getById(updated.id) as SupportTicket;
      if (original) setTickets(prev => prev.map(t => t.id === updated.id ? original : t));
    }
  };
  const deleteTicket = async (id: string) => {
    const deleted = tickets.find(t => t.id === id);
    setTickets(prev => prev.filter(t => t.id !== id));
    try {
      await ticketsService.delete(id);
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      if (deleted) setTickets(prev => [deleted, ...prev]);
    }
  };

  const addPackage = async (pkg: TourismPackage) => {
    setPackages(prev => [pkg, ...prev]);
    try {
      await tourismPackagesService.create(pkg);
    } catch (error) {
      console.error('Failed to sync package:', error);
      setPackages(prev => prev.filter(p => p.id !== pkg.id));
    }
  };
  const updatePackage = async (updated: TourismPackage) => {
    setPackages(prev => prev.map(p => p.id === updated.id ? updated : p));
    try {
      await tourismPackagesService.update(updated.id, updated);
    } catch (error) {
      console.error('Failed to update package:', error);
      const original = await tourismPackagesService.getById(updated.id) as TourismPackage;
      if (original) setPackages(prev => prev.map(p => p.id === updated.id ? original : p));
    }
  };
  const deletePackage = async (id: string) => {
    const deleted = packages.find(p => p.id === id);
    setPackages(prev => prev.filter(p => p.id !== id));
    try {
      await tourismPackagesService.delete(id);
    } catch (error) {
      console.error('Failed to delete package:', error);
      if (deleted) setPackages(prev => [deleted, ...prev]);
    }
  };

  const syncBudgetsList = async (newList: BudgetAllocation[]) => {
    const deleted = budgets.filter(ob => !newList.some(nb => nb.id === ob.id));
    for (const budget of deleted) {
      try {
        await budgetsService.delete(budget.id);
      } catch (e) {
        console.error(`Failed to delete budget ${budget.id}:`, e);
      }
    }
    for (const nb of newList) {
      const existing = budgets.find(ob => ob.id === nb.id);
      if (!existing) {
        try {
          await budgetsService.create(nb);
        } catch (e) {
          console.error(`Failed to create budget ${nb.id}:`, e);
        }
      } else if (
        existing.sectorTitle !== nb.sectorTitle ||
        existing.weightAllocation !== nb.weightAllocation ||
        existing.approvedCapitalExpenseEtb !== nb.approvedCapitalExpenseEtb ||
        existing.assignedProject !== nb.assignedProject ||
        existing.activeMilestone !== nb.activeMilestone
      ) {
        try {
          await budgetsService.update(nb.id, nb);
        } catch (e) {
          console.error(`Failed to update budget ${nb.id}:`, e);
        }
      }
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminDashboard
              permits={permits}
              setPermits={setPermits}
              tickets={tickets}
              setTickets={setTickets}
              budgets={budgets}
              setBudgets={setBudgets}
              packages={packages}
              setPackages={setPackages}
              addPermit={addPermit}
              updatePermit={updatePermit}
              deletePermit={deletePermit}
              addTicket={addTicket}
              updateTicket={updateTicket}
              deleteTicket={deleteTicket}
              addPackage={addPackage}
              updatePackage={updatePackage}
              deletePackage={deletePackage}
              syncBudgetsList={syncBudgetsList}
            />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <CMSProvider>
      <AppContent />
    </CMSProvider>
  );
}

export default App;