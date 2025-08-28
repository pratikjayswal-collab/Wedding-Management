import React, { useEffect , useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getGuestStats, getGuests } from '../store/slices/guestSlice';
import { getExpenseStats, getExpenses } from '../store/slices/expenseSlice';
import { getRequirementStats, getRequirements } from '../store/slices/requirementSlice';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function OverviewTab() {
  const dispatch = useDispatch();
  const { stats: guestStats, guests } = useSelector((state) => state.guest);
  const { stats: expenseStats, expenses } = useSelector((state) => state.expense);
  const { stats: requirementStats, requirements } = useSelector((state) => state.requirement);

  useEffect(() => {
    // Fetch stats and base lists so we can show data even if stats are unavailable
    dispatch(getGuestStats());
    dispatch(getExpenseStats());
    dispatch(getRequirementStats());
    dispatch(getGuests());
    dispatch(getExpenses());
    dispatch(getRequirements());
  }, [dispatch]);

  // Fallbacks computed from lists if stats are null/empty
  const computedGuestStats = guestStats
    ? {
        invitationSent: guestStats.invitationSent || 0,
        invitationPending: (guestStats.total || guests.length) - (guestStats.invitationSent || 0),
      }
    : {
        invitationSent: guests.filter(g => g.invitationSent).length,
        invitationPending: guests.filter(g => !g.invitationSent).length,
      };

  const totalFamilies = guests.length;
  const totalPeople = guests.reduce((sum, g) => sum + 1 + (typeof g.extraMembersCount === 'number' ? g.extraMembersCount : 0), 0);

  // toggle functionality of view charts 
  const [viewCharts, setViewCharts] = useState(false);
  const toggleCharts = () => {
    setViewCharts(!viewCharts);
  };

  const computedExpenseStats = expenseStats || {
    totalCategories: expenses.length,
    totalBudget: expenses.reduce((sum, e) => sum + (e.budget || 0), 0),
    paid: expenses.reduce((sum, e) => sum + ((e.status === 'paid' ? (e.budget || 0) : 0)), 0),
    due: expenses.reduce((sum, e) => sum + ((e.status === 'due' ? (e.budget || 0) : 0)), 0),
  };

  const computedRequirementStats = requirementStats || {
    total: requirements.length,
    pending: requirements.filter(r => r.status === 'pending').length,
    done: requirements.filter(r => r.status === 'done').length,
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Overview</h2>
        <p className="text-gray-600">A quick snapshot of your wedding planning</p>
      </div>

      {/* Guests Overview */}
      <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-800">Guests</h3>
        <div className="grid grid-cols-4 sm:grid-cols-4">
          {/* Give fixed height to StatCard titles using a wrapper div */}
          <StatCard
            title={<div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Total Guests</div>}
            value={totalPeople || 0}
            color="text-blue-600"
          />
          <StatCard
            title={<div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Total Families</div>}
            value={totalFamilies || 0}
            color="text-green-600"
          />
          <StatCard
            title={<div style={{ minHeight: 40 , display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Invitation Pending</div>}
            value={computedGuestStats.invitationPending || 0}
            color="text-yellow-600"
          />
          <StatCard
            title={<div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Invitation Sent</div>}
            value={computedGuestStats.invitationSent || 0}
            color="text-rose-600"
          />
        </div>
      </section>

      {/* Expenses Overview */}
      <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-800">Expenses</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 ">
          <StatCard title={<div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Categories</div>} value={computedExpenseStats.totalCategories || 0} color="text-gray-700" />
          <StatCard 
  title={<div className="min-h-10 flex items-center justify-center">Total Expense</div>} 
  value={<span className="text-xl">{`₹${(computedExpenseStats.totalBudget || 0).toLocaleString()}`}</span>} 
  color="text-blue-600" 
/>
  <StatCard title={<div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Paid</div>} value={`₹${(computedExpenseStats.paid || 0).toLocaleString()}`} color="text-green-600" />
  <StatCard title={<div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Due</div>} value={`₹${(computedExpenseStats.due || 0).toLocaleString()}`} color="text-yellow-600" />
        </div>

        {/* toggle to view charts */}
        <div className="flex justify-center font-semibold mt-2 sm:m-8">
          <button onClick={toggleCharts} className="text-sm text-gray-600 hover:text-gray-900">  
        {viewCharts ? "Hide Charts" : "View Charts"}
          </button>
        </div>

        {/* Charts under expense overview */}
        {viewCharts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenses.map(e => ({ category: e.category, budget: e.budget || 0 }))}
                  dataKey="budget"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {expenses.map((_, index) => (
                    <Cell key={`cell-ov-${index}`} fill={["#f43f5e","#fb7185","#f97316","#f59e0b","#84cc16","#22c55e","#14b8a6","#06b6d4","#3b82f6","#8b5cf6"][index % 10]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenses.map(e => ({ category: e.category, budget: e.budget || 0 }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="budget" name="Budget" fill="#93c5fd" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}
      </section>

      {/* Requirements Overview */}
      <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-800">Requirements & Tasks</h3>
        <div className="grid grid-cols-3 sm:grid-cols-3">
          <StatCard title="Total" value={computedRequirementStats.total || 0} color="text-gray-700" />
          <StatCard title="Pending" value={computedRequirementStats.pending || 0} color="text-yellow-600" />
          <StatCard title="Completed" value={computedRequirementStats.done || 0} color="text-green-600" />
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-gray-50 rounded-xl p-5 text-center border border-gray-100">
      <h4 className="text-sm font-medium text-gray-600 mb-2">{title}</h4>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}


