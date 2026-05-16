import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  MapPin, 
  Calendar, 
  MessageCircle, 
  ChevronRight, 
  X, 
  Send, 
  BookOpen, 
  Wind, 
  Sun, 
  Droplets,
  ChevronLeft,
  User,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { FARMING_GUIDES, CROP_DATA } from './constants';
import { FarmingGuide, ChatMessage, Crop } from './types';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  OperationType, 
  handleFirestoreError,
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  testConnection
} from './lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState<'guides' | 'crops' | 'garden'>('guides');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGuide, setSelectedGuide] = useState<FarmingGuide | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I am your FarmSmart AI. How can I help you in the garden today?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [gardenItems, setGardenItems] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const categories = ['all', 'vegetables', 'herb', 'livestock', 'sustainability'];
  
  const filteredGuides = selectedCategory === 'all' 
    ? FARMING_GUIDES 
    : FARMING_GUIDES.filter(g => g.category === selectedCategory);

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  useEffect(() => {
    testConnection();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setGardenItems([]);
      return;
    }

    const path = `users/${user.uid}/garden`;
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGardenItems(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: userInput };
    setChatMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting right now. Please try again later.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const addToGarden = async (crop: Crop) => {
    if (!user) {
      handleLogin();
      return;
    }

    const path = `users/${user.uid}/garden/${crop.id}`;
    try {
      await setDoc(doc(db, path), {
        cropId: crop.id,
        addedAt: serverTimestamp(),
        notes: ''
      });
      alert(`Added ${crop.name} to your garden!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const removeFromGarden = async (itemId: string) => {
    if (!user) return;
    const path = `users/${user.uid}/garden/${itemId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Seed Data Trigger (For Demo/Admin)
  const seedCrops = async () => {
    if (!user || user.email !== 'ngwarubpk@gmail.com') return;
    for (const crop of CROP_DATA) {
      const path = `crops/${crop.id}`;
      try {
        await setDoc(doc(db, path), crop);
      } catch (e) {
        console.error("Seed failed for", crop.id, e);
      }
    }
    alert("Crops seeded successfully!");
  };

  return (
    <div className="min-h-screen pb-20 font-sans">
      {/* Header / Nav */}
      <nav className="fixed top-0 inset-x-0 z-[60] px-6 py-4 flex justify-between items-center transition-all bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Sprout className="w-8 h-8 text-farm-leaf" />
          <span className="font-serif text-xl tracking-widest text-farm-leaf uppercase font-bold">FarmSmart</span>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-[10px] uppercase tracking-widest font-bold text-farm-leaf opacity-60">Connected Farmer</p>
                <p className="text-sm font-medium">{user.displayName}</p>
              </div>
              <img src={user.photoURL || ''} alt="User" className="w-10 h-10 rounded-full border-2 border-farm-leaf p-0.5" />
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 bg-farm-leaf text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform"
            >
              <User className="w-4 h-4" /> Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fee74a62?q=80&w=2000&auto=format&fit=crop"
          alt="Farm background"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sprout className="w-10 h-10 text-farm-earth" />
              <span className="text-farm-earth font-serif text-2xl tracking-widest uppercase">FarmSmart</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
              Grow Your Own <span className="italic">Sustainable</span> Future
            </h1>
            <p className="text-xl text-farm-earth font-light max-w-2xl mx-auto mb-10">
              Discover the joy of organic farming with expert guides, seasonal advice, and real-time AI assistance.
            </p>
            {user?.email === 'ngwarubpk@gmail.com' && (
              <button onClick={seedCrops} className="mb-4 text-xs text-white/50 hover:text-white underline">Admin: Seed Data</button>
            )}
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-farm-leaf hover:bg-farm-leaf/90 text-white px-8 py-4 rounded-full text-lg font-medium transition-colors border-2 border-farm-leaf"
              >
                Start Learning
              </button>
              {user && (
                <button 
                  onClick={() => {
                    setActiveTab('garden');
                    document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-8 py-4 rounded-full text-lg font-medium transition-colors border-2 border-white/30"
                >
                  My Garden
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Stats */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Calendar /></div>
            <div>
              <p className="text-sm text-neutral-500 uppercase tracking-tighter">Current Season</p>
              <p className="font-medium text-lg">{currentMonth}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 flex items-center gap-4">
            <div className="p-3 bg-rose-50 rounded-2xl text-rose-600"><Sprout /></div>
            <div>
              <p className="text-sm text-neutral-500 uppercase tracking-tighter">My Plants</p>
              <p className="font-medium text-lg">{gardenItems.length} Growing</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 flex items-center gap-4">
            <div className="p-3 bg-cyan-50 rounded-2xl text-cyan-600"><Droplets /></div>
            <div>
              <p className="text-sm text-neutral-500 uppercase tracking-tighter">Tasks Today</p>
              <p className="font-medium text-lg">Morning Water</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><CheckCircle2 /></div>
            <div>
              <p className="text-sm text-neutral-500 uppercase tracking-tighter">Daily Streak</p>
              <p className="font-medium text-lg">12 Days</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div id="content" className="max-w-7xl mx-auto px-4 mt-20 flex justify-center">
        <div className="bg-white p-2 rounded-full shadow-sm border border-neutral-100 flex gap-2">
          <button 
            onClick={() => setActiveTab('guides')}
            className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'guides' ? 'bg-farm-leaf text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'}`}
          >
            Learning Guides
          </button>
          <button 
            onClick={() => setActiveTab('crops')}
            className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'crops' ? 'bg-farm-leaf text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'}`}
          >
            Crop Encyclopedia
          </button>
          {user && (
            <button 
              onClick={() => setActiveTab('garden')}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'garden' ? 'bg-rose-600 text-white shadow-md' : 'text-rose-400 hover:bg-rose-50'}`}
            >
              My Garden
            </button>
          )}
        </div>
      </div>

      {activeTab === 'guides' && (
        <main className="max-w-7xl mx-auto px-4 py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-serif mb-4">Learn the Essentials</h2>
              <p className="text-neutral-500">Pick a category to start your agricultural journey.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat 
                    ? 'bg-farm-leaf text-white shadow-md' 
                    : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
                  }`}
                >
                  {cat.charAt(0) + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredGuides.map((guide, index) => (
                <motion.div
                  layout
                  key={guide.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => setSelectedGuide(guide)}
                  className="group cursor-pointer bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-neutral-100"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={guide.imageUrl} alt={guide.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif mb-2 group-hover:text-farm-leaf transition-colors leading-tight">{guide.title}</h3>
                    <p className="text-neutral-500 text-sm mb-4 line-clamp-2">{guide.description}</p>
                    <div className="flex items-center text-farm-leaf font-medium text-sm">
                      Read Guide <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>
      )}

      {activeTab === 'crops' && (
        <main className="max-w-7xl mx-auto px-4 py-20">
          <div className="mb-12">
            <h2 className="text-4xl font-serif mb-4">Crop Library</h2>
            <p className="text-neutral-500">Everything you need to know about common farming crops.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CROP_DATA.map((crop, index) => (
              <motion.div
                key={crop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedCrop(crop)}
                className="group cursor-pointer bg-white rounded-[2.5rem] p-4 shadow-sm hover:shadow-xl transition-all border border-neutral-100 flex gap-4 items-center"
              >
                <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden flex-shrink-0">
                  <img src={crop.imageUrl} alt={crop.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-farm-clay uppercase tracking-widest">{crop.category}</span>
                  <h3 className="text-xl font-serif">{crop.name}</h3>
                </div>
                <div className="p-2 bg-neutral-50 rounded-full group-hover:bg-farm-leaf group-hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      )}

      {activeTab === 'garden' && (
        <main className="max-w-7xl mx-auto px-4 py-20">
          <div className="mb-12 flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-serif mb-4">My Virtual Garden</h2>
              <p className="text-neutral-500">A collection of what you're currently growing.</p>
            </div>
            <button 
              onClick={() => setActiveTab('crops')}
              className="bg-rose-100 text-rose-600 px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-rose-200 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add More
            </button>
          </div>

          {gardenItems.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-neutral-200">
              <Sprout className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
              <p className="text-neutral-400 text-xl font-serif">Your garden is empty. Start planting today!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gardenItems.map((item) => {
                const crop = CROP_DATA.find(c => c.id === item.cropId);
                if (!crop) return null;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-neutral-100 group"
                  >
                    <div className="flex gap-4 mb-6">
                      <img src={crop.imageUrl} className="w-20 h-20 rounded-2xl object-cover" />
                      <div>
                        <h3 className="text-2xl font-serif">{crop.name}</h3>
                        <p className="text-neutral-400 text-xs">Added {item.addedAt?.toDate().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => setSelectedCrop(crop)}
                        className="text-farm-leaf text-sm font-bold hover:underline"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => removeFromGarden(item.id)}
                        className="p-3 bg-neutral-50 text-rose-400 rounded-full hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* Guide Details Modal */}
      <AnimatePresence>
        {selectedGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedGuide(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-farm-earth w-full max-w-4xl h-[80vh] rounded-[3rem] overflow-hidden relative flex flex-col md:flex-row"
              onClick={e => e.stopPropagation()}
            >
              <div className="md:w-1/2 h-48 md:h-full relative">
                <img src={selectedGuide.imageUrl} alt={selectedGuide.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button onClick={() => setSelectedGuide(null)} className="absolute top-6 left-6 p-2 bg-white/20 backdrop-blur rounded-full text-white"><ChevronLeft /></button>
              </div>
              <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto bg-white">
                <span className="text-farm-leaf font-bold text-xs uppercase tracking-widest mb-2 block">{selectedGuide.category}</span>
                <h2 className="text-4xl font-serif mb-6">{selectedGuide.title}</h2>
                <p className="text-neutral-600 mb-8">{selectedGuide.description}</p>
                <div className="space-y-6">
                  {selectedGuide.steps.map((step, i) => (
                    <div key={i} className="flex gap-4"><div className="w-8 h-8 rounded-full border border-farm-leaf flex items-center justify-center font-serif flex-shrink-0">{i+1}</div><p className="text-neutral-700">{step}</p></div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crop Details Modal */}
      <AnimatePresence>
        {selectedCrop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedCrop(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-5xl h-[85vh] rounded-[3.5rem] overflow-hidden relative flex flex-col md:flex-row shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="md:w-[40%] h-64 md:h-full relative">
                <img src={selectedCrop.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button onClick={() => setSelectedCrop(null)} className="absolute top-8 left-8 p-3 bg-white/20 backdrop-blur-xl rounded-full text-white"><ChevronLeft /></button>
              </div>
              <div className="md:w-[60%] p-8 md:p-16 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-farm-earth text-farm-clay px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{selectedCrop.category}</span>
                  <button 
                    onClick={() => addToGarden(selectedCrop)}
                    className="bg-rose-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add to Garden
                  </button>
                </div>
                <h2 className="text-5xl font-serif mb-6">{selectedCrop.name}</h2>
                <p className="text-lg text-neutral-600 mb-10 border-l-4 border-farm-clay pl-6 italic">{selectedCrop.description}</p>
                <div className="grid grid-cols-2 gap-8 mb-12">
                  <div><h4 className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Soil</h4><p>{selectedCrop.soilType}</p></div>
                  <div><h4 className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Sunlight</h4><p>{selectedCrop.sunlight}</p></div>
                  <div><h4 className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Watering</h4><p>{selectedCrop.watering}</p></div>
                  <div><h4 className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Harvest</h4><p>{selectedCrop.harvestSeason}</p></div>
                </div>
                <div className="bg-farm-earth/50 p-8 rounded-[2rem]">
                  <h4 className="text-neutral-400 text-xs font-bold uppercase mb-4 tracking-widest">Pests & Diseases</h4>
                  <ul className="grid grid-cols-2 gap-3">
                    {selectedCrop.pestsAndDiseases.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-neutral-700 text-sm"><div className="w-1 h-1 rounded-full bg-farm-clay" /> {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-8 right-8 bg-farm-clay text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-40 group"
      >
        <MessageCircle className="w-8 h-8" />
      </button>

      {/* AI Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-8 w-full max-w-[400px] h-[550px] bg-white rounded-[2.5rem] shadow-2xl z-50 flex flex-col border border-neutral-100 overflow-hidden"
          >
            <div className="p-6 bg-farm-clay text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sprout className="w-6 h-6" />
                <h3 className="font-serif">Expert AI Assistant</h3>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-farm-earth/30">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-3xl ${msg.role === 'user' ? 'bg-farm-leaf text-white' : 'bg-white text-neutral-800'}`}>
                    <div className="markdown-body">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && <div className="animate-pulse text-xs text-neutral-400 p-6">Farmer is typing...</div>}
              <div ref={chatEndRef} />
            </div>
            <div className="p-6 bg-white border-t">
              <div className="relative">
                <input 
                  type="text"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask any farming question..."
                  className="w-full pl-6 pr-14 py-4 bg-neutral-50 rounded-full text-sm border-none focus:ring-2 focus:ring-farm-clay"
                />
                <button onClick={handleSendMessage} className="absolute right-2 top-2 p-3 bg-farm-clay text-white rounded-full"><Send className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="text-center py-20 opacity-30 pointer-events-none">
        <Sprout className="w-12 h-12 mx-auto mb-4 text-farm-leaf" />
        <p className="font-serif tracking-widest uppercase text-xs">Sowed with love by FarmSmart</p>
      </footer>
    </div>
  );
}
