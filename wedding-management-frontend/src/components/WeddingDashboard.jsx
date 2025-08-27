import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Users, DollarSign, CheckSquare, Plus, Heart, Calendar, Phone, Mail, Menu, X } from 'lucide-react';

// Sample data
const guestData = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@email.com",
    phone: "+1 234-567-8901",
    status: "confirmed",
    plusOne: true,
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael@email.com",
    phone: "+1 234-567-8902",
    status: "pending",
    plusOne: false,
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "emily@email.com",
    phone: "+1 234-567-8903",
    status: "confirmed",
    plusOne: true,
  },
  {
    id: 4,
    name: "David Wilson",
    email: "david@email.com",
    phone: "+1 234-567-8904",
    status: "declined",
    plusOne: false,
  },
];

const expenseData = [
  { category: "Venue", amount: 8500, budget: 10000 },
  { category: "Catering", amount: 6200, budget: 7000 },
  { category: "Photography", amount: 2800, budget: 3000 },
  { category: "Flowers", amount: 1200, budget: 1500 },
  { category: "Music", amount: 800, budget: 1000 },
];

const pieData = [
  { name: "Venue", value: 8500, color: "var(--color-chart-1)" },
  { name: "Catering", value: 6200, color: "var(--color-chart-2)" },
  { name: "Photography", value: 2800, color: "var(--color-chart-3)" },
  { name: "Flowers", value: 1200, color: "var(--color-chart-4)" },
  { name: "Music", value: 800, color: "var(--color-chart-5)" },
];

const requirementsData = [
  { id: 1, task: "Book wedding venue", completed: true, dueDate: "2024-01-15" },
  { id: 2, task: "Send invitations", completed: true, dueDate: "2024-02-01" },
  { id: 3, task: "Order wedding cake", completed: false, dueDate: "2024-03-15" },
  { id: 4, task: "Book photographer", completed: true, dueDate: "2024-01-30" },
  { id: 5, task: "Choose wedding dress", completed: false, dueDate: "2024-04-01" },
  { id: 6, task: "Plan honeymoon", completed: false, dueDate: "2024-05-01" },
];

export default function WeddingDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [guests, setGuests] = useState(guestData);
  const [requirements, setRequirements] = useState(requirementsData);
  const [newGuest, setNewGuest] = useState({ name: "", email: "", phone: "", plusOne: false });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const addGuest = () => {
    if (newGuest.name && newGuest.email) {
      setGuests([
        ...guests,
        {
          id: guests.length + 1,
          ...newGuest,
          status: "pending",
        },
      ]);
      setNewGuest({ name: "", email: "", phone: "", plusOne: false });
      setDialogOpen(false);
    }
  };

  const toggleRequirement = (id) => {
    setRequirements(requirements.map((req) => (req.id === id ? { ...req, completed: !req.completed } : req)));
  };

  const totalBudget = expenseData.reduce((sum, item) => sum + item.budget, 0);
  const totalSpent = expenseData.reduce((sum, item) => sum + item.amount, 0);
  const completedTasks = requirements.filter((req) => req.completed).length;

  const navigationItems = [
    { id: "overview", label: "Overview", icon: Heart },
    { id: "guests", label: "Guest List", icon: Users },
    { id: "expenses", label: "Expenses", icon: DollarSign },
    { id: "requirements", label: "Requirements", icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-playfair font-bold text-lg text-foreground">Wedify</h1>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-primary/10"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-primary/10">
                Login
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Sign Up
              </Button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-lg">
            <nav className="px-4 py-3 space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-primary/10"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              <div className="pt-3 border-t border-white/10 flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1 text-foreground hover:bg-primary/10">
                  Login
                </Button>
                <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Sign Up
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="pt-16 px-4 sm:px-6 lg:px-8 pb-8">
        {/* Overview Section */}
        {activeSection === "overview" && (
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            <div className="pt-4">
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-foreground mb-2">Wedding Overview</h2>
              <p className="text-muted-foreground">Track your wedding planning progress</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
                  <Users className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-playfair">{guests.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {guests.filter((g) => g.status === "confirmed").length} confirmed
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
                  <DollarSign className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-playfair">${totalSpent.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">of ${totalBudget.toLocaleString()} budget</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasks Complete</CardTitle>
                  <CheckSquare className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-playfair">{completedTasks}</div>
                  <p className="text-xs text-muted-foreground">of {requirements.length} total tasks</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Days to Go</CardTitle>
                  <Calendar className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold font-playfair">127</div>
                  <p className="text-xs text-muted-foreground">Until the big day</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-playfair">Budget Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-playfair">Recent Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {requirements.slice(0, 5).map((req) => (
                      <div key={req.id} className="flex items-center gap-3">
                        <Checkbox checked={req.completed} onCheckedChange={() => toggleRequirement(req.id)} />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm truncate ${req.completed ? "line-through text-muted-foreground" : ""}`}
                          >
                            {req.task}
                          </p>
                          <p className="text-xs text-muted-foreground">Due: {req.dueDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Guests Section */}
        {activeSection === "guests" && (
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
              <div>
                <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-foreground mb-2">Guest List</h2>
                <p className="text-muted-foreground">Manage your wedding guests</p>
              </div>
              
              <Button onClick={() => setDialogOpen(true)} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Guest
              </Button>
              
              {dialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setDialogOpen(false)} />
                  <div className="relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 rounded-lg glass-card mx-4 sm:mx-0">
                    <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                      <h2 className="text-lg font-semibold leading-none tracking-tight font-playfair">Add New Guest</h2>
                      <p className="text-sm text-muted-foreground">Enter the guest details below</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={newGuest.name}
                          onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                          placeholder="Guest name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newGuest.email}
                          onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                          placeholder="guest@email.com"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={newGuest.phone}
                          onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                          placeholder="+1 234-567-8900"
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="plusOne"
                          checked={newGuest.plusOne}
                          onCheckedChange={(checked) => setNewGuest({ ...newGuest, plusOne: checked })}
                        />
                        <Label htmlFor="plusOne">Plus One</Label>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={addGuest} className="flex-1 bg-primary hover:bg-primary/90">
                          Add Guest
                        </Button>
                        <Button variant="ghost" onClick={() => setDialogOpen(false)} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {guests.map((guest) => (
                <Card key={guest.id} className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-playfair text-lg truncate pr-2">{guest.name}</CardTitle>
                      <Badge
                        variant={
                          guest.status === "confirmed"
                            ? "default"
                            : guest.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className="shrink-0"
                      >
                        {guest.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate">{guest.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span className="truncate">{guest.phone}</span>
                    </div>
                    {guest.plusOne && (
                      <div className="flex items-center gap-2 text-sm text-accent">
                        <Users className="w-4 h-4 shrink-0" />
                        Plus One
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Expenses Section */}
        {activeSection === "expenses" && (
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            <div className="pt-4">
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-foreground mb-2">Expense Management</h2>
              <p className="text-muted-foreground">Track your wedding budget and expenses</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-playfair">Budget vs Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={expenseData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value.toLocaleString()}`} />
                      <Bar dataKey="budget" fill="var(--color-chart-2)" name="Budget" />
                      <Bar dataKey="amount" fill="var(--color-chart-1)" name="Spent" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-playfair">Expense Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {expenseData.map((expense) => (
                    <div key={expense.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium truncate pr-2">{expense.category}</span>
                        <span className="text-sm text-muted-foreground shrink-0">
                          ${expense.amount.toLocaleString()} / ${expense.budget.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={(expense.amount / expense.budget) * 100} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Requirements Section */}
        {activeSection === "requirements" && (
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            <div className="pt-4">
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-foreground mb-2">Requirements</h2>
              <p className="text-muted-foreground">Track your wedding planning tasks</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-playfair">Pending Tasks</CardTitle>
                  <CardDescription>
                    {requirements.filter((req) => !req.completed).length} tasks remaining
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {requirements
                    .filter((req) => !req.completed)
                    .map((req) => (
                      <div key={req.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                        <Checkbox
                          checked={req.completed}
                          onCheckedChange={() => toggleRequirement(req.id)}
                          className="mt-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{req.task}</p>
                          <p className="text-sm text-muted-foreground">Due: {req.dueDate}</p>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-playfair">Completed Tasks</CardTitle>
                  <CardDescription>
                    {requirements.filter((req) => req.completed).length} tasks completed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {requirements
                    .filter((req) => req.completed)
                    .map((req) => (
                      <div key={req.id} className="flex items-start gap-3 p-3 rounded-lg bg-primary/10">
                        <Checkbox
                          checked={req.completed}
                          onCheckedChange={() => toggleRequirement(req.id)}
                          className="mt-0.5 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-through text-muted-foreground">{req.task}</p>
                          <p className="text-sm text-muted-foreground">Completed</p>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}