import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Camera, 
  Search, 
  Calendar, 
  Tag, 
  Trash2, 
  LogOut, 
  LogIn, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Package,
  Smartphone,
  Pill,
  Utensils,
  Sparkles,
  Loader2,
  X,
  ChevronRight
} from 'lucide-react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  orderBy,
  Timestamp,
  getDocFromServer
} from 'firebase/firestore';
import { format, isAfter, isBefore, addDays, differenceInDays, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './firebase';
import { scanReceipt, ExtractedWarranty } from './services/geminiService';
import { cn } from './lib/utils';
import { AdBanner } from './components/AdBanner';

// --- Types ---
interface Item {
  id: string;
  uid: string;
  name: string;
  category: 'electronics' | 'medicine' | 'food' | 'cosmetics';
  expiryDate: string;
  purchaseDate?: string;
  notes?: string;
  createdAt: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Package },
  { id: 'electronics', label: 'Electronics', icon: Smartphone },
  { id: 'medicine', label: 'Medicine', icon: Pill },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'cosmetics', label: 'Cosmetics', icon: Sparkles },
] as const;

type CategoryType = typeof CATEGORIES[number]['id'];

// --- Components ---

const CategoryIcon = ({ category, className }: { category: string, className?: string }) => {
  const cat = CATEGORIES.find(c => c.id === category);
  const Icon = cat?.icon || Package;
  return <Icon className={className} />;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  
  // Form state
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'electronics' as Item['category'],
    expiryDate: '',
    purchaseDate: '',
    notes: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    const q = query(
      collection(db, 'items'),
      where('uid', '==', user.uid),
      orderBy('expiryDate', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Item[];
      setItems(newItems);
    }, (error) => {
      console.error("Firestore error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Test connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, []);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        setAuthError("This domain is not authorized in Firebase. Please add it to 'Authorized Domains' in the Firebase Console.");
      } else {
        setAuthError(error.message || "An error occurred during sign in.");
      }
    }
  };

  const handleLogout = () => signOut(auth);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newItem.name || !newItem.expiryDate) return;

    try {
      await addDoc(collection(db, 'items'), {
        ...newItem,
        uid: user.uid,
        createdAt: new Date().toISOString()
      });
      setNewItem({ name: '', category: 'electronics', expiryDate: '', purchaseDate: '', notes: '' });
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'items', id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const result = await scanReceipt(base64);
      if (result) {
        setNewItem({
          name: result.name,
          category: result.category,
          expiryDate: result.expiryDate,
          purchaseDate: result.purchaseDate || '',
          notes: 'Auto-extracted from receipt'
        });
        setIsAdding(true);
      }
      setScanLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = filter === 'all' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = parseISO(expiryDate);
    const daysLeft = differenceInDays(expiry, today);

    if (daysLeft < 0) return { label: 'Expired', color: 'text-red-500 bg-red-50', icon: AlertTriangle };
    if (daysLeft <= 7) return { label: `Expiring soon (${daysLeft}d)`, color: 'text-orange-500 bg-orange-50', icon: Clock };
    return { label: `Valid (${daysLeft}d)`, color: 'text-emerald-500 bg-emerald-50', icon: CheckCircle2 };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-stone-900 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-stone-200">
          <Clock className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-serif italic mb-4 text-stone-900">ExpiryGuard</h1>
        <p className="text-stone-500 max-w-xs mb-12 leading-relaxed">
          The elegant way to track your warranties and expiration dates.
        </p>

        {authError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm max-w-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-1 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Sign-in Error</span>
            </div>
            {authError}
          </div>
        )}

        <button 
          onClick={handleLogin}
          className="flex items-center gap-3 px-8 py-4 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-all active:scale-95 shadow-lg shadow-stone-200"
        >
          <LogIn className="w-5 h-5" />
          <span className="font-medium">Sign in with Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-stone-900 font-sans selection:bg-stone-200">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FDFCFB]/80 backdrop-blur-md border-b border-stone-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-serif italic tracking-tight">ExpiryGuard</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-900"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 pb-32">
        {/* Stats / Hero */}
        <div className="mb-12">
          <h2 className="text-3xl font-serif italic mb-2">Hello, {user.displayName?.split(' ')[0]}</h2>
          <p className="text-stone-500">You have {items.length} items being tracked.</p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-6 mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
            <input 
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all shadow-sm"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all border",
                  filter === cat.id 
                    ? "bg-stone-900 text-white border-stone-900 shadow-md" 
                    : "bg-white text-stone-500 border-stone-100 hover:border-stone-200"
                )}
              >
                <cat.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Item List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200"
              >
                <Package className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                <p className="text-stone-400">No items found</p>
              </motion.div>
            ) : (
              <>
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-4"
                  >
                    <div className="group bg-white p-5 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                      <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                        <CategoryIcon category={item.category} className="w-7 h-7" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-stone-900 truncate mb-1">{item.name}</h3>
                        <div className="flex items-center gap-3">
                          <span className={cn("text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md", getStatus(item.expiryDate).color)}>
                            {getStatus(item.expiryDate).label}
                          </span>
                          <span className="text-xs text-stone-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(parseISO(item.expiryDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-stone-200 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Insert ad after every 5 items */}
                    {(index + 1) % 5 === 0 && (
                      <div className="py-4">
                        <p className="text-[9px] uppercase tracking-widest text-stone-300 mb-2 ml-4">Sponsored</p>
                        <AdBanner slot="1234567890" className="rounded-2xl" />
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {/* Final ad at the bottom if there are items */}
                {filteredItems.length > 0 && (
                  <div className="py-8">
                    <p className="text-[9px] uppercase tracking-widest text-stone-300 mb-2 ml-4">Sponsored</p>
                    <AdBanner slot="0987654321" className="rounded-2xl" />
                  </div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-stone-900/90 backdrop-blur-xl rounded-full shadow-2xl border border-white/10 z-40">
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={scanLoading}
          className="p-3 text-white/70 hover:text-white transition-colors disabled:opacity-50"
        >
          {scanLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
        </button>
        <div className="w-px h-6 bg-white/10" />
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white text-stone-900 rounded-full font-bold text-sm active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif italic">New Tracker</h2>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-stone-100 rounded-full">
                  <X className="w-6 h-6 text-stone-400" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Item Name</label>
                  <input 
                    required
                    type="text"
                    value={newItem.name}
                    onChange={e => setNewItem({...newItem, name: e.target.value})}
                    placeholder="e.g. iPhone 15 Pro, Milk, Paracetamol"
                    className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-stone-200 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Category</label>
                    <select 
                      value={newItem.category}
                      onChange={e => setNewItem({...newItem, category: e.target.value as any})}
                      className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-stone-200 transition-all appearance-none"
                    >
                      {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Expiry/Warranty</label>
                    <input 
                      required
                      type="date"
                      value={newItem.expiryDate}
                      onChange={e => setNewItem({...newItem, expiryDate: e.target.value})}
                      className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-stone-200 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Notes (Optional)</label>
                  <textarea 
                    value={newItem.notes}
                    onChange={e => setNewItem({...newItem, notes: e.target.value})}
                    placeholder="Where is the bill kept? Dosage instructions?"
                    className="w-full px-5 py-4 bg-stone-50 border-none rounded-2xl focus:ring-2 focus:ring-stone-200 transition-all h-24 resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-stone-900 text-white rounded-3xl font-bold shadow-xl shadow-stone-200 active:scale-[0.98] transition-all"
                >
                  Save Tracker
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scan Overlay */}
      <AnimatePresence>
        {scanLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-stone-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative w-32 h-32 mb-8">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-white/10 border-t-white rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-serif italic text-white mb-2">Analyzing Receipt</h3>
            <p className="text-white/50 max-w-xs">Our AI is extracting warranty dates and product details for you...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
