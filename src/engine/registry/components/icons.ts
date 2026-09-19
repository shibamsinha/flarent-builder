import {
  Activity, Award, BadgeCheck, Bell, Bike, Book, BookOpen, Brain, Brush, Briefcase, Building2,
  Cake, Calendar, Camera, Car, ChartBar, ChartPie, Check, ChefHat, CircleCheck, CircleDollarSign,
  CircleHelp, Clipboard, Clock, Cloud, Code, Coffee, Compass, Contact, Cpu, CreditCard, Crown,
  Database, DollarSign, Download, Dribbble, Droplet, Dumbbell, Eye, Facebook, FileText, Flame,
  Flower2, Folder, Gem, Gift, Github, Globe, GalleryHorizontal, Handshake, Hammer, Headphones,
  Heart, HeartPulse, House, Image, Instagram, Key, Laptop, Layers, Leaf, Lightbulb, Linkedin, Lock,
  Mail, Map, MapPin, MessageCircle, MessageSquare, Mic, Monitor, Moon, Music, Navigation, Package,
  PaintBucket, Palette, PenTool, Phone, Pill, Pizza, Plane, Rocket, Ruler, Scissors, Search, Send,
  Server, Settings, ShieldCheck, ShoppingBag, ShoppingCart, Smartphone, Smile, Sparkles,
  Stethoscope, Store, Sun, Tag, Target, Terminal, ThumbsUp, TrendingUp, Trophy, Truck, Twitter,
  User, UserCheck, Users, UtensilsCrossed, Video, Wallet, Wifi, Wine, Wrench, Youtube, Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * A curated icon set. Explicit imports keep the bundle small (the full Lucide
 * set is ~1500 icons) and give the icon picker a stable, predictable list.
 */
export const ICON_LIBRARY: Record<string, LucideIcon> = {
  Activity, Award, BadgeCheck, Bell, Bike, Book, BookOpen, Brain, Brush, Briefcase, Building2,
  Cake, Calendar, Camera, Car, ChartBar, ChartPie, Check, ChefHat, CircleCheck, CircleDollarSign,
  CircleHelp, Clipboard, Clock, Cloud, Code, Coffee, Compass, Contact, Cpu, CreditCard, Crown,
  Database, DollarSign, Download, Dribbble, Droplet, Dumbbell, Eye, Facebook, FileText, Flame,
  Flower2, Folder, GalleryHorizontal, Gem, Gift, Github, Globe, Hammer, Handshake, Headphones,
  Heart, HeartPulse, House, Image, Instagram, Key, Laptop, Layers, Leaf, Lightbulb, Linkedin, Lock,
  Mail, Map, MapPin, MessageCircle, MessageSquare, Mic, Monitor, Moon, Music, Navigation, Package,
  PaintBucket, Palette, PenTool, Phone, Pill, Pizza, Plane, Rocket, Ruler, Scissors, Search, Send,
  Server, Settings, ShieldCheck, ShoppingBag, ShoppingCart, Smartphone, Smile, Sparkles,
  Stethoscope, Store, Sun, Tag, Target, Terminal, ThumbsUp, TrendingUp, Trophy, Truck, Twitter,
  User, UserCheck, Users, UtensilsCrossed, Video, Wallet, Wifi, Wine, Wrench, Youtube, Zap,
};

export const ICON_NAMES = Object.keys(ICON_LIBRARY).sort();

export function getIcon(name: string | undefined): LucideIcon {
  return (name && ICON_LIBRARY[name]) || Sparkles;
}

export const SOCIAL_ICONS = [
  'Facebook', 'Instagram', 'Twitter', 'Linkedin', 'Youtube', 'Github', 'Dribbble', 'Globe',
  'MessageCircle', 'Mail', 'Phone',
];
