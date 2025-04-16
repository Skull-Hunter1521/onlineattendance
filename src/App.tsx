import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { UserPlus, LogIn, LogOut, Check, X, Eye } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

type User = {
  id: string;
  email: string;
};

type AttendanceEntry = {
  id: string;
  enrollment: string;
  division: string;
  status: 'Present' | 'Absent';
  date: string;
  created_at: string;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'login' | 'register' | 'attendance'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [division, setDivision] = useState('A');
  const [enrollment, setEnrollment] = useState('');
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [showEntries, setShowEntries] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      setView('attendance');
      loadEntries();
    }
  }, [user, division]);

  const loadEntries = async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('division', division)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load entries');
    } else {
      setEntries(data);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error('Login failed');
    } else {
      toast.success('Logged in successfully');
      setEmail('');
      setPassword('');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast.error('Registration failed');
    } else {
      toast.success('Registration successful! Please check your email.');
      setView('login');
      setEmail('');
      setPassword('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('login');
    toast.success('Logged out successfully');
  };

  const markAttendance = async (status: 'Present' | 'Absent') => {
    if (!enrollment) {
      toast.error('Please enter enrollment number');
      return;
    }

    if (!user) {
      toast.error('User not logged in');
      return;
    }

    const { error } = await supabase.from('attendance').insert([
      {
        enrollment,
        division,
        status,
        date: new Date().toISOString().split('T')[0],
        user_id: user.id,
      },
    ]);

    if (error) {
      toast.error('Failed to mark attendance');
    } else {
      toast.success(`Marked ${enrollment} as ${status}`);
      setEnrollment('');
      loadEntries();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="py-6 px-4 md:px-8 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Students Attendance System</h1>
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-300 hover:text-white"
            >
              <LogOut size={20} />
              Logout
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {!user ? (
          <div className="max-w-md mx-auto">
            {/* Login/Register Forms */}
            {view === 'login' ? (
              <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2"
                  >
                    <LogIn size={20} />
                    Login
                  </button>
                </form>
                <button
                  onClick={() => setView('register')}
                  className="w-full mt-4 py-2 text-gray-300 hover:text-white flex items-center justify-center gap-2"
                >
                  <UserPlus size={20} />
                  Register New User
                </button>
              </div>
            ) : (
              <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Register</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded flex items-center justify-center gap-2"
                  >
                    <UserPlus size={20} />
                    Register
                  </button>
                </form>
                <button
                  onClick={() => setView('login')}
                  className="w-full mt-4 py-2 text-gray-300 hover:text-white"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Attendance Management */}
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Attendance Management</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Division</label>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                    >
                      <option value="A">Division A</option>
                      <option value="F">Division F</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Enrollment Number</label>
                    <input
                      type="text"
                      value={enrollment}
                      onChange={(e) => setEnrollment(e.target.value)}
                      className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500"
                      placeholder="Enter enrollment number"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => markAttendance('Present')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    Present
                  </button>
                  <button
                    onClick={() => markAttendance('Absent')}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded flex items-center justify-center gap-2"
                  >
                    <X size={20} />
                    Absent
                  </button>
                </div>

                <button
                  onClick={() => setShowEntries(!showEntries)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded flex items-center justify-center gap-2"
                >
                  <Eye size={20} />
                  {showEntries ? 'Hide Entries' : 'View Entries'}
                </button>

                {showEntries && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">Attendance Entries</h3>
                    <div className="space-y-4">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="bg-gray-700 p-4 rounded flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">Enrollment: {entry.enrollment}</p>
                            <p className="text-sm text-gray-300">Date: {entry.date}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded ${
                              entry.status === 'Present'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {entry.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;