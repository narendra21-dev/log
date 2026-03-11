'use client';

import React, { useState, useEffect, useCallback, Fragment, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import useEmblaCarousel from 'embla-carousel-react';
import {
  Menu, X, Search, Sun, Moon, Pen, LayoutDashboard,
  Clock, Eye, MessageCircle, Folder,
  Plus, Edit, Trash2, Check, XCircle, LogOut, User,
  Save, ArrowLeft, ExternalLink, Send, Share2,
  Twitter, Linkedin, Facebook, Loader2, FileText, Sparkles, RefreshCw, Megaphone,
  ChevronLeft, ChevronRight, ChevronDown, Keyboard, ArrowRight, Play, Pause,
  Mail, MapPin, Phone, Shield, Info, Heart, Globe, Zap, Award, Users, BookOpen, Target
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

// Types
interface User { id: string; email: string; name: string; role: string; avatar?: string; bio?: string; }
interface Category { id: string; name: string; slug: string; description?: string; color: string; postCount?: number; }
interface Tag { id: string; name: string; slug: string; color: string; postCount?: number; }
interface Post { id: string; title: string; slug: string; excerpt?: string; content: string; coverImage?: string; published: boolean; featured: boolean; viewCount: number; readTime: number; authorId: string; categoryId?: string; publishedAt?: string; createdAt: string; author?: User; category?: Category; tags?: { tag: Tag }[]; comments?: Comment[]; }
interface Comment { id: string; content: string; authorId: string; postId: string; parentId?: string; status: string; createdAt: string; author?: User; replies?: Comment[]; post?: { id: string; title: string; slug: string }; }
interface Stats { totalPosts: number; publishedPosts: number; draftPosts: number; totalCategories: number; totalTags: number; totalComments: number; pendingComments: number; totalViews: number; }
interface Ad { id: string; title: string; type: string; position: string; content?: string; imageUrl?: string; linkUrl?: string; linkText?: string; active: boolean; priority: number; impressions: number; clicks: number; startDate?: string; endDate?: string; createdAt: string; }

// Hero Carousel Component
const HeroCarousel = ({ posts, onPostClick }: { posts: Post[]; onPostClick: (slug: string) => void }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => setCurrentIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => emblaApi.scrollNext(), 5000);
    }
    
    return () => {
      emblaApi.off('select', onSelect);
      clearInterval(interval);
    };
  }, [emblaApi, isPlaying]);

  if (posts.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {posts.map((post, index) => (
            <div key={post.id} className="flex-[0_0_100%] min-w-0 relative">
              <div 
                className="relative h-[400px] md:h-[500px] cursor-pointer group"
                onClick={() => onPostClick(post.slug)}
              >
                <img 
                  src={post.coverImage || `https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&sig=${index}`}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  {post.category && (
                    <Badge 
                      style={{ backgroundColor: post.category.color }} 
                      className="mb-3 text-white border-0"
                    >
                      {post.category.name}
                    </Badge>
                  )}
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 line-clamp-2 max-w-3xl">
                    {post.title}
                  </h2>
                  <p className="text-zinc-300 line-clamp-2 mb-4 max-w-2xl text-sm md:text-base">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />{post.readTime} min read
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />{post.viewCount.toLocaleString()} views
                    </span>
                    {post.author && (
                      <span className="hidden sm:flex items-center gap-1.5">
                        <User className="w-4 h-4" />{post.author.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-yellow-400" /> Featured
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation Arrows */}
      <button 
        onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); scrollNext(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      
      {/* Play/Pause Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
        className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      
      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {posts.map((_, index) => (
          <button
            key={index}
            onClick={(e) => { e.stopPropagation(); emblaApi?.scrollTo(index); }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'w-6 bg-white' : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Ad Banner Component
const AdBanner = ({ ad, onAdClick, className = '' }: { ad: Ad; onAdClick?: (id: string, url: string) => void; className?: string }) => {
  if (!ad) return null;
  
  const handleClick = () => {
    if (ad.linkUrl && onAdClick) {
      onAdClick(ad.id, ad.linkUrl);
    }
  };

  if (ad.content) {
    return (
      <div className={`ad-container relative ${className}`}>
        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Sponsored</div>
        <div 
          className="ad-content bg-muted/30 rounded-lg p-4 border border-border/50"
          dangerouslySetInnerHTML={{ __html: ad.content }}
        />
      </div>
    );
  }

  if (ad.imageUrl) {
    return (
      <div className={`ad-container relative ${className}`}>
        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Advertisement</div>
        <div 
          className="ad-banner bg-muted/30 rounded-lg overflow-hidden border border-border/50 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={handleClick}
        >
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-auto object-cover" />
          {ad.linkText && (
            <div className="p-2 text-center text-sm font-medium text-primary hover:underline">
              {ad.linkText}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`ad-container relative ${className}`}>
      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Sponsored</div>
      <div 
        className="ad-text bg-muted/30 rounded-lg p-4 border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={handleClick}
      >
        <h4 className="font-semibold mb-1">{ad.title}</h4>
        {ad.linkText && (
          <span className="text-sm text-primary hover:underline">{ad.linkText} →</span>
        )}
      </div>
    </div>
  );
};

// Markdown Components
const MDComponents = {
  code({ inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" className="rounded-lg !bg-zinc-900 !p-4 my-4" {...props}>
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
    );
  },
  h1: ({ children }: any) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-2xl font-semibold mt-6 mb-3">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>,
  p: ({ children }: any) => <p className="text-base leading-relaxed mb-4 text-zinc-700 dark:text-zinc-300">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
  li: ({ children }: any) => <li className="text-zinc-700 dark:text-zinc-300">{children}</li>,
  a: ({ href, children }: any) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
  blockquote: ({ children }: any) => <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-zinc-600 dark:text-zinc-400">{children}</blockquote>,
};

// Spinner
const Spinner = ({ text }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-8">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
    {text && <p className="text-sm text-muted-foreground">{text}</p>}
  </div>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => {
  if (totalPages <= 1) return null;
  
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        className="gap-1"
      >
        <ChevronLeft className="w-4 h-4" /> Prev
      </Button>
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, i) => (
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">...</span>
          ) : (
            <Button 
              key={page} 
              variant={page === currentPage ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => onPageChange(page as number)} 
              className="w-9"
            >
              {page}
            </Button>
          )
        ))}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
        className="gap-1"
      >
        Next <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

// Skeletons
const PostSkeleton = () => (
  <Card className="overflow-hidden h-full border-0 shadow-md">
    <Skeleton className="h-48 w-full" />
    <CardContent className="p-4 space-y-3">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-full" />
    </CardContent>
  </Card>
);

export default function BlogApp() {
  // State
  const [isDark, setIsDark] = useState(false);
  const [view, setView] = useState<'public' | 'admin' | 'post' | 'about' | 'privacy' | 'contact'>('public');
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPage, setPostsPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const [adsPage, setAdsPage] = useState(1);
  const itemsPerPage = 9;
  const adminItemsPerPage = 10;
  
  // Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<{ posts: Post[], categories: Category[], tags: Tag[] }>({ posts: [], categories: [], tags: [] });
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Loading
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [deletingPost, setDeletingPost] = useState<string | null>(null);
  const [savingAd, setSavingAd] = useState(false);
  const [deletingAd, setDeletingAd] = useState<string | null>(null);
  const [adsLoading, setAdsLoading] = useState(false);
  
  // Data
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [activeAds, setActiveAds] = useState<Record<string, Ad[]>>({
    header: [],
    sidebar: [],
    'in-post': [],
    footer: [],
    'between-posts': []
  });
  
  // Dialogs
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  
  // Forms
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [postForm, setPostForm] = useState({ title: '', slug: '', excerpt: '', content: '', coverImage: '', published: false, featured: false, readTime: 5, categoryId: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', color: '#6b7280' });
  const [tagForm, setTagForm] = useState({ name: '', color: '#6b7280' });
  const [commentForm, setCommentForm] = useState({ content: '', authorName: '', authorEmail: '' });
  const [profileForm, setProfileForm] = useState({ name: '', avatar: '', bio: '' });
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [adForm, setAdForm] = useState({ 
    title: '', 
    type: 'banner', 
    position: 'sidebar', 
    content: '', 
    imageUrl: '', 
    linkUrl: '', 
    linkText: '', 
    active: true, 
    priority: 0, 
    startDate: '', 
    endDate: '' 
  });
  
  // Editing
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  
  const { toast } = useToast();
  
  // Theme
  useEffect(() => { document.documentElement.classList.toggle('dark', isDark); }, [isDark]);
  
  // Keyboard shortcut for search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  
  // Focus search input when dialog opens
  useEffect(() => {
    if (isSearchOpen) {
      // Clear search when opening
      setSearchQuery('');
      setSearchResults({ posts: [], categories: [], tags: [] });
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);
  
  // Instant search results (no debounce for local data)
  const instantSearchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { posts: [], categories: [], tags: [] };
    }
    const query = searchQuery.toLowerCase().trim();
    return {
      posts: posts.filter(p => 
        p.title.toLowerCase().includes(query) || 
        (p.excerpt?.toLowerCase().includes(query) ?? false)
      ).slice(0, 5),
      categories: categories.filter(c => 
        c.name.toLowerCase().includes(query)
      ).slice(0, 3),
      tags: tags.filter(t => 
        t.name.toLowerCase().includes(query)
      ).slice(0, 5),
    };
  }, [searchQuery, posts, categories, tags]);
  
  // Sync searchResults with instantSearchResults
  useEffect(() => {
    setSearchResults(instantSearchResults);
  }, [instantSearchResults]);
  
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedTag]);
  
  // Fetch functions
  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '1000');
      if (!isAdmin) params.append('published', 'true');
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedTag) params.append('tagId', selectedTag);
      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) { console.error(e); }
    finally { setPostsLoading(false); }
  }, [isAdmin, searchQuery, selectedCategory, selectedTag]);
  
  const fetchCategories = useCallback(async () => {
    try { 
      const res = await fetch('/api/categories'); 
      const data = await res.json(); 
      setCategories(data.categories || []); 
    } catch (e) { console.error(e); }
  }, []);
  
  const fetchTags = useCallback(async () => {
    try { 
      const res = await fetch('/api/tags'); 
      const data = await res.json(); 
      setTags(data.tags || []); 
    } catch (e) { console.error(e); }
  }, []);
  
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try { 
      const res = await fetch('/api/admin'); 
      const data = await res.json(); 
      setStats(data.stats); 
    } catch (e) { console.error(e); }
    finally { setStatsLoading(false); }
  }, []);
  
  const fetchComments = useCallback(async () => {
    try { 
      const res = await fetch('/api/comments'); 
      const data = await res.json(); 
      setComments(data.comments || []); 
    } catch (e) { console.error(e); }
  }, []);
  
  // Ad fetch functions
  const fetchAds = useCallback(async () => {
    setAdsLoading(true);
    try {
      const res = await fetch('/api/ads');
      const data = await res.json();
      setAds(data.ads || []);
    } catch (e) { console.error(e); }
    finally { setAdsLoading(false); }
  }, []);
  
  const fetchActiveAds = useCallback(async (position?: string) => {
    try {
      const params = new URLSearchParams();
      params.append('active', 'true');
      if (position) params.append('position', position);
      const res = await fetch(`/api/ads?${params}`);
      const data = await res.json();
      
      if (position) {
        setActiveAds(prev => ({ ...prev, [position]: data.ads || [] }));
      } else {
        const grouped: Record<string, Ad[]> = {
          header: [],
          sidebar: [],
          'in-post': [],
          footer: [],
          'between-posts': []
        };
        (data.ads || []).forEach((ad: Ad) => {
          if (grouped[ad.position]) {
            grouped[ad.position].push(ad);
          }
        });
        setActiveAds(grouped);
      }
    } catch (e) { console.error(e); }
  }, []);
  
  // Initial load
  useEffect(() => {
    const init = async () => {
      try { await fetch('/api/seed'); } catch (e) { /* seeded */ }
      await Promise.all([fetchPosts(), fetchCategories(), fetchTags(), fetchActiveAds()]);
      setLoading(false);
    };
    init();
  }, []);
  
  // Refresh on filter change
  useEffect(() => { if (!loading) fetchPosts(); }, [fetchPosts, loading]);
  useEffect(() => { if (isAdmin && view === 'admin') { fetchStats(); fetchComments(); fetchAds(); } }, [isAdmin, view, fetchStats, fetchComments, fetchAds]);
  
  // Fetch single post
  const fetchPost = async (slug: string) => {
    setPostLoading(true);
    try { 
      const res = await fetch(`/api/posts?slug=${slug}`); 
      const data = await res.json(); 
      if (data.post) { 
        setCurrentPost(data.post); 
        setView('post'); 
      } 
    } catch (e) { console.error(e); }
    finally { setPostLoading(false); }
  };
  
  // Auth
  const handleLogin = async () => {
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: loginEmail, password: loginPassword }) });
      const data = await res.json();
      if (data.user) {
        setAdminUser(data.user); setIsAdmin(true); setView('admin'); setIsLoginDialogOpen(false);
        setLoginEmail(''); setLoginPassword('');
        toast({ title: 'Welcome!', description: `Logged in as ${data.user.name}` });
      } else { toast({ title: 'Login failed', description: data.error, variant: 'destructive' }); }
    } catch (e) { toast({ title: 'Error', description: 'Failed to login', variant: 'destructive' }); }
    finally { setLoginLoading(false); }
  };
  
  const handleLogout = () => { setIsAdmin(false); setAdminUser(null); setView('public'); toast({ title: 'Logged out' }); };
  
  // Profile Update
  const [savingProfile, setSavingProfile] = useState(false);
  
  const handleUpdateProfile = async () => {
    if (!adminUser) return;
    setSavingProfile(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: adminUser.id,
          name: profileForm.name,
          avatar: profileForm.avatar,
          bio: profileForm.bio
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAdminUser({ ...adminUser, ...data });
        setIsProfileDialogOpen(false);
        toast({ title: 'Profile updated!', description: 'Your profile has been updated successfully.' });
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };
  
  // Contact Form Submit
  const handleContactSubmit = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    setContactSubmitting(true);
    try {
      // Simulate sending message (in production, this would send to an API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({ 
        title: 'Message sent!', 
        description: 'Thank you for reaching out. We\'ll get back to you soon.' 
      });
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    } finally {
      setContactSubmitting(false);
    }
  };
  
  // Post CRUD
  const handleSavePost = async () => {
    setSavingPost(true);
    try {
      const method = editingPost ? 'PUT' : 'POST';
      const body = editingPost ? { id: editingPost.id, ...postForm } : { ...postForm, authorId: adminUser?.id };
      const res = await fetch('/api/posts', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        toast({ title: editingPost ? 'Post updated!' : 'Post created!' });
        setIsPostDialogOpen(false); setPostForm({ title: '', slug: '', excerpt: '', content: '', coverImage: '', published: false, featured: false, readTime: 5, categoryId: '' }); setEditingPost(null);
        fetchPosts(); if (isAdmin) fetchStats();
      }
    } catch (e) { toast({ title: 'Error', description: 'Failed to save post', variant: 'destructive' }); }
    finally { setSavingPost(false); }
  };
  
  const handleDeletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    setDeletingPost(id);
    try { await fetch(`/api/posts?id=${id}`, { method: 'DELETE' }); toast({ title: 'Post deleted!' }); fetchPosts(); if (isAdmin) fetchStats(); } catch (e) { toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' }); }
    finally { setDeletingPost(null); }
  };
  
  // Category CRUD
  const handleSaveCategory = async () => {
    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const body = editingCategory ? { id: editingCategory.id, ...categoryForm } : categoryForm;
      const res = await fetch('/api/categories', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { toast({ title: editingCategory ? 'Category updated!' : 'Category created!' }); setIsCategoryDialogOpen(false); setCategoryForm({ name: '', description: '', color: '#6b7280' }); setEditingCategory(null); fetchCategories(); }
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };
  
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try { await fetch(`/api/categories?id=${id}`, { method: 'DELETE' }); toast({ title: 'Category deleted!' }); fetchCategories(); } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };
  
  // Tag CRUD
  const handleSaveTag = async () => {
    try {
      const method = editingTag ? 'PUT' : 'POST';
      const body = editingTag ? { id: editingTag.id, ...tagForm } : tagForm;
      const res = await fetch('/api/tags', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { toast({ title: editingTag ? 'Tag updated!' : 'Tag created!' }); setIsTagDialogOpen(false); setTagForm({ name: '', color: '#6b7280' }); setEditingTag(null); fetchTags(); }
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };
  
  const handleDeleteTag = async (id: string) => {
    if (!confirm('Delete this tag?')) return;
    try { await fetch(`/api/tags?id=${id}`, { method: 'DELETE' }); toast({ title: 'Tag deleted!' }); fetchTags(); } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };
  
  // Comment moderation
  const handleCommentStatus = async (id: string, status: string) => {
    try { await fetch('/api/comments', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); toast({ title: `Comment ${status}!` }); fetchComments(); } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };
  
  // Add comment
  const handleAddComment = async () => {
    if (!currentPost || !commentForm.content) return;
    try {
      const userRes = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: commentForm.authorEmail || `guest_${Date.now()}@blog.com`, name: commentForm.authorName || 'Guest', password: 'guest' }) });
      const tempUser = await userRes.json();
      await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: commentForm.content, authorId: tempUser.id, postId: currentPost.id }) });
      toast({ title: 'Comment submitted!', description: 'Pending approval.' });
      setCommentForm({ content: '', authorName: '', authorEmail: '' });
      fetchPost(currentPost.slug);
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  };
  
  // Ad CRUD
  const handleSaveAd = async () => {
    setSavingAd(true);
    try {
      const method = editingAd ? 'PUT' : 'POST';
      const body = editingAd ? { id: editingAd.id, ...adForm } : adForm;
      const res = await fetch('/api/ads', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        toast({ title: editingAd ? 'Ad updated!' : 'Ad created!' });
        setIsAdDialogOpen(false);
        setAdForm({ title: '', type: 'banner', position: 'sidebar', content: '', imageUrl: '', linkUrl: '', linkText: '', active: true, priority: 0, startDate: '', endDate: '' });
        setEditingAd(null);
        fetchAds();
        fetchActiveAds();
      }
    } catch (e) { toast({ title: 'Error', description: 'Failed to save ad', variant: 'destructive' }); }
    finally { setSavingAd(false); }
  };
  
  const handleDeleteAd = async (id: string) => {
    if (!confirm('Delete this ad?')) return;
    setDeletingAd(id);
    try {
      await fetch(`/api/ads?id=${id}`, { method: 'DELETE' });
      toast({ title: 'Ad deleted!' });
      fetchAds();
      fetchActiveAds();
    } catch (e) { toast({ title: 'Error', description: 'Failed to delete ad', variant: 'destructive' }); }
    finally { setDeletingAd(null); }
  };
  
  const handleAdClick = async (id: string, linkUrl: string) => {
    try {
      await fetch('/api/ads/click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (linkUrl) {
        window.open(linkUrl, '_blank', 'noopener,noreferrer');
      }
      if (isAdmin) {
        fetchAds();
      }
    } catch (e) { console.error('Failed to track click', e); }
  };
  
  // Derived data
  const featuredPosts = posts.filter(p => p.featured && p.published);
  const allPublishedPosts = posts.filter(p => p.published);
  // For display, show all posts in the grid (both featured and non-featured)
  const displayPosts = allPublishedPosts;
  const totalPages = Math.ceil(displayPosts.length / itemsPerPage);
  
  // Initial loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-4"
          >
            <img 
              src="https://i.postimg.cc/PfLrFwh2/2030635822251773952-Photoroom.png"
              alt="N-LOG"
              className="w-24 h-24 rounded-2xl object-contain shadow-xl"
            />
          </motion.div>
          <Spinner text="Loading N-LOG..." />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark' : ''}`}>
      <div className="bg-background text-foreground flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <button onClick={() => { setView('public'); setCurrentPost(null); }} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="https://i.postimg.cc/PfLrFwh2/2030635822251773952-Photoroom.png"
                alt="N-LOG"
                className="w-10 h-10 rounded-xl object-contain shadow-lg"
              />
              <span className="font-bold text-xl hidden sm:block">N-LOG</span>
            </button>
            
            <nav className="hidden lg:flex items-center gap-1">
              <button 
                onClick={() => { setView('public'); setSelectedCategory(null); setSelectedTag(null); }} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  view === 'public' && !selectedCategory && !selectedTag
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                Home
              </button>
              {categories.slice(0, 4).map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => { setSelectedCategory(cat.id); setSelectedTag(null); setView('public'); }} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
              {categories.length > 4 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center gap-1">
                      More <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>All Categories</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <ScrollArea className="max-h-[300px]">
                      {categories.slice(4).map(cat => (
                        <DropdownMenuItem key={cat.id} onClick={() => { setSelectedCategory(cat.id); setSelectedTag(null); setView('public'); }} className="flex items-center justify-between">
                          <span>{cat.name}</span>
                          <Badge variant="outline" style={{ borderColor: cat.color, color: cat.color }} className="text-xs">
                            {cat.postCount || 0}
                          </Badge>
                        </DropdownMenuItem>
                      ))}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </nav>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsSearchOpen(true)} 
                className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50 border-0"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm">Search...</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium">
                  ⌘K
                </kbd>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="rounded-lg">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <Button variant={view === 'admin' ? 'default' : 'ghost'} onClick={() => setView('admin')} className="rounded-lg">
                    <LayoutDashboard className="w-4 h-4 mr-2" />Dashboard
                  </Button>
                  <Button variant="ghost" onClick={handleLogout} className="rounded-lg">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-lg">
                      <User className="w-4 h-4 mr-2" />Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Admin Login</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Email</Label>
                        <Input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="admin@blog.com" />
                      </div>
                      <div>
                        <Label>Password</Label>
                        <Input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" />
                      </div>
                      <Button className="w-full" onClick={handleLogin} disabled={loginLoading}>
                        {loginLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Logging in...</> : 'Login'}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">Demo: admin@blog.com / admin123</p>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Button variant="ghost" size="icon" className="lg:hidden rounded-lg" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden rounded-lg" onClick={() => setIsSearchOpen(true)}>
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                className="lg:hidden border-t border-border overflow-hidden"
              >
                <div className="p-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={selectedCategory === null && selectedTag === null ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => { setSelectedCategory(null); setSelectedTag(null); setIsMenuOpen(false); }}
                    >
                      All
                    </Button>
                    {categories.map(cat => (
                      <Button 
                        key={cat.id} 
                        variant={selectedCategory === cat.id ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => { setSelectedCategory(cat.id); setSelectedTag(null); setIsMenuOpen(false); }}
                      >
                        {cat.name}
                      </Button>
                    ))}
                  </div>
                  {tags.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Popular Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {tags.slice(0, 8).map(tag => (
                          <Badge 
                            key={tag.id}
                            variant={selectedTag === tag.id ? 'default' : 'outline'}
                            className="cursor-pointer"
                            style={selectedTag !== tag.id ? { borderColor: tag.color, color: tag.color } : {}}
                            onClick={() => { setSelectedTag(tag.id); setSelectedCategory(null); setIsMenuOpen(false); }}
                          >
                            #{tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
        
        {/* Main */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            {/* Public View */}
            {view === 'public' && (
              <motion.div key="public" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="max-w-7xl mx-auto px-4 py-8">
                  {/* Header Ad */}
                  {activeAds.header.length > 0 && (
                    <div className="mb-8">
                      <AdBanner ad={activeAds.header[0]} onAdClick={handleAdClick} />
                    </div>
                  )}
                  
                  {/* Hero Carousel */}
                  {!searchQuery && !selectedCategory && !selectedTag && featuredPosts.length > 0 && (
                    <section className="mb-12">
                      <HeroCarousel posts={featuredPosts} onPostClick={fetchPost} />
                    </section>
                  )}
                  
                  {/* Section Title */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold">
                        {searchQuery 
                          ? `Search: "${searchQuery}"` 
                          : selectedCategory 
                            ? categories.find(c => c.id === selectedCategory)?.name 
                            : selectedTag 
                              ? `#${tags.find(t => t.id === selectedTag)?.name}`
                              : 'Latest Posts'}
                      </h2>
                      {!searchQuery && !selectedCategory && !selectedTag && (
                        <p className="text-muted-foreground mt-1">
                          {allPublishedPosts.length} article{allPublishedPosts.length !== 1 ? 's' : ''} published
                        </p>
                      )}
                      {(selectedCategory || selectedTag) && (
                        <p className="text-muted-foreground mt-1">
                          {displayPosts.length} article{displayPosts.length !== 1 ? 's' : ''} found
                        </p>
                      )}
                    </div>
                    {(searchQuery || selectedCategory || selectedTag) && (
                      <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory(null); setSelectedTag(null); }}>
                        Clear
                      </Button>
                    )}
                  </div>
                  
                  {/* Posts Grid */}
                  {postsLoading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3, 4, 5, 6].map(i => <PostSkeleton key={i} />)}
                    </div>
                  ) : displayPosts.length > 0 ? (
                    <>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayPosts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((post, index) => (
                          <Fragment key={post.id}>
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              transition={{ delay: index * 0.05 }} 
                              whileHover={{ y: -4 }} 
                              className="group cursor-pointer" 
                              onClick={() => fetchPost(post.slug)}
                            >
                              <Card className="overflow-hidden h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card">
                                <div className="relative h-52 overflow-hidden">
                                  <img 
                                    src={post.coverImage || `https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&sig=${post.id}`} 
                                    alt={post.title} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                  {!post.published && (
                                    <Badge variant="secondary" className="absolute top-3 right-3">Draft</Badge>
                                  )}
                                  {post.featured && (
                                    <Badge className="absolute top-3 left-3 gap-1">
                                      <Sparkles className="w-3 h-3" />Featured
                                    </Badge>
                                  )}
                                </div>
                                <CardContent className="p-5">
                                  <div className="flex items-center gap-2 mb-3">
                                    {post.category && (
                                      <Badge 
                                        variant="outline" 
                                        style={{ borderColor: post.category.color, color: post.category.color }}
                                        className="border"
                                      >
                                        {post.category.name}
                                      </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="w-3 h-3" />{post.readTime} min
                                    </span>
                                  </div>
                                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                    {post.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    {post.excerpt}
                                  </p>
                                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                                    <div className="flex items-center gap-2">
                                      <img 
                                        src={post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name}`}
                                        alt={post.author?.name}
                                        className="w-5 h-5 rounded-full"
                                      />
                                      <span className="font-medium">{post.author?.name}</span>
                                    </div>
                                    <span>{post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : 'Draft'}</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                            {/* Between-Posts Ad after every 6th post */}
                            {(index + 1) % 6 === 0 && activeAds['between-posts']?.length > 0 && (
                              <div key={`ad-${index}`} className="sm:col-span-2 lg:col-span-3">
                                <AdBanner ad={activeAds['between-posts'][0]} onAdClick={handleAdClick} className="my-4" />
                              </div>
                            )}
                          </Fragment>
                        ))}
                      </div>
                      <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={setCurrentPage} 
                      />
                    </>
                  ) : (
                    <div className="text-center py-16">
                      <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-xl font-medium mb-2">No posts found</h3>
                      <p className="text-muted-foreground">Try different filters or check back later</p>
                    </div>
                  )}
                  
                  {/* Categories Section */}
                  {!searchQuery && !selectedCategory && !selectedTag && categories.length > 0 && (
                    <section className="mt-16">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Browse by Category</h2>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          View all <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {categories.slice(0, 8).map(cat => (
                          <motion.div 
                            key={cat.id} 
                            whileHover={{ scale: 1.02, y: -2 }} 
                            whileTap={{ scale: 0.98 }} 
                            onClick={() => setSelectedCategory(cat.id)} 
                            className="cursor-pointer"
                          >
                            <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all h-full">
                              <div className="h-1.5" style={{ backgroundColor: cat.color }} />
                              <CardContent className="p-5">
                                <h3 className="font-semibold mb-1">{cat.name}</h3>
                                <p className="text-sm text-muted-foreground">{cat.postCount || 0} articles</p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </section>
                  )}
                  
                  {/* Tags Section */}
                  {!searchQuery && !selectedCategory && !selectedTag && tags.length > 0 && (
                    <section className="mt-12">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Popular Tags</h2>
                        <span className="text-sm text-muted-foreground">Click to filter posts</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tags.slice(0, 15).map(tag => (
                          <motion.div
                            key={tag.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Badge 
                              variant="outline" 
                              className="cursor-pointer hover:bg-primary/10 py-1.5 px-3 transition-all hover:shadow-md" 
                              style={{ borderColor: tag.color, color: tag.color }}
                              onClick={() => setSelectedTag(tag.id)}
                            >
                              #{tag.name}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </motion.div>
            )}
            
            {/* Post View */}
            {view === 'post' && (
              <motion.div key="post" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <div className="grid lg:grid-cols-[1fr_320px] gap-8">
                    {/* Main Content */}
                    <div>
                      <Button variant="ghost" className="mb-6" onClick={() => { setView(isAdmin ? 'admin' : 'public'); setCurrentPost(null); }}>
                        <ArrowLeft className="w-4 h-4 mr-2" />Back
                      </Button>
                      {postLoading ? (
                        <div className="space-y-6">
                          <Skeleton className="h-8 w-24" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-64 w-full rounded-xl" />
                        </div>
                      ) : currentPost && (
                        <article>
                          <header className="mb-8">
                            {currentPost.category && (
                              <Badge style={{ backgroundColor: currentPost.category.color }} className="mb-4 text-white">
                                {currentPost.category.name}
                              </Badge>
                            )}
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                              {currentPost.title}
                            </h1>
                            <p className="text-xl text-muted-foreground mb-6">
                              {currentPost.excerpt}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b border-border pb-6">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={currentPost.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentPost.author?.name}`} 
                                  alt={currentPost.author?.name} 
                                  className="w-12 h-12 rounded-full" 
                                />
                                <div>
                                  <p className="font-medium text-foreground">{currentPost.author?.name}</p>
                                  <p>{currentPost.publishedAt ? format(new Date(currentPost.publishedAt), 'MMMM d, yyyy') : 'Draft'}</p>
                                </div>
                              </div>
                              <Separator orientation="vertical" className="h-8 hidden sm:block" />
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />{currentPost.readTime} min read
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Eye className="w-4 h-4" />{currentPost.viewCount.toLocaleString()} views
                              </span>
                            </div>
                          </header>
                          {currentPost.coverImage && (
                            <div className="relative mb-8 rounded-xl overflow-hidden aspect-video shadow-lg">
                              <img src={currentPost.coverImage} alt={currentPost.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          
                          {/* In-Post Ad */}
                          {activeAds['in-post'].length > 0 && (
                            <div className="my-8">
                              <AdBanner ad={activeAds['in-post'][0]} onAdClick={handleAdClick} />
                            </div>
                          )}
                          
                          <div className="prose prose-zinc dark:prose-invert max-w-none mb-12">
                            <ReactMarkdown components={MDComponents}>{currentPost.content}</ReactMarkdown>
                          </div>
                          
                          {currentPost.tags && currentPost.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-8">
                              {currentPost.tags.map(({ tag }) => (
                                <Badge key={tag.id} variant="outline" style={{ borderColor: tag.color, color: tag.color }}>
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 mb-12 pb-8 border-b border-border">
                            <span className="text-sm font-medium">Share:</span>
                            <Button variant="outline" size="icon"><Twitter className="w-4 h-4" /></Button>
                            <Button variant="outline" size="icon"><Linkedin className="w-4 h-4" /></Button>
                            <Button variant="outline" size="icon"><Facebook className="w-4 h-4" /></Button>
                            <Button variant="outline" size="icon"><Share2 className="w-4 h-4" /></Button>
                          </div>
                          
                          {/* Comments */}
                          <section>
                            <h2 className="text-2xl font-bold mb-6">Comments ({currentPost.comments?.length || 0})</h2>
                            <Card className="mb-8">
                              <CardContent className="p-5">
                                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                  <Input placeholder="Your name" value={commentForm.authorName} onChange={(e) => setCommentForm({ ...commentForm, authorName: e.target.value })} />
                                  <Input placeholder="Your email" type="email" value={commentForm.authorEmail} onChange={(e) => setCommentForm({ ...commentForm, authorEmail: e.target.value })} />
                                </div>
                                <Textarea placeholder="Write a comment..." value={commentForm.content} onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })} className="mb-4" />
                                <Button onClick={handleAddComment}>
                                  <Send className="w-4 h-4 mr-2" />Submit
                                </Button>
                              </CardContent>
                            </Card>
                            <div className="space-y-4">
                              {currentPost.comments?.map(comment => (
                                <Card key={comment.id}>
                                  <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                      <img 
                                        src={comment.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.name}`} 
                                        alt={comment.author?.name} 
                                        className="w-10 h-10 rounded-full" 
                                      />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium">{comment.author?.name}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                                          </span>
                                        </div>
                                        <p className="text-muted-foreground">{comment.content}</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </section>
                        </article>
                      )}
                    </div>
                    
                    {/* Sidebar */}
                    <aside className="hidden lg:block">
                      <div className="sticky top-24 space-y-6">
                        {/* Author Card */}
                        {currentPost.author && (
                          <Card>
                            <CardContent className="p-5">
                              <h3 className="font-semibold mb-4">Written by</h3>
                              <div className="flex flex-col items-center text-center">
                                <img 
                                  src={currentPost.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentPost.author.name}`}
                                  alt={currentPost.author.name}
                                  className="w-20 h-20 rounded-full border-2 border-primary mb-3"
                                />
                                <h4 className="font-semibold text-lg">{currentPost.author.name}</h4>
                                <p className="text-xs text-muted-foreground mb-3">{currentPost.author.email}</p>
                                {currentPost.author.bio && (
                                  <p className="text-sm text-muted-foreground leading-relaxed">{currentPost.author.bio}</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        
                        {/* Sidebar Ad */}
                        {activeAds.sidebar.length > 0 && (
                          <AdBanner ad={activeAds.sidebar[0]} onAdClick={handleAdClick} />
                        )}
                        
                        {/* Categories */}
                        <Card>
                          <CardContent className="p-5">
                            <h3 className="font-semibold mb-4">Browse Categories</h3>
                            <div className="space-y-2">
                              {categories.slice(0, 6).map(cat => (
                                <button
                                  key={cat.id}
                                  onClick={() => { setSelectedCategory(cat.id); setView('public'); }}
                                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                                >
                                  <span className="text-sm">{cat.name}</span>
                                  <Badge variant="outline" style={{ borderColor: cat.color, color: cat.color }} className="text-xs">
                                    {cat.postCount || 0}
                                  </Badge>
                                </button>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Additional Sidebar Ads */}
                        {activeAds.sidebar.length > 1 && (
                          <AdBanner ad={activeAds.sidebar[1]} onAdClick={handleAdClick} />
                        )}
                      </div>
                    </aside>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Admin View */}
            {view === 'admin' && isAdmin && (
              <motion.div key="admin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <img 
                        src={adminUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUser?.name}`}
                        alt={adminUser?.name}
                        className="w-12 h-12 rounded-full border-2 border-primary"
                      />
                      <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">{adminUser?.name} • {adminUser?.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => { 
                          setProfileForm({ 
                            name: adminUser?.name || '', 
                            avatar: adminUser?.avatar || '', 
                            bio: adminUser?.bio || '' 
                          }); 
                          setIsProfileDialogOpen(true); 
                        }}
                      >
                        <User className="w-4 h-4 mr-2" />Edit Profile
                      </Button>
                      <Button variant="outline" onClick={() => { fetchPosts(); fetchStats(); fetchComments(); fetchAds(); }}>
                        <RefreshCw className="w-4 h-4 mr-2" />Refresh
                      </Button>
                      <Button variant="outline" onClick={() => setView('public')}>
                        <ExternalLink className="w-4 h-4 mr-2" />View Site
                      </Button>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  {statsLoading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      {[1, 2, 3, 4].map(i => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <Skeleton className="h-20 w-full" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : stats && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      <Card>
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Posts</p>
                              <p className="text-2xl font-bold">{stats.totalPosts}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-primary" />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">{stats.publishedPosts} published, {stats.draftPosts} drafts</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Views</p>
                              <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Eye className="w-6 h-6 text-primary" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Comments</p>
                              <p className="text-2xl font-bold">{stats.totalComments}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <MessageCircle className="w-6 h-6 text-primary" />
                            </div>
                          </div>
                          {stats.pendingComments > 0 && (
                            <p className="text-xs text-amber-600 mt-2">{stats.pendingComments} pending</p>
                          )}
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Active Ads</p>
                              <p className="text-2xl font-bold">{ads.filter(a => a.active).length}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Megaphone className="w-6 h-6 text-primary" />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">{ads.length} total ads</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  
                  <Tabs defaultValue="posts" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:inline-flex">
                      <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
                      <TabsTrigger value="categories">Categories</TabsTrigger>
                      <TabsTrigger value="tags">Tags</TabsTrigger>
                      <TabsTrigger value="comments">Comments</TabsTrigger>
                      <TabsTrigger value="ads">
                        <Megaphone className="w-4 h-4 mr-1" />Ads
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* Posts Tab */}
                    <TabsContent value="posts">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">All Posts</h2>
                        <Dialog open={isPostDialogOpen} onOpenChange={(open) => { setIsPostDialogOpen(open); if (!open) { setEditingPost(null); setPostForm({ title: '', slug: '', excerpt: '', content: '', coverImage: '', published: false, featured: false, readTime: 5, categoryId: '' }); } }}>
                          <DialogTrigger asChild>
                            <Button>
                              <Plus className="w-4 h-4 mr-2" />New Post
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{editingPost ? 'Edit Post' : 'Create Post'}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                  <Label>Title</Label>
                                  <Input value={postForm.title} onChange={(e) => { setPostForm({ ...postForm, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }); }} placeholder="Post title" />
                                </div>
                                <div>
                                  <Label>Slug</Label>
                                  <Input value={postForm.slug} onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })} placeholder="post-url-slug" />
                                </div>
                              </div>
                              <div>
                                <Label>Excerpt</Label>
                                <Textarea value={postForm.excerpt} onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })} placeholder="Brief description" rows={2} />
                              </div>
                              <div>
                                <Label>Content (Markdown)</Label>
                                <Textarea value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} placeholder="# Your post content..." rows={10} className="font-mono" />
                              </div>
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                  <Label>Cover Image URL</Label>
                                  <Input value={postForm.coverImage} onChange={(e) => setPostForm({ ...postForm, coverImage: e.target.value })} placeholder="https://..." />
                                </div>
                                <div>
                                  <Label>Category</Label>
                                  <Select value={postForm.categoryId} onValueChange={(v) => setPostForm({ ...postForm, categoryId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                    <SelectContent>
                                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid sm:grid-cols-3 gap-4">
                                <div>
                                  <Label>Read Time (min)</Label>
                                  <Input type="number" value={postForm.readTime} onChange={(e) => setPostForm({ ...postForm, readTime: parseInt(e.target.value) || 5 })} />
                                </div>
                                <div className="flex items-end">
                                  <div className="flex items-center gap-2">
                                    <Switch checked={postForm.published} onCheckedChange={(v) => setPostForm({ ...postForm, published: v })} />
                                    <Label>Published</Label>
                                  </div>
                                </div>
                                <div className="flex items-end">
                                  <div className="flex items-center gap-2">
                                    <Switch checked={postForm.featured} onCheckedChange={(v) => setPostForm({ ...postForm, featured: v })} />
                                    <Label>Featured</Label>
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsPostDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleSavePost} disabled={savingPost}>
                                  {savingPost ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save</>}
                                </Button>
                              </DialogFooter>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Card>
                        <CardContent className="p-0">
                          {posts.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No posts yet</div>
                          ) : (
                            <>
                              <div className="divide-y divide-border">
                                {posts.slice((postsPage - 1) * adminItemsPerPage, postsPage * adminItemsPerPage).map(post => (
                                  <div key={post.id} className="p-4 hover:bg-muted/30">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                          {post.coverImage ? (
                                            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                                          ) : (
                                            <FileText className="w-full h-full p-2 text-muted-foreground" />
                                          )}
                                        </div>
                                        <div>
                                          <h3 className="font-medium line-clamp-1">{post.title}</h3>
                                          <p className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <Badge variant={post.published ? 'default' : 'secondary'}>
                                              {post.published ? 'Published' : 'Draft'}
                                            </Badge>
                                            {post.featured && (
                                              <Badge variant="outline">
                                                <Sparkles className="w-3 h-3 mr-1" />Featured
                                              </Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground">{post.viewCount} views</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => { setEditingPost(post); setPostForm({ title: post.title, slug: post.slug, excerpt: post.excerpt || '', content: post.content, coverImage: post.coverImage || '', published: post.published, featured: post.featured, readTime: post.readTime, categoryId: post.categoryId || '' }); setIsPostDialogOpen(true); }}>
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)} disabled={deletingPost === post.id}>
                                          {deletingPost === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-destructive" />}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="p-4 border-t border-border">
                                <Pagination 
                                  currentPage={postsPage} 
                                  totalPages={Math.ceil(posts.length / adminItemsPerPage)} 
                                  onPageChange={setPostsPage} 
                                />
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Categories Tab */}
                    <TabsContent value="categories">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Categories</h2>
                        <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => { setIsCategoryDialogOpen(open); if (!open) { setEditingCategory(null); setCategoryForm({ name: '', description: '', color: '#6b7280' }); } }}>
                          <DialogTrigger asChild>
                            <Button>
                              <Plus className="w-4 h-4 mr-2" />New Category
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div>
                                <Label>Name</Label>
                                <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Category name" />
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Brief description" rows={2} />
                              </div>
                              <div>
                                <Label>Color</Label>
                                <div className="flex gap-2">
                                  <Input type="color" value={categoryForm.color} onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })} className="w-16 h-10" />
                                  <Input value={categoryForm.color} onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })} />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleSaveCategory}>{editingCategory ? 'Update' : 'Create'}</Button>
                              </DialogFooter>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map(cat => (
                          <Card key={cat.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color }} />
                                    <h3 className="font-semibold">{cat.name}</h3>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
                                  <p className="text-xs text-muted-foreground mt-2">{cat.postCount || 0} posts</p>
                                </div>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => { setEditingCategory(cat); setCategoryForm({ name: cat.name, description: cat.description || '', color: cat.color }); setIsCategoryDialogOpen(true); }}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id)}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    {/* Tags Tab */}
                    <TabsContent value="tags">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Tags</h2>
                        <Dialog open={isTagDialogOpen} onOpenChange={(open) => { setIsTagDialogOpen(open); if (!open) { setEditingTag(null); setTagForm({ name: '', color: '#6b7280' }); } }}>
                          <DialogTrigger asChild>
                            <Button>
                              <Plus className="w-4 h-4 mr-2" />New Tag
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{editingTag ? 'Edit Tag' : 'Create Tag'}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div>
                                <Label>Name</Label>
                                <Input value={tagForm.name} onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })} placeholder="Tag name" />
                              </div>
                              <div>
                                <Label>Color</Label>
                                <div className="flex gap-2">
                                  <Input type="color" value={tagForm.color} onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })} className="w-16 h-10" />
                                  <Input value={tagForm.color} onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })} />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleSaveTag}>{editingTag ? 'Update' : 'Create'}</Button>
                              </DialogFooter>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {tags.map(tag => (
                          <div key={tag.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                            <Badge style={{ backgroundColor: tag.color }}>{tag.name}</Badge>
                            <span className="text-xs text-muted-foreground">{tag.postCount || 0}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingTag(tag); setTagForm({ name: tag.name, color: tag.color }); setIsTagDialogOpen(true); }}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteTag(tag.id)}>
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    {/* Comments Tab */}
                    <TabsContent value="comments">
                      <h2 className="text-xl font-semibold mb-4">Comment Moderation</h2>
                      <Card>
                        <CardContent className="p-0">
                          {comments.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No comments</div>
                          ) : (
                            <>
                              <div className="divide-y divide-border">
                                {comments.slice((commentsPage - 1) * adminItemsPerPage, commentsPage * adminItemsPerPage).map(comment => (
                                  <div key={comment.id} className="p-4 hover:bg-muted/30">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex items-start gap-3">
                                        <img 
                                          src={comment.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.name}`} 
                                          alt={comment.author?.name} 
                                          className="w-10 h-10 rounded-full" 
                                        />
                                        <div>
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">{comment.author?.name}</span>
                                            <Badge variant={comment.status === 'approved' ? 'default' : comment.status === 'rejected' ? 'destructive' : 'secondary'}>
                                              {comment.status}
                                            </Badge>
                                          </div>
                                          <p className="text-sm text-muted-foreground mb-1">{comment.content}</p>
                                          <p className="text-xs text-muted-foreground">
                                            On: {comment.post?.title || 'Unknown'} • {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                                          </p>
                                        </div>
                                      </div>
                                      {comment.status === 'pending' && (
                                        <div className="flex gap-2">
                                          <Button variant="outline" size="sm" className="text-green-600" onClick={() => handleCommentStatus(comment.id, 'approved')}>
                                            <Check className="w-4 h-4 mr-1" />Approve
                                          </Button>
                                          <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleCommentStatus(comment.id, 'rejected')}>
                                            <XCircle className="w-4 h-4 mr-1" />Reject
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="p-4 border-t border-border">
                                <Pagination 
                                  currentPage={commentsPage} 
                                  totalPages={Math.ceil(comments.length / adminItemsPerPage)} 
                                  onPageChange={setCommentsPage} 
                                />
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Ads Tab */}
                    <TabsContent value="ads">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Ad Management</h2>
                        <Dialog open={isAdDialogOpen} onOpenChange={(open) => { setIsAdDialogOpen(open); if (!open) { setEditingAd(null); setAdForm({ title: '', type: 'banner', position: 'sidebar', content: '', imageUrl: '', linkUrl: '', linkText: '', active: true, priority: 0, startDate: '', endDate: '' }); } }}>
                          <DialogTrigger asChild>
                            <Button>
                              <Plus className="w-4 h-4 mr-2" />New Ad
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{editingAd ? 'Edit Ad' : 'Create Ad'}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                  <Label>Title</Label>
                                  <Input value={adForm.title} onChange={(e) => setAdForm({ ...adForm, title: e.target.value })} placeholder="Ad title" />
                                </div>
                                <div>
                                  <Label>Type</Label>
                                  <Select value={adForm.type} onValueChange={(v) => setAdForm({ ...adForm, type: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="banner">Banner</SelectItem>
                                      <SelectItem value="native">Native</SelectItem>
                                      <SelectItem value="text">Text</SelectItem>
                                      <SelectItem value="video">Video</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                  <Label>Position</Label>
                                  <Select value={adForm.position} onValueChange={(v) => setAdForm({ ...adForm, position: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="header">Header</SelectItem>
                                      <SelectItem value="sidebar">Sidebar</SelectItem>
                                      <SelectItem value="in-post">In-Post</SelectItem>
                                      <SelectItem value="footer">Footer</SelectItem>
                                      <SelectItem value="between-posts">Between Posts</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Priority</Label>
                                  <Input type="number" value={adForm.priority} onChange={(e) => setAdForm({ ...adForm, priority: parseInt(e.target.value) || 0 })} placeholder="0" />
                                </div>
                              </div>
                              <div>
                                <Label>Image URL</Label>
                                <Input value={adForm.imageUrl} onChange={(e) => setAdForm({ ...adForm, imageUrl: e.target.value })} placeholder="https://..." />
                              </div>
                              <div>
                                <Label>Link URL</Label>
                                <Input value={adForm.linkUrl} onChange={(e) => setAdForm({ ...adForm, linkUrl: e.target.value })} placeholder="https://..." />
                              </div>
                              <div>
                                <Label>Link Text</Label>
                                <Input value={adForm.linkText} onChange={(e) => setAdForm({ ...adForm, linkText: e.target.value })} placeholder="Click here" />
                              </div>
                              <div>
                                <Label>Custom HTML (optional)</Label>
                                <Textarea value={adForm.content} onChange={(e) => setAdForm({ ...adForm, content: e.target.value })} placeholder="<script>...</script>" rows={3} />
                              </div>
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                  <Label>Start Date</Label>
                                  <Input type="date" value={adForm.startDate} onChange={(e) => setAdForm({ ...adForm, startDate: e.target.value })} />
                                </div>
                                <div>
                                  <Label>End Date</Label>
                                  <Input type="date" value={adForm.endDate} onChange={(e) => setAdForm({ ...adForm, endDate: e.target.value })} />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch checked={adForm.active} onCheckedChange={(v) => setAdForm({ ...adForm, active: v })} />
                                <Label>Active</Label>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAdDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleSaveAd} disabled={savingAd}>
                                  {savingAd ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save'}
                                </Button>
                              </DialogFooter>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="grid gap-4">
                        {ads.length === 0 ? (
                          <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                              No ads yet
                            </CardContent>
                          </Card>
                        ) : (
                          ads.slice((adsPage - 1) * adminItemsPerPage, adsPage * adminItemsPerPage).map(ad => (
                            <Card key={ad.id} className={!ad.active ? 'opacity-60' : ''}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-4">
                                    <div className="w-20 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                                      {ad.imageUrl ? (
                                        <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <Megaphone className="w-6 h-6 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-medium">{ad.title}</h3>
                                        <Badge variant={ad.active ? 'default' : 'secondary'}>
                                          {ad.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="capitalize">{ad.position}</span>
                                        <span>•</span>
                                        <span>{ad.impressions} impressions</span>
                                        <span>•</span>
                                        <span>{ad.clicks} clicks</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingAd(ad); setAdForm({ title: ad.title, type: ad.type, position: ad.position, content: ad.content || '', imageUrl: ad.imageUrl || '', linkUrl: ad.linkUrl || '', linkText: ad.linkText || '', active: ad.active, priority: ad.priority, startDate: ad.startDate?.split('T')[0] || '', endDate: ad.endDate?.split('T')[0] || '' }); setIsAdDialogOpen(true); }}>
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAd(ad.id)} disabled={deletingAd === ad.id}>
                                      {deletingAd === ad.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-destructive" />}
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                        {ads.length > adminItemsPerPage && (
                          <div className="mt-4">
                            <Pagination 
                              currentPage={adsPage} 
                              totalPages={Math.ceil(ads.length / adminItemsPerPage)} 
                              onPageChange={setAdsPage} 
                            />
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </motion.div>
            )}
            
            {/* About Page */}
            {view === 'about' && (
              <motion.div key="about" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="max-w-4xl mx-auto px-4 py-12">
                  <Button variant="ghost" className="mb-6" onClick={() => setView('public')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
                  </Button>
                  
                  {/* Hero Section */}
                  <div className="text-center mb-16">
                    <img 
                      src="https://i.postimg.cc/PfLrFwh2/2030635822251773952-Photoroom.png"
                      alt="N-LOG"
                      className="w-24 h-24 rounded-2xl mx-auto mb-6 shadow-xl object-contain"
                    />
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">About N-LOG</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      Empowering developers and tech enthusiasts with knowledge, insights, and inspiration.
                    </p>
                  </div>
                  
                  {/* Mission Section */}
                  <section className="mb-16">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                          <Target className="w-6 h-6 text-primary" />
                          Our Mission
                        </h2>
                        <p className="text-muted-foreground mb-4">
                          At N-LOG, we believe in making technology accessible to everyone. Our mission is to create a platform where developers of all skill levels can find valuable resources, learn new technologies, and stay updated with the latest trends in the tech industry.
                        </p>
                        <p className="text-muted-foreground">
                          We strive to deliver high-quality, well-researched content that helps you grow as a developer and make informed decisions in your projects.
                        </p>
                      </div>
                      <div className="rounded-2xl overflow-hidden shadow-xl">
                        <img 
                          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                          alt="Team collaboration"
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    </div>
                  </section>
                  
                  {/* Values Section */}
                  <section className="mb-16">
                    <h2 className="text-2xl font-bold mb-8 text-center">Our Values</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { icon: BookOpen, title: 'Knowledge First', desc: 'We prioritize accuracy and depth in every article we publish.' },
                        { icon: Users, title: 'Community Driven', desc: 'Built by developers, for developers. Your feedback shapes our content.' },
                        { icon: Zap, title: 'Stay Current', desc: 'We cover the latest technologies and best practices.' },
                        { icon: Heart, title: 'Passion', desc: 'We love what we do and it shows in our content.' },
                        { icon: Award, title: 'Quality', desc: 'Every piece is reviewed and refined for excellence.' },
                        { icon: Globe, title: 'Accessibility', desc: 'Free resources available to developers worldwide.' },
                      ].map((item, i) => (
                        <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                          <CardContent className="p-6 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                              <item.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold mb-2">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                  
                  {/* Stats Section */}
                  <section className="mb-16">
                    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-0">
                      <CardContent className="p-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                          <div>
                            <p className="text-3xl font-bold text-primary">{allPublishedPosts.length}+</p>
                            <p className="text-sm text-muted-foreground">Articles Published</p>
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-primary">{categories.length}</p>
                            <p className="text-sm text-muted-foreground">Categories</p>
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-primary">{tags.length}</p>
                            <p className="text-sm text-muted-foreground">Topics Covered</p>
                          </div>
                          <div>
                            <p className="text-3xl font-bold text-primary">10K+</p>
                            <p className="text-sm text-muted-foreground">Monthly Readers</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                  
                  {/* Team Section */}
                  <section>
                    <h2 className="text-2xl font-bold mb-8 text-center">Our Team</h2>
                    <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                      <Card className="border-0 shadow-lg">
                        <CardContent className="p-6 text-center">
                          <img 
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
                            alt="Alex Thompson"
                            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-primary"
                          />
                          <h3 className="font-semibold text-lg">Alex Thompson</h3>
                          <p className="text-sm text-primary mb-2">Founder & Editor</p>
                          <p className="text-sm text-muted-foreground">Senior Software Engineer with 10+ years of experience in web development.</p>
                        </CardContent>
                      </Card>
                      <Card className="border-0 shadow-lg">
                        <CardContent className="p-6 text-center">
                          <img 
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face"
                            alt="Sarah Chen"
                            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-primary"
                          />
                          <h3 className="font-semibold text-lg">Sarah Chen</h3>
                          <p className="text-sm text-primary mb-2">Lead Writer</p>
                          <p className="text-sm text-muted-foreground">Full-stack developer and UX enthusiast passionate about modern web technologies.</p>
                        </CardContent>
                      </Card>
                    </div>
                  </section>
                </div>
              </motion.div>
            )}
            
            {/* Privacy Policy Page */}
            {view === 'privacy' && (
              <motion.div key="privacy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="max-w-4xl mx-auto px-4 py-12">
                  <Button variant="ghost" className="mb-6" onClick={() => setView('public')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
                  </Button>
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10">
                      <Shield className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">Privacy Policy</h1>
                      <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Info className="w-5 h-5 text-primary" />
                          Information We Collect
                        </h2>
                        <p className="text-muted-foreground mb-4">
                          We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us for support. This may include:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                          <li>Name and email address</li>
                          <li>Profile information (optional)</li>
                          <li>Comments and feedback</li>
                          <li>Communication preferences</li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Globe className="w-5 h-5 text-primary" />
                          How We Use Your Information
                        </h2>
                        <p className="text-muted-foreground mb-4">
                          We use the information we collect to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                          <li>Provide, maintain, and improve our services</li>
                          <li>Send you newsletters and marketing communications (with your consent)</li>
                          <li>Respond to your comments, questions, and requests</li>
                          <li>Monitor and analyze trends, usage, and activities</li>
                          <li>Detect and prevent fraudulent activities</li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-primary" />
                          Data Security
                        </h2>
                        <p className="text-muted-foreground">
                          We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <Mail className="w-5 h-5 text-primary" />
                          Contact Us
                        </h2>
                        <p className="text-muted-foreground mb-4">
                          If you have any questions about this Privacy Policy, please contact us:
                        </p>
                        <div className="space-y-2 text-muted-foreground">
                          <p>📧 Email: privacy@nlog.dev</p>
                          <p>📍 Address: 123 Tech Street, San Francisco, CA 94102</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Contact Page */}
            {view === 'contact' && (
              <motion.div key="contact" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="max-w-6xl mx-auto px-4 py-12">
                  <Button variant="ghost" className="mb-6" onClick={() => setView('public')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
                  </Button>
                  
                  {/* Header */}
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                      Have a question, suggestion, or want to collaborate? We'd love to hear from you.
                    </p>
                  </div>
                  
                  <div className="grid lg:grid-cols-5 gap-8">
                    {/* Contact Form */}
                    <div className="lg:col-span-3">
                      <Card className="border-0 shadow-xl">
                        <CardContent className="p-8">
                          <h2 className="text-xl font-semibold mb-6">Send us a Message</h2>
                          <div className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="contact-name">Name *</Label>
                                <Input 
                                  id="contact-name"
                                  value={contactForm.name}
                                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                  placeholder="John Doe"
                                />
                              </div>
                              <div>
                                <Label htmlFor="contact-email">Email *</Label>
                                <Input 
                                  id="contact-email"
                                  type="email"
                                  value={contactForm.email}
                                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                  placeholder="john@example.com"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="contact-subject">Subject</Label>
                              <Input 
                                id="contact-subject"
                                value={contactForm.subject}
                                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                                placeholder="How can we help?"
                              />
                            </div>
                            <div>
                              <Label htmlFor="contact-message">Message *</Label>
                              <Textarea 
                                id="contact-message"
                                value={contactForm.message}
                                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                placeholder="Tell us more about your inquiry..."
                                rows={6}
                              />
                            </div>
                            <Button 
                              className="w-full" 
                              onClick={handleContactSubmit}
                              disabled={contactSubmitting}
                            >
                              {contactSubmitting ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                              ) : (
                                <><Send className="w-4 h-4 mr-2" />Send Message</>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="lg:col-span-2 space-y-6">
                      <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Mail className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold mb-1">Email Us</h3>
                              <p className="text-muted-foreground text-sm mb-2">We'll respond within 24 hours</p>
                              <a href="mailto:hello@nlog.dev" className="text-primary hover:underline">hello@nlog.dev</a>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold mb-1">Visit Us</h3>
                              <p className="text-muted-foreground text-sm mb-2">Our headquarters</p>
                              <p className="text-sm">123 Tech Street<br />San Francisco, CA 94102<br />United States</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                          <h3 className="font-semibold mb-4">Follow Us</h3>
                          <div className="flex gap-3">
                            <Button variant="outline" size="icon" className="rounded-lg">
                              <Twitter className="w-5 h-5" />
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-lg">
                              <Linkedin className="w-5 h-5" />
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-lg">
                              <Facebook className="w-5 h-5" />
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-lg">
                              <Globe className="w-5 h-5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        {/* Profile Dialog */}
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <img 
                    src={profileForm.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileForm.name}`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-primary object-cover"
                  />
                </div>
              </div>
              <div>
                <Label>Display Name</Label>
                <Input 
                  value={profileForm.name} 
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} 
                  placeholder="Your name" 
                />
              </div>
              <div>
                <Label>Avatar URL</Label>
                <Input 
                  value={profileForm.avatar} 
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })} 
                  placeholder="https://example.com/avatar.jpg" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a URL for your profile picture (recommended: 200x200px)
                </p>
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea 
                  value={profileForm.bio} 
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} 
                  placeholder="Tell readers about yourself..." 
                  rows={4} 
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateProfile} disabled={savingProfile}>
                  {savingProfile ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Footer */}
        <footer className="mt-auto border-t border-border bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <img 
                    src="https://i.postimg.cc/PfLrFwh2/2030635822251773952-Photoroom.png"
                    alt="N-LOG"
                    className="w-8 h-8 rounded-lg object-contain"
                  />
                  <span className="font-bold text-lg">N-LOG</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover the latest in technology, programming, and digital innovation.
                </p>
                <div className="flex gap-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                    <Facebook className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <div className="space-y-2">
                  <button onClick={() => { setView('public'); setSelectedCategory(null); setSelectedTag(null); }} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Home</button>
                  <button onClick={() => setView('about')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</button>
                  <button onClick={() => setView('contact')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</button>
                  <button onClick={() => setIsSearchOpen(true)} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Search</button>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Categories</h4>
                <div className="space-y-2">
                  {categories.slice(0, 5).map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setSelectedTag(null); setView('public'); }}
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <div className="space-y-2">
                  <button onClick={() => setView('privacy')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</button>
                  <button onClick={() => setView('privacy')} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</button>
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Stats</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>{stats?.totalPosts || 0} articles • {stats?.totalViews?.toLocaleString() || 0} views</p>
                  </div>
                </div>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} N-LOG. All rights reserved.</p>
              <div className="flex gap-4">
                <button onClick={() => setView('privacy')} className="hover:text-foreground transition-colors">Privacy</button>
                <button onClick={() => setView('about')} className="hover:text-foreground transition-colors">About</button>
                <button onClick={() => setView('contact')} className="hover:text-foreground transition-colors">Contact</button>
              </div>
            </div>
          </div>
        </footer>
        
        {/* Search Dialog - Fixed with DialogTitle */}
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogContent className="p-0 overflow-hidden max-w-lg">
            {/* Visually hidden title for accessibility */}
            <DialogTitle className="sr-only">Search posts, categories, and tags</DialogTitle>
            <Command shouldFilter={false} className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
              <CommandInput 
                ref={searchInputRef}
                placeholder="Search posts, categories, tags..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                {searchQuery && searchResults.posts.length === 0 && searchResults.categories.length === 0 && searchResults.tags.length === 0 ? (
                  <CommandEmpty>No results found.</CommandEmpty>
                ) : null}
                {searchResults.posts.length > 0 && (
                  <CommandGroup heading="Posts">
                    {searchResults.posts.map(post => (
                      <CommandItem
                        key={post.id}
                        onSelect={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          fetchPost(post.slug);
                        }}
                        className="cursor-pointer"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        <span>{post.title}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {searchResults.categories.length > 0 && (
                  <CommandGroup heading="Categories">
                    {searchResults.categories.map(cat => (
                      <CommandItem
                        key={cat.id}
                        onSelect={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                          setSelectedCategory(cat.id);
                          setView('public');
                        }}
                        className="cursor-pointer"
                      >
                        <Folder className="w-4 h-4 mr-2" style={{ color: cat.color }} />
                        <span>{cat.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {searchResults.tags.length > 0 && (
                  <CommandGroup heading="Tags">
                    {searchResults.tags.map(tag => (
                      <CommandItem
                        key={tag.id}
                        className="cursor-pointer"
                      >
                        <Badge variant="outline" style={{ borderColor: tag.color, color: tag.color }} className="mr-2">
                          {tag.name}
                        </Badge>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </DialogContent>
        </Dialog>
        
        <Toaster />
      </div>
    </div>
  );
}
