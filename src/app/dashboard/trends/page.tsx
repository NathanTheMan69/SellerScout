"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent } from "@/components/Card"
import { DashboardLayout } from "@/components/DashboardLayout"
import {
    TrendingUp, TrendingDown, ArrowUpRight, ChevronLeft, ChevronRight, ChevronDown,
    Filter, X, ExternalLink, BarChart2, Tag, DollarSign, Zap, ImageOff,
    Search, Copy, Check, Layers, Flame, Star, ShieldCheck, Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/Button"
import { createClient } from "@/utils/supabase/client"
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts"

interface TrendData {
    id: string
    keyword: string
    search_volume: number
    competition: string
    growth: number
    avg_price: string
    monthly_searches: { month: string, volume: number }[]
    category: string
    created_at: string
    image?: string
}

const ITEMS_PER_PAGE = 30

const STATIC_TRENDS: TrendData[] = [
    { id: 's1',  keyword: 'digital planner 2025',        category: 'Digital',      search_volume: 32000, competition: 'Medium',    growth: 210,  avg_price: '$8–$22',   image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:18000 },{ month:'Feb', volume:20000 },{ month:'Mar', volume:22000 },{ month:'Apr', volume:25000 },{ month:'May', volume:26000 },{ month:'Jun', volume:27000 },{ month:'Jul', volume:28000 },{ month:'Aug', volume:29000 },{ month:'Sep', volume:30000 },{ month:'Oct', volume:31000 },{ month:'Nov', volume:31500 },{ month:'Dec', volume:32000 }] },
    { id: 's2',  keyword: 'personalized leather gift',    category: 'Gifts',        search_volume: 45000, competition: 'High',       growth: 125,  avg_price: '$35–$90',  image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:28000 },{ month:'Feb', volume:30000 },{ month:'Mar', volume:33000 },{ month:'Apr', volume:35000 },{ month:'May', volume:36000 },{ month:'Jun', volume:37000 },{ month:'Jul', volume:38000 },{ month:'Aug', volume:40000 },{ month:'Sep', volume:41000 },{ month:'Oct', volume:43000 },{ month:'Nov', volume:44000 },{ month:'Dec', volume:45000 }] },
    { id: 's3',  keyword: 'minimalist wall art',          category: 'Home Decor',   search_volume: 28000, competition: 'High',       growth: -45,  avg_price: '$3–$15',   image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:42000 },{ month:'Feb', volume:40000 },{ month:'Mar', volume:38000 },{ month:'Apr', volume:36000 },{ month:'May', volume:34000 },{ month:'Jun', volume:33000 },{ month:'Jul', volume:32000 },{ month:'Aug', volume:31000 },{ month:'Sep', volume:30000 },{ month:'Oct', volume:29000 },{ month:'Nov', volume:28500 },{ month:'Dec', volume:28000 }] },
    { id: 's4',  keyword: 'custom name necklace',         category: 'Jewelry',      search_volume: 61000, competition: 'High',       growth: 88,   avg_price: '$20–$55',  image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:40000 },{ month:'Feb', volume:43000 },{ month:'Mar', volume:46000 },{ month:'Apr', volume:49000 },{ month:'May', volume:51000 },{ month:'Jun', volume:53000 },{ month:'Jul', volume:55000 },{ month:'Aug', volume:57000 },{ month:'Sep', volume:58000 },{ month:'Oct', volume:59000 },{ month:'Nov', volume:60000 },{ month:'Dec', volume:61000 }] },
    { id: 's5',  keyword: 'beaded bracelet set',          category: 'Jewelry',      search_volume: 38000, competition: 'Medium',     growth: 174,  avg_price: '$12–$30',  image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:14000 },{ month:'Feb', volume:17000 },{ month:'Mar', volume:20000 },{ month:'Apr', volume:22000 },{ month:'May', volume:25000 },{ month:'Jun', volume:27000 },{ month:'Jul', volume:29000 },{ month:'Aug', volume:31000 },{ month:'Sep', volume:33000 },{ month:'Oct', volume:35000 },{ month:'Nov', volume:36500 },{ month:'Dec', volume:38000 }] },
    { id: 's6',  keyword: 'macrame wall hanging',         category: 'Home Decor',   search_volume: 22000, competition: 'Low',        growth: 92,   avg_price: '$35–$120', image: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:11000 },{ month:'Feb', volume:12000 },{ month:'Mar', volume:13000 },{ month:'Apr', volume:14000 },{ month:'May', volume:15000 },{ month:'Jun', volume:16000 },{ month:'Jul', volume:17000 },{ month:'Aug', volume:18000 },{ month:'Sep', volume:19000 },{ month:'Oct', volume:20000 },{ month:'Nov', volume:21000 },{ month:'Dec', volume:22000 }] },
    { id: 's7',  keyword: 'custom pet portrait',          category: 'Art',          search_volume: 54000, competition: 'High',       growth: 145,  avg_price: '$25–$80',  image: 'https://images.unsplash.com/photo-1583511655826-05700442982a?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:30000 },{ month:'Feb', volume:33000 },{ month:'Mar', volume:36000 },{ month:'Apr', volume:38000 },{ month:'May', volume:40000 },{ month:'Jun', volume:42000 },{ month:'Jul', volume:44000 },{ month:'Aug', volume:46000 },{ month:'Sep', volume:48000 },{ month:'Oct', volume:50000 },{ month:'Nov', volume:52000 },{ month:'Dec', volume:54000 }] },
    { id: 's8',  keyword: 'printable budget planner',     category: 'Digital',      search_volume: 19000, competition: 'Low',        growth: 188,  avg_price: '$3–$10',   image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:6000 },{ month:'Feb', volume:7500 },{ month:'Mar', volume:9000 },{ month:'Apr', volume:10500 },{ month:'May', volume:12000 },{ month:'Jun', volume:13000 },{ month:'Jul', volume:14000 },{ month:'Aug', volume:15000 },{ month:'Sep', volume:16000 },{ month:'Oct', volume:17000 },{ month:'Nov', volume:18000 },{ month:'Dec', volume:19000 }] },
    { id: 's9',  keyword: 'boho wedding decor',           category: 'Wedding',      search_volume: 41000, competition: 'Medium',     growth: 67,   avg_price: '$15–$60',  image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:25000 },{ month:'Feb', volume:27000 },{ month:'Mar', volume:29000 },{ month:'Apr', volume:31000 },{ month:'May', volume:33000 },{ month:'Jun', volume:34000 },{ month:'Jul', volume:35000 },{ month:'Aug', volume:37000 },{ month:'Sep', volume:38000 },{ month:'Oct', volume:39000 },{ month:'Nov', volume:40000 },{ month:'Dec', volume:41000 }] },
    { id: 's10', keyword: 'handmade soy candle',          category: 'Home Decor',   search_volume: 35000, competition: 'Medium',     growth: 55,   avg_price: '$12–$35',  image: 'https://images.unsplash.com/photo-1603905623639-cbe42eea3087?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:22000 },{ month:'Feb', volume:23000 },{ month:'Mar', volume:24000 },{ month:'Apr', volume:25000 },{ month:'May', volume:27000 },{ month:'Jun', volume:28000 },{ month:'Jul', volume:29000 },{ month:'Aug', volume:30000 },{ month:'Sep', volume:31000 },{ month:'Oct', volume:32000 },{ month:'Nov', volume:33500 },{ month:'Dec', volume:35000 }] },
    { id: 's11', keyword: 'personalized baby gift',       category: 'Gifts',        search_volume: 57000, competition: 'High',       growth: 103,  avg_price: '$20–$65',  image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:35000 },{ month:'Feb', volume:37000 },{ month:'Mar', volume:39000 },{ month:'Apr', volume:41000 },{ month:'May', volume:43000 },{ month:'Jun', volume:45000 },{ month:'Jul', volume:47000 },{ month:'Aug', volume:49000 },{ month:'Sep', volume:51000 },{ month:'Oct', volume:53000 },{ month:'Nov', volume:55000 },{ month:'Dec', volume:57000 }] },
    { id: 's12', keyword: 'sticker pack',                 category: 'Stationery',   search_volume: 74000, competition: 'High',       growth: 38,   avg_price: '$3–$8',    image: 'https://images.unsplash.com/photo-1574126154517-d1e0d89ef264?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:53000 },{ month:'Feb', volume:55000 },{ month:'Mar', volume:57000 },{ month:'Apr', volume:59000 },{ month:'May', volume:61000 },{ month:'Jun', volume:63000 },{ month:'Jul', volume:65000 },{ month:'Aug', volume:67000 },{ month:'Sep', volume:69000 },{ month:'Oct', volume:70000 },{ month:'Nov', volume:72000 },{ month:'Dec', volume:74000 }] },
    { id: 's13', keyword: 'vintage style ring',           category: 'Jewelry',      search_volume: 26000, competition: 'Medium',     growth: 79,   avg_price: '$18–$55',  image: 'https://images.unsplash.com/photo-1616077167999-51d36a3e7fcf?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:14000 },{ month:'Feb', volume:15000 },{ month:'Mar', volume:16000 },{ month:'Apr', volume:17000 },{ month:'May', volume:18000 },{ month:'Jun', volume:19000 },{ month:'Jul', volume:20000 },{ month:'Aug', volume:21500 },{ month:'Sep', volume:22500 },{ month:'Oct', volume:23500 },{ month:'Nov', volume:25000 },{ month:'Dec', volume:26000 }] },
    { id: 's14', keyword: 'nursery wall art printable',   category: 'Digital',      search_volume: 17000, competition: 'Low',        growth: 162,  avg_price: '$3–$10',   image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:6500 },{ month:'Feb', volume:7500 },{ month:'Mar', volume:8500 },{ month:'Apr', volume:9500 },{ month:'May', volume:10500 },{ month:'Jun', volume:11500 },{ month:'Jul', volume:12500 },{ month:'Aug', volume:13500 },{ month:'Sep', volume:14500 },{ month:'Oct', volume:15500 },{ month:'Nov', volume:16000 },{ month:'Dec', volume:17000 }] },
    { id: 's15', keyword: 'chunky knit blanket',          category: 'Home Decor',   search_volume: 30000, competition: 'Medium',     growth: 44,   avg_price: '$45–$120', image: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:20000 },{ month:'Feb', volume:20500 },{ month:'Mar', volume:21000 },{ month:'Apr', volume:22000 },{ month:'May', volume:23000 },{ month:'Jun', volume:24000 },{ month:'Jul', volume:25000 },{ month:'Aug', volume:26000 },{ month:'Sep', volume:27000 },{ month:'Oct', volume:28000 },{ month:'Nov', volume:29000 },{ month:'Dec', volume:30000 }] },
    { id: 's16', keyword: 'custom wedding invitation',    category: 'Wedding',      search_volume: 48000, competition: 'High',       growth: 72,   avg_price: '$10–$40',  image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:28000 },{ month:'Feb', volume:30000 },{ month:'Mar', volume:32000 },{ month:'Apr', volume:34000 },{ month:'May', volume:36000 },{ month:'Jun', volume:38000 },{ month:'Jul', volume:40000 },{ month:'Aug', volume:42000 },{ month:'Sep', volume:43000 },{ month:'Oct', volume:45000 },{ month:'Nov', volume:46500 },{ month:'Dec', volume:48000 }] },
    { id: 's17', keyword: 'embroidery hoop art',          category: 'Art',          search_volume: 14000, competition: 'Low',        growth: 131,  avg_price: '$15–$45',  image: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:5000 },{ month:'Feb', volume:6000 },{ month:'Mar', volume:7000 },{ month:'Apr', volume:7500 },{ month:'May', volume:8500 },{ month:'Jun', volume:9000 },{ month:'Jul', volume:10000 },{ month:'Aug', volume:11000 },{ month:'Sep', volume:12000 },{ month:'Oct', volume:12500 },{ month:'Nov', volume:13500 },{ month:'Dec', volume:14000 }] },
    { id: 's18', keyword: 'resin coaster set',            category: 'Home Decor',   search_volume: 21000, competition: 'Low',        growth: 118,  avg_price: '$20–$50',  image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:9000 },{ month:'Feb', volume:10000 },{ month:'Mar', volume:11000 },{ month:'Apr', volume:12000 },{ month:'May', volume:13000 },{ month:'Jun', volume:14500 },{ month:'Jul', volume:15500 },{ month:'Aug', volume:16500 },{ month:'Sep', volume:17500 },{ month:'Oct', volume:18500 },{ month:'Nov', volume:19500 },{ month:'Dec', volume:21000 }] },
    { id: 's19', keyword: 'dad gifts from daughter',      category: 'Gifts',        search_volume: 39000, competition: 'Medium',     growth: 96,   avg_price: '$15–$50',  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:19000 },{ month:'Feb', volume:21000 },{ month:'Mar', volume:23000 },{ month:'Apr', volume:25000 },{ month:'May', volume:27000 },{ month:'Jun', volume:29000 },{ month:'Jul', volume:31000 },{ month:'Aug', volume:33000 },{ month:'Sep', volume:34000 },{ month:'Oct', volume:36000 },{ month:'Nov', volume:37500 },{ month:'Dec', volume:39000 }] },
    { id: 's20', keyword: 'planner sticker sheet',        category: 'Stationery',   search_volume: 52000, competition: 'High',       growth: 29,   avg_price: '$2–$6',    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:39000 },{ month:'Feb', volume:40000 },{ month:'Mar', volume:41500 },{ month:'Apr', volume:43000 },{ month:'May', volume:44500 },{ month:'Jun', volume:46000 },{ month:'Jul', volume:47500 },{ month:'Aug', volume:48500 },{ month:'Sep', volume:49500 },{ month:'Oct', volume:50000 },{ month:'Nov', volume:51000 },{ month:'Dec', volume:52000 }] },
    { id: 's21', keyword: 'crystal healing set',          category: 'Wellness',     search_volume: 27000, competition: 'Medium',     growth: 143,  avg_price: '$15–$45',  image: 'https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:11000 },{ month:'Feb', volume:12500 },{ month:'Mar', volume:14000 },{ month:'Apr', volume:15500 },{ month:'May', volume:17000 },{ month:'Jun', volume:18000 },{ month:'Jul', volume:19500 },{ month:'Aug', volume:21000 },{ month:'Sep', volume:22000 },{ month:'Oct', volume:24000 },{ month:'Nov', volume:25500 },{ month:'Dec', volume:27000 }] },
    { id: 's22', keyword: 'pressed flower bookmark',      category: 'Stationery',   search_volume: 9500,  competition: 'Low',        growth: 207,  avg_price: '$5–$15',   image: 'https://images.unsplash.com/photo-1549921296-3b0f9a35af35?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:3000 },{ month:'Feb', volume:3500 },{ month:'Mar', volume:4500 },{ month:'Apr', volume:5000 },{ month:'May', volume:5500 },{ month:'Jun', volume:6500 },{ month:'Jul', volume:7000 },{ month:'Aug', volume:7500 },{ month:'Sep', volume:8000 },{ month:'Oct', volume:8500 },{ month:'Nov', volume:9000 },{ month:'Dec', volume:9500 }] },
    { id: 's23', keyword: 'gold initial necklace',        category: 'Jewelry',      search_volume: 68000, competition: 'Very High',  growth: 15,   avg_price: '$18–$60',  image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:59000 },{ month:'Feb', volume:60000 },{ month:'Mar', volume:61000 },{ month:'Apr', volume:62000 },{ month:'May', volume:63000 },{ month:'Jun', volume:64000 },{ month:'Jul', volume:64500 },{ month:'Aug', volume:65000 },{ month:'Sep', volume:66000 },{ month:'Oct', volume:67000 },{ month:'Nov', volume:67500 },{ month:'Dec', volume:68000 }] },
    { id: 's24', keyword: 'custom dog bandana',           category: 'Pet Supplies', search_volume: 16000, competition: 'Low',        growth: 189,  avg_price: '$8–$20',   image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:5500 },{ month:'Feb', volume:6500 },{ month:'Mar', volume:7500 },{ month:'Apr', volume:8500 },{ month:'May', volume:9500 },{ month:'Jun', volume:10500 },{ month:'Jul', volume:11500 },{ month:'Aug', volume:12500 },{ month:'Sep', volume:13500 },{ month:'Oct', volume:14500 },{ month:'Nov', volume:15500 },{ month:'Dec', volume:16000 }] },
    { id: 's25', keyword: 'affirmation card deck',        category: 'Wellness',     search_volume: 12000, competition: 'Low',        growth: 221,  avg_price: '$12–$30',  image: 'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:3700 },{ month:'Feb', volume:4500 },{ month:'Mar', volume:5500 },{ month:'Apr', volume:6500 },{ month:'May', volume:7200 },{ month:'Jun', volume:8000 },{ month:'Jul', volume:8800 },{ month:'Aug', volume:9500 },{ month:'Sep', volume:10000 },{ month:'Oct', volume:10800 },{ month:'Nov', volume:11400 },{ month:'Dec', volume:12000 }] },
    { id: 's26', keyword: 'personalised mug',             category: 'Gifts',        search_volume: 83000, competition: 'Very High',  growth: -12,  avg_price: '$12–$25',  image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:94000 },{ month:'Feb', volume:92000 },{ month:'Mar', volume:91000 },{ month:'Apr', volume:90000 },{ month:'May', volume:89000 },{ month:'Jun', volume:87000 },{ month:'Jul', volume:86000 },{ month:'Aug', volume:85000 },{ month:'Sep', volume:84500 },{ month:'Oct', volume:84000 },{ month:'Nov', volume:83500 },{ month:'Dec', volume:83000 }] },
    { id: 's27', keyword: 'crochet baby blanket',         category: 'Baby',         search_volume: 24000, competition: 'Medium',     growth: 61,   avg_price: '$25–$70',  image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:14000 },{ month:'Feb', volume:15000 },{ month:'Mar', volume:16000 },{ month:'Apr', volume:17000 },{ month:'May', volume:18000 },{ month:'Jun', volume:19000 },{ month:'Jul', volume:20000 },{ month:'Aug', volume:21000 },{ month:'Sep', volume:22000 },{ month:'Oct', volume:22500 },{ month:'Nov', volume:23500 },{ month:'Dec', volume:24000 }] },
    { id: 's28', keyword: 'motivational poster',          category: 'Art',          search_volume: 31000, competition: 'High',       growth: 33,   avg_price: '$3–$12',   image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:23000 },{ month:'Feb', volume:23500 },{ month:'Mar', volume:24500 },{ month:'Apr', volume:25000 },{ month:'May', volume:26000 },{ month:'Jun', volume:27000 },{ month:'Jul', volume:28000 },{ month:'Aug', volume:28500 },{ month:'Sep', volume:29500 },{ month:'Oct', volume:30000 },{ month:'Nov', volume:30500 },{ month:'Dec', volume:31000 }] },
    { id: 's29', keyword: 'handmade leather wallet',      category: 'Accessories',  search_volume: 18000, competition: 'Medium',     growth: 84,   avg_price: '$30–$80',  image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:9000 },{ month:'Feb', volume:10000 },{ month:'Mar', volume:11000 },{ month:'Apr', volume:12000 },{ month:'May', volume:13000 },{ month:'Jun', volume:14000 },{ month:'Jul', volume:15000 },{ month:'Aug', volume:15500 },{ month:'Sep', volume:16000 },{ month:'Oct', volume:17000 },{ month:'Nov', volume:17500 },{ month:'Dec', volume:18000 }] },
    { id: 's30', keyword: 'self care gift basket',        category: 'Wellness',     search_volume: 43000, competition: 'Medium',     growth: 112,  avg_price: '$25–$75',  image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:20000 },{ month:'Feb', volume:22000 },{ month:'Mar', volume:24000 },{ month:'Apr', volume:26000 },{ month:'May', volume:28000 },{ month:'Jun', volume:30000 },{ month:'Jul', volume:32000 },{ month:'Aug', volume:34000 },{ month:'Sep', volume:37000 },{ month:'Oct', volume:39000 },{ month:'Nov', volume:41000 },{ month:'Dec', volume:43000 }] },
    { id: 's31', keyword: 'personalized keychain',        category: 'Accessories',  search_volume: 29000, competition: 'Medium',     growth: 98,   avg_price: '$8–$22',   image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:14000 },{ month:'Feb', volume:16000 },{ month:'Mar', volume:17500 },{ month:'Apr', volume:19000 },{ month:'May', volume:21000 },{ month:'Jun', volume:22000 },{ month:'Jul', volume:23500 },{ month:'Aug', volume:25000 },{ month:'Sep', volume:26000 },{ month:'Oct', volume:27000 },{ month:'Nov', volume:28000 },{ month:'Dec', volume:29000 }] },
    { id: 's32', keyword: 'linen tote bag',               category: 'Accessories',  search_volume: 21000, competition: 'Low',        growth: 153,  avg_price: '$12–$30',  image: 'https://images.unsplash.com/photo-1544816565-a62c5d3a0e35?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:8000 },{ month:'Feb', volume:9500 },{ month:'Mar', volume:11000 },{ month:'Apr', volume:12500 },{ month:'May', volume:14000 },{ month:'Jun', volume:15500 },{ month:'Jul', volume:17000 },{ month:'Aug', volume:18000 },{ month:'Sep', volume:19000 },{ month:'Oct', volume:20000 },{ month:'Nov', volume:20500 },{ month:'Dec', volume:21000 }] },
    { id: 's33', keyword: 'watercolor print',             category: 'Art',          search_volume: 36000, competition: 'High',       growth: 47,   avg_price: '$5–$20',   image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:24000 },{ month:'Feb', volume:25000 },{ month:'Mar', volume:26500 },{ month:'Apr', volume:28000 },{ month:'May', volume:29500 },{ month:'Jun', volume:31000 },{ month:'Jul', volume:32000 },{ month:'Aug', volume:33000 },{ month:'Sep', volume:34000 },{ month:'Oct', volume:35000 },{ month:'Nov', volume:35500 },{ month:'Dec', volume:36000 }] },
    { id: 's34', keyword: 'custom baby name sign',        category: 'Baby',         search_volume: 33000, competition: 'Medium',     growth: 119,  avg_price: '$20–$55',  image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:15000 },{ month:'Feb', volume:17000 },{ month:'Mar', volume:19000 },{ month:'Apr', volume:21000 },{ month:'May', volume:23000 },{ month:'Jun', volume:25000 },{ month:'Jul', volume:27000 },{ month:'Aug', volume:29000 },{ month:'Sep', volume:30000 },{ month:'Oct', volume:31500 },{ month:'Nov', volume:32500 },{ month:'Dec', volume:33000 }] },
    { id: 's35', keyword: 'enamel pin set',               category: 'Accessories',  search_volume: 17500, competition: 'Low',        growth: 176,  avg_price: '$6–$18',   image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:6000 },{ month:'Feb', volume:7500 },{ month:'Mar', volume:9000 },{ month:'Apr', volume:10500 },{ month:'May', volume:12000 },{ month:'Jun', volume:13000 },{ month:'Jul', volume:14000 },{ month:'Aug', volume:15000 },{ month:'Sep', volume:16000 },{ month:'Oct', volume:16500 },{ month:'Nov', volume:17000 },{ month:'Dec', volume:17500 }] },
    { id: 's36', keyword: 'terracotta planter',           category: 'Home Decor',   search_volume: 25000, competition: 'Low',        growth: 138,  avg_price: '$15–$45',  image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:10000 },{ month:'Feb', volume:11500 },{ month:'Mar', volume:13000 },{ month:'Apr', volume:15000 },{ month:'May', volume:17000 },{ month:'Jun', volume:18500 },{ month:'Jul', volume:20000 },{ month:'Aug', volume:21500 },{ month:'Sep', volume:22500 },{ month:'Oct', volume:23500 },{ month:'Nov', volume:24500 },{ month:'Dec', volume:25000 }] },
    { id: 's37', keyword: 'bridal party gift',            category: 'Wedding',      search_volume: 44000, competition: 'High',       growth: 81,   avg_price: '$20–$60',  image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:24000 },{ month:'Feb', volume:26000 },{ month:'Mar', volume:28000 },{ month:'Apr', volume:30000 },{ month:'May', volume:32000 },{ month:'Jun', volume:34000 },{ month:'Jul', volume:36000 },{ month:'Aug', volume:38000 },{ month:'Sep', volume:40000 },{ month:'Oct', volume:41500 },{ month:'Nov', volume:43000 },{ month:'Dec', volume:44000 }] },
    { id: 's38', keyword: 'mushroom art print',           category: 'Art',          search_volume: 11000, competition: 'Low',        growth: 245,  avg_price: '$4–$15',   image: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:3000 },{ month:'Feb', volume:3800 },{ month:'Mar', volume:5000 },{ month:'Apr', volume:6000 },{ month:'May', volume:7000 },{ month:'Jun', volume:7800 },{ month:'Aug', volume:8500 },{ month:'Sep', volume:9200 },{ month:'Oct', volume:9800 },{ month:'Nov', volume:10400 },{ month:'Dec', volume:11000 },{ month:'Jul', volume:8000 }] },
    { id: 's39', keyword: 'wax seal stamp kit',           category: 'Stationery',   search_volume: 14500, competition: 'Low',        growth: 199,  avg_price: '$12–$35',  image: 'https://images.unsplash.com/photo-1585075928489-f58b6a5e9e8a?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:4500 },{ month:'Feb', volume:5500 },{ month:'Mar', volume:6500 },{ month:'Apr', volume:7500 },{ month:'May', volume:8500 },{ month:'Jun', volume:9500 },{ month:'Jul', volume:10500 },{ month:'Aug', volume:11500 },{ month:'Sep', volume:12500 },{ month:'Oct', volume:13000 },{ month:'Nov', volume:14000 },{ month:'Dec', volume:14500 }] },
    { id: 's40', keyword: 'custom portrait illustration', category: 'Art',          search_volume: 47000, competition: 'High',       growth: 127,  avg_price: '$30–$90',  image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:21000 },{ month:'Feb', volume:24000 },{ month:'Mar', volume:27000 },{ month:'Apr', volume:30000 },{ month:'May', volume:33000 },{ month:'Jun', volume:36000 },{ month:'Jul', volume:39000 },{ month:'Aug', volume:41000 },{ month:'Sep', volume:43000 },{ month:'Oct', volume:45000 },{ month:'Nov', volume:46000 },{ month:'Dec', volume:47000 }] },
    { id: 's41', keyword: 'zodiac jewelry',               category: 'Jewelry',      search_volume: 32000, competition: 'Medium',     growth: 167,  avg_price: '$15–$45',  image: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:12000 },{ month:'Feb', volume:14000 },{ month:'Mar', volume:16000 },{ month:'Apr', volume:18000 },{ month:'May', volume:20000 },{ month:'Jun', volume:22000 },{ month:'Jul', volume:24000 },{ month:'Aug', volume:26000 },{ month:'Sep', volume:28000 },{ month:'Oct', volume:30000 },{ month:'Nov', volume:31000 },{ month:'Dec', volume:32000 }] },
    { id: 's42', keyword: 'pet loss memorial gift',       category: 'Pet Supplies', search_volume: 19000, competition: 'Low',        growth: 142,  avg_price: '$18–$50',  image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:7500 },{ month:'Feb', volume:9000 },{ month:'Mar', volume:10500 },{ month:'Apr', volume:12000 },{ month:'May', volume:13000 },{ month:'Jun', volume:14000 },{ month:'Jul', volume:15000 },{ month:'Aug', volume:16000 },{ month:'Sep', volume:17000 },{ month:'Oct', volume:18000 },{ month:'Nov', volume:18500 },{ month:'Dec', volume:19000 }] },
    { id: 's43', keyword: 'locket necklace',              category: 'Jewelry',      search_volume: 23000, competition: 'Medium',     growth: 59,   avg_price: '$22–$65',  image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:15000 },{ month:'Feb', volume:16000 },{ month:'Mar', volume:17000 },{ month:'Apr', volume:18000 },{ month:'May', volume:19000 },{ month:'Jun', volume:20000 },{ month:'Jul', volume:21000 },{ month:'Aug', volume:21500 },{ month:'Sep', volume:22000 },{ month:'Oct', volume:22500 },{ month:'Nov', volume:23000 },{ month:'Dec', volume:23000 }] },
    { id: 's44', keyword: 'mother of the bride gift',     category: 'Wedding',      search_volume: 26000, competition: 'Medium',     growth: 93,   avg_price: '$25–$70',  image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:13000 },{ month:'Feb', volume:14500 },{ month:'Mar', volume:16000 },{ month:'Apr', volume:17500 },{ month:'May', volume:19000 },{ month:'Jun', volume:20500 },{ month:'Jul', volume:22000 },{ month:'Aug', volume:23000 },{ month:'Sep', volume:24000 },{ month:'Oct', volume:25000 },{ month:'Nov', volume:25500 },{ month:'Dec', volume:26000 }] },
    { id: 's45', keyword: 'gratitude journal',            category: 'Stationery',   search_volume: 38000, competition: 'High',       growth: 73,   avg_price: '$10–$28',  image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:22000 },{ month:'Feb', volume:24000 },{ month:'Mar', volume:26000 },{ month:'Apr', volume:28000 },{ month:'May', volume:29500 },{ month:'Jun', volume:31000 },{ month:'Jul', volume:32500 },{ month:'Aug', volume:34000 },{ month:'Sep', volume:35500 },{ month:'Oct', volume:36500 },{ month:'Nov', volume:37500 },{ month:'Dec', volume:38000 }] },
    { id: 's46', keyword: 'dried flower bouquet',         category: 'Home Decor',   search_volume: 31000, competition: 'Medium',     growth: 161,  avg_price: '$18–$55',  image: 'https://images.unsplash.com/photo-1490750967868-88df5691cc16?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:12000 },{ month:'Feb', volume:14000 },{ month:'Mar', volume:16000 },{ month:'Apr', volume:18000 },{ month:'May', volume:20000 },{ month:'Jun', volume:22000 },{ month:'Jul', volume:24000 },{ month:'Aug', volume:26000 },{ month:'Sep', volume:28000 },{ month:'Oct', volume:29500 },{ month:'Nov', volume:30500 },{ month:'Dec', volume:31000 }] },
    { id: 's47', keyword: 'novelty socks',                category: 'Accessories',  search_volume: 56000, competition: 'High',       growth: 22,   avg_price: '$8–$18',   image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:46000 },{ month:'Feb', volume:47000 },{ month:'Mar', volume:48000 },{ month:'Apr', volume:49000 },{ month:'May', volume:50000 },{ month:'Jun', volume:51000 },{ month:'Jul', volume:52000 },{ month:'Aug', volume:53000 },{ month:'Sep', volume:54000 },{ month:'Oct', volume:55000 },{ month:'Nov', volume:55500 },{ month:'Dec', volume:56000 }] },
    { id: 's48', keyword: 'kids activity kit',            category: 'Baby',         search_volume: 22000, competition: 'Low',        growth: 134,  avg_price: '$15–$40',  image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:8500 },{ month:'Feb', volume:10000 },{ month:'Mar', volume:11500 },{ month:'Apr', volume:13000 },{ month:'May', volume:14500 },{ month:'Jun', volume:16000 },{ month:'Jul', volume:17500 },{ month:'Aug', volume:19000 },{ month:'Sep', volume:20000 },{ month:'Oct', volume:21000 },{ month:'Nov', volume:21500 },{ month:'Dec', volume:22000 }] },
    { id: 's49', keyword: 'meditation cushion',           category: 'Wellness',     search_volume: 16500, competition: 'Low',        growth: 148,  avg_price: '$25–$65',  image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:6000 },{ month:'Feb', volume:7500 },{ month:'Mar', volume:8500 },{ month:'Apr', volume:10000 },{ month:'May', volume:11500 },{ month:'Jun', volume:12500 },{ month:'Jul', volume:13500 },{ month:'Aug', volume:14500 },{ month:'Sep', volume:15000 },{ month:'Oct', volume:15500 },{ month:'Nov', volume:16000 },{ month:'Dec', volume:16500 }] },
    { id: 's50', keyword: 'personalised photo book',      category: 'Gifts',        search_volume: 49000, competition: 'High',       growth: 54,   avg_price: '$20–$60',  image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:32000 },{ month:'Feb', volume:34000 },{ month:'Mar', volume:36000 },{ month:'Apr', volume:38000 },{ month:'May', volume:40000 },{ month:'Jun', volume:42000 },{ month:'Jul', volume:44000 },{ month:'Aug', volume:45500 },{ month:'Sep', volume:47000 },{ month:'Oct', volume:48000 },{ month:'Nov', volume:48500 },{ month:'Dec', volume:49000 }] },
    { id: 's51', keyword: 'birth flower necklace',        category: 'Jewelry',      search_volume: 41000, competition: 'Medium',     growth: 193,  avg_price: '$18–$48',  image: 'https://images.unsplash.com/photo-1615812214207-34e3be6812df?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:14000 },{ month:'Feb', volume:17000 },{ month:'Mar', volume:20000 },{ month:'Apr', volume:23000 },{ month:'May', volume:26000 },{ month:'Jun', volume:29000 },{ month:'Jul', volume:32000 },{ month:'Aug', volume:35000 },{ month:'Sep', volume:37000 },{ month:'Oct', volume:39000 },{ month:'Nov', volume:40000 },{ month:'Dec', volume:41000 }] },
    { id: 's52', keyword: 'bath bomb set',                category: 'Wellness',     search_volume: 34000, competition: 'Medium',     growth: 68,   avg_price: '$12–$30',  image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:20000 },{ month:'Feb', volume:22000 },{ month:'Mar', volume:23500 },{ month:'Apr', volume:25000 },{ month:'May', volume:26500 },{ month:'Jun', volume:28000 },{ month:'Jul', volume:29500 },{ month:'Aug', volume:31000 },{ month:'Sep', volume:32000 },{ month:'Oct', volume:33000 },{ month:'Nov', volume:33500 },{ month:'Dec', volume:34000 }] },
    { id: 's53', keyword: 'vintage map print',            category: 'Art',          search_volume: 18000, competition: 'Low',        growth: 86,   avg_price: '$5–$18',   image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:9500 },{ month:'Feb', volume:10500 },{ month:'Mar', volume:11500 },{ month:'Apr', volume:12500 },{ month:'May', volume:13500 },{ month:'Jun', volume:14500 },{ month:'Jul', volume:15500 },{ month:'Aug', volume:16000 },{ month:'Sep', volume:17000 },{ month:'Oct', volume:17500 },{ month:'Nov', volume:17800 },{ month:'Dec', volume:18000 }] },
    { id: 's54', keyword: 'custom star map',              category: 'Gifts',        search_volume: 37000, competition: 'Medium',     growth: 105,  avg_price: '$15–$50',  image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:18000 },{ month:'Feb', volume:20000 },{ month:'Mar', volume:22000 },{ month:'Apr', volume:24000 },{ month:'May', volume:26000 },{ month:'Jun', volume:28000 },{ month:'Jul', volume:30000 },{ month:'Aug', volume:32000 },{ month:'Sep', volume:34000 },{ month:'Oct', volume:35500 },{ month:'Nov', volume:36500 },{ month:'Dec', volume:37000 }] },
    { id: 's55', keyword: 'friendship bracelet kit',      category: 'Stationery',   search_volume: 28500, competition: 'Low',        growth: 217,  avg_price: '$8–$22',   image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:8000 },{ month:'Feb', volume:10000 },{ month:'Mar', volume:12500 },{ month:'Apr', volume:15000 },{ month:'May', volume:17500 },{ month:'Jun', volume:20000 },{ month:'Jul', volume:22000 },{ month:'Aug', volume:24000 },{ month:'Sep', volume:26000 },{ month:'Oct', volume:27000 },{ month:'Nov', volume:28000 },{ month:'Dec', volume:28500 }] },
    { id: 's56', keyword: 'clay earrings handmade',       category: 'Jewelry',      search_volume: 24000, competition: 'Medium',     growth: 182,  avg_price: '$10–$28',  image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:8000 },{ month:'Feb', volume:10000 },{ month:'Mar', volume:12000 },{ month:'Apr', volume:14000 },{ month:'May', volume:16000 },{ month:'Jun', volume:18000 },{ month:'Jul', volume:20000 },{ month:'Aug', volume:21500 },{ month:'Sep', volume:22500 },{ month:'Oct', volume:23500 },{ month:'Nov', volume:24000 },{ month:'Dec', volume:24000 }] },
    { id: 's57', keyword: 'custom recipe book',           category: 'Gifts',        search_volume: 20000, competition: 'Low',        growth: 116,  avg_price: '$18–$45',  image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:9000 },{ month:'Feb', volume:10500 },{ month:'Mar', volume:12000 },{ month:'Apr', volume:13500 },{ month:'May', volume:15000 },{ month:'Jun', volume:16500 },{ month:'Jul', volume:17500 },{ month:'Aug', volume:18500 },{ month:'Sep', volume:19000 },{ month:'Oct', volume:19500 },{ month:'Nov', volume:20000 },{ month:'Dec', volume:20000 }] },
    { id: 's58', keyword: 'moon phase wall decor',        category: 'Home Decor',   search_volume: 26500, competition: 'Medium',     growth: 144,  avg_price: '$15–$40',  image: 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:10500 },{ month:'Feb', volume:12000 },{ month:'Mar', volume:14000 },{ month:'Apr', volume:16000 },{ month:'May', volume:18000 },{ month:'Jun', volume:19500 },{ month:'Jul', volume:21000 },{ month:'Aug', volume:22500 },{ month:'Sep', volume:24000 },{ month:'Oct', volume:25000 },{ month:'Nov', volume:26000 },{ month:'Dec', volume:26500 }] },
    { id: 's59', keyword: 'tarot card deck',              category: 'Wellness',     search_volume: 30000, competition: 'Medium',     growth: 158,  avg_price: '$20–$55',  image: 'https://images.unsplash.com/photo-1601024445121-e294ce1e3d4e?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:11000 },{ month:'Feb', volume:13500 },{ month:'Mar', volume:16000 },{ month:'Apr', volume:18500 },{ month:'May', volume:21000 },{ month:'Jun', volume:23000 },{ month:'Jul', volume:25000 },{ month:'Aug', volume:27000 },{ month:'Sep', volume:28500 },{ month:'Oct', volume:29500 },{ month:'Nov', volume:30000 },{ month:'Dec', volume:30000 }] },
    { id: 's60', keyword: 'graduation gift for her',      category: 'Gifts',        search_volume: 53000, competition: 'High',       growth: 76,   avg_price: '$20–$65',  image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80', created_at: '', monthly_searches: [{ month:'Jan', volume:30000 },{ month:'Feb', volume:32000 },{ month:'Mar', volume:34000 },{ month:'Apr', volume:36000 },{ month:'May', volume:38000 },{ month:'Jun', volume:40000 },{ month:'Jul', volume:42000 },{ month:'Aug', volume:44000 },{ month:'Sep', volume:46000 },{ month:'Oct', volume:48000 },{ month:'Nov', volume:51000 },{ month:'Dec', volume:53000 }] },
]

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function generateMockMonthlyData(search_volume: number, growth: number) {
    const startVolume = search_volume / (1 + growth / 100)
    return MONTHS.map((month, i) => {
        const progress = i / 11
        const trend = startVolume + (search_volume - startVolume) * progress
        const wobble = search_volume * 0.04 * Math.sin(i * 1.2)
        return { month, searches: Math.max(100, Math.round(trend + wobble)) }
    })
}

function generateMockTags(keyword: string, category: string) {
    const words = keyword.split(' ').map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
    const tags = [
        keyword.toLowerCase().replace(/\s+/g, ''),
        ...words.filter(w => w.length > 2),
        category.toLowerCase().replace(/\s+/g, ''),
        'gift idea', 'handmade', 'trending'
    ]
    return tags.filter((v, i, a) => a.indexOf(v) === i && v.length > 0).slice(0, 8)
}

const competitionColor = (level: string) => {
    if (level === 'Low')       return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    if (level === 'Medium')    return 'text-amber-700   bg-amber-50   border-amber-200'
    if (level === 'High')      return 'text-rose-700    bg-rose-50    border-rose-200'
    if (level === 'Very High') return 'text-purple-700  bg-purple-50  border-purple-200'
    return 'text-slate-600 bg-slate-50 border-slate-200'
}

const opportunityScore = (item: TrendData) =>
    Math.min(100, Math.round(
        (item.growth > 0 ? Math.min(item.growth, 200) / 2 : 0) +
        (['Low', 'Medium'].includes(item.competition) ? 30 : 10) +
        Math.min(item.search_volume / 1000, 20)
    ))

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
    'Jewelry': '💍', 'Home Decor': '🏠', 'Gifts': '🎁', 'Art': '🎨',
    'Digital': '💻', 'Stationery': '✏️', 'Wedding': '💒', 'Wellness': '🧘',
    'Accessories': '👜', 'Baby': '🍼', 'Pet Supplies': '🐾',
}

// Broad product types mock data
interface ProductTrend {
    id: string
    name: string
    image: string
    monthlySearches: number
    growth: number
    competition: string
    avgPrice: string
    topNiches: string[]
    // 0 = stable long-term grower, 1 = highly seasonal / short-term spike
    trendFactor: number
}

type DateRange = '6M' | '3M' | '30D'

function applyDateRange(product: ProductTrend, range: DateRange) {
    const f = product.trendFactor
    let growthMult: number
    let searchMult: number
    if (range === '30D') {
        growthMult = 0.45 + f * 1.1   // volatile: spiky products spike, stable ones drop
        searchMult = 0.80 + f * 0.35
    } else if (range === '3M') {
        growthMult = 0.70 + f * 0.6
        searchMult = 0.90 + f * 0.18
    } else {
        growthMult = 1
        searchMult = 1
    }
    return {
        growth: Math.round(product.growth * growthMult),
        monthlySearches: Math.round(product.monthlySearches * searchMult),
    }
}

const PRODUCT_TRENDS: ProductTrend[] = [
    { id: 'p1',  name: 'T-Shirts',           image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80', monthlySearches: 420000, growth: 68,  competition: 'Very High', avgPrice: '$15–$35',  topNiches: ['graphic tee', 'funny slogan shirt', 'custom name shirt'],       trendFactor: 0.4 },
    { id: 'p2',  name: 'Mugs',               image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80', monthlySearches: 310000, growth: 42,  competition: 'Very High', avgPrice: '$12–$28',  topNiches: ['personalized mug', 'funny quote mug', 'birth month mug'],        trendFactor: 0.7 },
    { id: 'p3',  name: 'Jewelry',            image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=400&q=80', monthlySearches: 285000, growth: 114, competition: 'High',      avgPrice: '$15–$65',  topNiches: ['name necklace', 'birth flower jewelry', 'zodiac jewelry'],       trendFactor: 0.5 },
    { id: 'p4',  name: 'Wall Art',           image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80', monthlySearches: 198000, growth: 55,  competition: 'High',      avgPrice: '$5–$40',   topNiches: ['printable wall art', 'watercolor print', 'motivational poster'], trendFactor: 0.2 },
    { id: 'p5',  name: 'Candles',            image: 'https://images.unsplash.com/photo-1603905623639-cbe42eea3087?w=400&q=80', monthlySearches: 142000, growth: 73,  competition: 'Medium',    avgPrice: '$12–$40',  topNiches: ['soy wax candle', 'scented candle gift', 'custom label candle'],  trendFactor: 0.8 },
    { id: 'p6',  name: 'Stickers',           image: 'https://images.unsplash.com/photo-1574126154517-d1e0d89ef264?w=400&q=80', monthlySearches: 176000, growth: 38,  competition: 'High',      avgPrice: '$3–$10',   topNiches: ['sticker pack', 'vinyl sticker', 'planner sticker sheet'],        trendFactor: 0.3 },
    { id: 'p7',  name: 'Tote Bags',          image: 'https://images.unsplash.com/photo-1544816565-a62c5d3a0e35?w=400&q=80', monthlySearches: 89000,  growth: 121, competition: 'Medium',    avgPrice: '$12–$30',  topNiches: ['linen tote bag', 'custom canvas tote', 'funny tote bag'],        trendFactor: 0.6 },
    { id: 'p8',  name: 'Planners',           image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&q=80', monthlySearches: 124000, growth: 185, competition: 'Medium',    avgPrice: '$5–$25',   topNiches: ['digital planner', 'budget planner', 'weekly planner printable'], trendFactor: 0.9 },
    { id: 'p9',  name: 'Keychains',          image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&q=80', monthlySearches: 78000,  growth: 97,  competition: 'Medium',    avgPrice: '$8–$22',   topNiches: ['personalized keychain', 'acrylic keychain', 'leather keychain'], trendFactor: 0.5 },
    { id: 'p10', name: 'Prints & Posters',   image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80', monthlySearches: 165000, growth: 44,  competition: 'High',      avgPrice: '$4–$20',   topNiches: ['vintage map print', 'mushroom art print', 'celestial poster'],   trendFactor: 0.2 },
    { id: 'p11', name: 'Gift Sets',          image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80', monthlySearches: 210000, growth: 88,  competition: 'High',      avgPrice: '$25–$75',  topNiches: ['self care gift basket', 'spa gift set', 'personalized gift box'], trendFactor: 0.85 },
    { id: 'p12', name: 'Home Decor',         image: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=400&q=80', monthlySearches: 232000, growth: 82,  competition: 'High',      avgPrice: '$15–$80',  topNiches: ['macrame wall hanging', 'terracotta planter', 'moon phase decor'], trendFactor: 0.35 },
    { id: 'p13', name: 'Earrings',           image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=400&q=80', monthlySearches: 94000,  growth: 162, competition: 'Medium',    avgPrice: '$10–$35',  topNiches: ['clay earrings', 'gold hoop earrings', 'statement earrings'],     trendFactor: 0.55 },
    { id: 'p14', name: 'Notebooks',          image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=80', monthlySearches: 67000,  growth: 59,  competition: 'Medium',    avgPrice: '$10–$28',  topNiches: ['gratitude journal', 'custom notebook', 'bullet journal'],        trendFactor: 0.3 },
    { id: 'p15', name: 'Phone Cases',        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80', monthlySearches: 138000, growth: 31,  competition: 'Very High', avgPrice: '$12–$30',  topNiches: ['custom photo case', 'floral phone case', 'monogram case'],       trendFactor: 0.4 },
    { id: 'p16', name: 'Sweatshirts',        image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80', monthlySearches: 195000, growth: 143, competition: 'High',      avgPrice: '$28–$55',  topNiches: ['crewneck sweatshirt', 'vintage style hoodie', 'custom embroidered'], trendFactor: 0.75 },
    { id: 'p17', name: 'Hats & Beanies',     image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80', monthlySearches: 112000, growth: 107, competition: 'Medium',    avgPrice: '$18–$38',  topNiches: ['custom dad hat', 'embroidered beanie', 'trucker hat'],           trendFactor: 0.65 },
    { id: 'p18', name: 'Blankets',           image: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=400&q=80', monthlySearches: 87000,  growth: 91,  competition: 'Medium',    avgPrice: '$35–$85',  topNiches: ['chunky knit blanket', 'personalized throw', 'sherpa blanket'],   trendFactor: 0.7 },
    { id: 'p19', name: 'Pins & Patches',     image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80', monthlySearches: 54000,  growth: 176, competition: 'Low',       avgPrice: '$6–$18',   topNiches: ['enamel pin set', 'iron-on patch', 'collector pin'],              trendFactor: 0.5 },
    { id: 'p20', name: 'Wellness Products',  image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&q=80', monthlySearches: 143000, growth: 168, competition: 'Medium',    avgPrice: '$15–$55',  topNiches: ['crystal healing set', 'meditation cushion', 'affirmation cards'], trendFactor: 0.6 },
    { id: 'p21', name: 'Baby Items',         image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80', monthlySearches: 158000, growth: 89,  competition: 'Medium',    avgPrice: '$20–$60',  topNiches: ['custom baby name sign', 'crochet baby blanket', 'nursery decor'], trendFactor: 0.45 },
    { id: 'p22', name: 'Pet Products',       image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80', monthlySearches: 96000,  growth: 158, competition: 'Low',       avgPrice: '$8–$40',   topNiches: ['custom dog bandana', 'pet portrait', 'pet memorial gift'],       trendFactor: 0.55 },
    { id: 'p23', name: 'Greeting Cards',     image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&q=80', monthlySearches: 73000,  growth: 74,  competition: 'Medium',    avgPrice: '$4–$12',   topNiches: ['funny birthday card', 'custom watercolor card', 'bulk card set'], trendFactor: 0.8 },
    { id: 'p24', name: 'Wedding Items',      image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80', monthlySearches: 182000, growth: 79,  competition: 'High',      avgPrice: '$10–$60',  topNiches: ['custom invitation', 'bridal party gift', 'wedding favour'],      trendFactor: 0.6 },
    { id: 'p25', name: 'Aprons & Kitchenwear', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', monthlySearches: 42000, growth: 134, competition: 'Low',       avgPrice: '$18–$45',  topNiches: ['personalized apron', 'funny chef apron', 'linen kitchen set'],  trendFactor: 0.4 },
    { id: 'p26', name: 'Face Masks',         image: 'https://images.unsplash.com/photo-1588776814546-ec7e525c3e5b?w=400&q=80', monthlySearches: 61000,  growth: 88,  competition: 'Medium',    avgPrice: '$10–$22',  topNiches: ['floral face mask', 'custom printed mask', 'silk sleep mask'],    trendFactor: 0.5 },
    { id: 'p27', name: 'Bookmarks',          image: 'https://images.unsplash.com/photo-1549921296-3b0f9a35af35?w=400&q=80', monthlySearches: 38000,  growth: 207, competition: 'Low',       avgPrice: '$5–$15',   topNiches: ['pressed flower bookmark', 'leather bookmark', 'custom name bookmark'], trendFactor: 0.65 },
    { id: 'p28', name: 'Bags & Pouches',     image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', monthlySearches: 68000,  growth: 112, competition: 'Medium',    avgPrice: '$15–$45',  topNiches: ['cosmetic pouch', 'zipper bag set', 'drawstring backpack'],       trendFactor: 0.45 },
    { id: 'p29', name: 'Socks',              image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', monthlySearches: 118000, growth: 55,  competition: 'High',      avgPrice: '$8–$18',   topNiches: ['novelty socks', 'custom face socks', 'funny patterned socks'],   trendFactor: 0.7 },
    { id: 'p30', name: 'Digital Downloads',  image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&q=80', monthlySearches: 205000, growth: 196, competition: 'Medium',    avgPrice: '$3–$15',   topNiches: ['printable planner', 'digital art download', 'SVG cut file'],     trendFactor: 0.85 },
]

function ProductTrendCard({ product, adjGrowth, adjSearches, score, scoreColor, scoreBarColor, onClick }: {
    product: ProductTrend; adjGrowth: number; adjSearches: number; score: number;
    scoreColor: string; scoreBarColor: string; onClick?: () => void
}) {
    const isRising = adjGrowth > 0
    return (
        <div
            className="group rounded-2xl border border-slate-200 bg-white hover:border-teal-300 transition-all hover:-translate-y-1 overflow-hidden flex flex-col cursor-pointer"
            onClick={onClick}
        >
            <div className="relative aspect-square bg-slate-100 overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 flex items-center justify-center">
                    <ImageOff className="h-14 w-14 text-slate-300" />
                </div>
                <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                <div className={cn(
                    "absolute top-2 left-2 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-md",
                    isRising ? "bg-emerald-600/80 text-white" : "bg-rose-600/80 text-white"
                )}>
                    {isRising ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {isRising ? '+' : ''}{adjGrowth}%
                </div>
            </div>
            <div className="p-3 flex flex-col gap-2.5 flex-1">
                <p className="text-sm font-bold text-slate-800">{product.name}</p>
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Opportunity Score</span>
                        <span className={cn("text-xs font-black px-1.5 py-0.5 rounded-md border", scoreColor)}>{score}/100</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", scoreBarColor)} style={{ width: `${score}%` }} />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-100">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Comp.</span>
                        <span className={cn("text-[9px] font-bold w-fit px-2 py-0.5 rounded-full border leading-tight", competitionColor(product.competition))}>{product.competition}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 items-center text-center">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Searches</span>
                        <span className="text-xs font-bold text-slate-700">
                            {adjSearches >= 1000000 ? `${(adjSearches / 1000000).toFixed(1)}M` : `${(adjSearches / 1000).toFixed(0)}k`}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5 items-end text-right">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Avg Price</span>
                        <span className="text-xs font-bold text-slate-700">{product.avgPrice}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CategoryTrendCard({ cat, isRising, catImage, barWidth, onClick }: {
    cat: { name: string; avgGrowth: number; totalVolume: number; count: number; topKeywords: string[]; dominantComp: string };
    isRising: boolean; catImage: string | undefined; barWidth: number; onClick: () => void
}) {
    const [hasImg, setHasImg] = useState(!!catImage)
    return (
        <button
            onClick={onClick}
            className="group rounded-2xl border border-slate-200 bg-white hover:border-teal-300 transition-all hover:-translate-y-1 overflow-hidden flex flex-col text-left"
        >
            <div className={cn("relative aspect-square overflow-hidden flex-shrink-0", hasImg ? "bg-white" : "bg-slate-100")}>
                {hasImg && catImage ? (
                    <img
                        src={catImage}
                        alt={cat.name}
                        className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setHasImg(false)}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ImageOff className="h-14 w-14 text-slate-300" />
                    </div>
                )}
                <div className={cn(
                    "absolute top-2 left-2 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-md",
                    isRising ? "bg-emerald-600/80 text-white" : "bg-rose-600/80 text-white"
                )}>
                    {isRising ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {isRising ? '+' : ''}{cat.avgGrowth}%
                </div>
                {hasImg && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                )}
            </div>
            <div className="p-3 flex flex-col gap-2 flex-1">
                <p className="text-sm font-bold text-slate-800">{cat.name}</p>
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Opportunity Score</span>
                        <span className={cn("text-xs font-black px-1.5 py-0.5 rounded-md border",
                            barWidth >= 70 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                            barWidth >= 40 ? 'text-amber-700 bg-amber-50 border-amber-200' :
                            'text-rose-700 bg-rose-50 border-rose-200'
                        )}>{barWidth}/100</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500",
                            barWidth >= 70 ? 'from-emerald-400 to-teal-400' :
                            barWidth >= 40 ? 'from-amber-400 to-orange-400' :
                            'from-rose-400 to-red-400'
                        )} style={{ width: `${barWidth}%` }} />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-100">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Comp.</span>
                        <span className={cn("text-[9px] font-bold w-fit px-2 py-0.5 rounded-full border", competitionColor(cat.dominantComp))}>{cat.dominantComp}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 items-center text-center">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Searches</span>
                        <span className="text-xs font-bold text-slate-700">
                            {cat.totalVolume >= 1000000 ? `${(cat.totalVolume / 1000000).toFixed(1)}M` : `${(cat.totalVolume / 1000).toFixed(0)}k`}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5 items-end text-right">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Avg Price</span>
                        <span className="text-xs font-bold text-slate-700">{cat.count} items</span>
                    </div>
                </div>
            </div>
        </button>
    )
}

function TrendCard({ item, onClick }: { item: TrendData; onClick: () => void }) {
    const [imgError, setImgError] = useState(false)
    const isRising = item.growth > 0
    return (
        <div
            onClick={onClick}
            className="group cursor-pointer rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:border-teal-300 overflow-hidden flex flex-col"
        >
            <div className={cn("relative aspect-square overflow-hidden shrink-0", item.image && !imgError ? "bg-white" : "bg-slate-100")}>
                {item.image && !imgError ? (
                    <img src={item.image} alt={item.keyword} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" onError={() => setImgError(true)} />
                ) : (
                    <div className="h-full w-full flex items-center justify-center"><ImageOff className="h-14 w-14 text-slate-300" /></div>
                )}
                <div className={cn("absolute top-2 left-2 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-md", isRising ? "bg-emerald-600/80 text-white" : "bg-rose-600/80 text-white")}>
                    {isRising ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {isRising ? "+" : ""}{item.growth}%
                </div>
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.category}
                </div>
            </div>
            <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 capitalize" title={item.keyword}>{item.keyword}</h3>
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-teal-600">{(item.search_volume ?? 0).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 font-medium">searches/mo</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-slate-100">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Comp.</span>
                        <span className={cn("text-[9px] font-bold w-fit px-2 py-0.5 rounded-full border", competitionColor(item.competition))}>{item.competition}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 items-end text-right">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Avg Price</span>
                        <span className="text-xs font-bold text-slate-700">{item.avg_price || '—'}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function TrendsPage() {
    const [trends, setTrends] = useState<TrendData[]>(STATIC_TRENDS)
    const [loading, setLoading] = useState(true)
    const [selectedTrendData, setSelectedTrendData] = useState<TrendData | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [categoryFilter, setCategoryFilter] = useState("All")
    const [searchQuery, setSearchQuery] = useState("")
    const [copiedTags, setCopiedTags] = useState(false)
    // Product modal state
    const [selectedProduct, setSelectedProduct] = useState<ProductTrend | null>(null)
    const [productRevenueRange, setProductRevenueRange] = useState<'1M' | '6M' | '1Y' | 'ALL'>('1Y')
    const [copiedProductTag, setCopiedProductTag] = useState<string | null>(null)
    const [copiedAllProductTags, setCopiedAllProductTags] = useState(false)
    const [section1View, setSection1View] = useState<'products' | 'categories'>('products')
    const [dateRange, setDateRange] = useState<DateRange>('6M')
    const [productTypeFilter, setProductTypeFilter] = useState<'All' | 'Print on Demand' | 'Digital Download' | 'Handmade'>('All')
    const [competitionFilter, setCompetitionFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All')
    const [productTypeOpen, setProductTypeOpen] = useState(false)
    const [competitionOpen, setCompetitionOpen] = useState(false)
    const [productPage, setProductPage] = useState(1)
    const [categoryPage, setCategoryPage] = useState(1)
    const SECTION1_PER_PAGE = 15
    const browseRef = useRef<HTMLDivElement>(null)

    const supabase = createClient()

    useEffect(() => { fetchTrends() }, [])

    const fetchTrends = async () => {
        try {
            const { data, error } = await supabase.from('trends').select('*').order('search_volume', { ascending: false })
            if (error) throw error
            if (data && data.length > 0) {
                const dbKeywords = new Set(data.map((d: any) => d.keyword))
                setTrends([...data, ...STATIC_TRENDS.filter(s => !dbKeywords.has(s.keyword))])
            }
        } catch (error) {
            console.error('Error fetching trends:', error)
        } finally {
            setLoading(false)
        }
    }

    // ── Section 1: Category stats ──────────────────────────────────────────────
    const categoryStats = useMemo(() => {
        // Apply a per-category date range multiplier using a seeded value derived from the category name
        const catTrendFactor = (name: string) => {
            const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
            return (hash % 7) / 10 + 0.2 // 0.2 – 0.8 range
        }
        const growthMult = (f: number) =>
            dateRange === '30D' ? 0.45 + f * 1.1 :
            dateRange === '3M'  ? 0.70 + f * 0.6 : 1
        const searchMult = (f: number) =>
            dateRange === '30D' ? 0.80 + f * 0.35 :
            dateRange === '3M'  ? 0.90 + f * 0.18 : 1

        const map: Record<string, { items: TrendData[], totalVolume: number, growthSum: number }> = {}
        trends.forEach(t => {
            if (!map[t.category]) map[t.category] = { items: [], totalVolume: 0, growthSum: 0 }
            map[t.category].items.push(t)
            map[t.category].totalVolume += t.search_volume
            map[t.category].growthSum += t.growth
        })
        return Object.entries(map).map(([name, d]) => {
            const f = catTrendFactor(name)
            return {
                name,
                totalVolume: Math.round(d.totalVolume * searchMult(f)),
                avgGrowth: Math.round((d.growthSum / d.items.length) * growthMult(f)),
                count: d.items.length,
                topKeywords: [...d.items].sort((a, b) => b.search_volume - a.search_volume).slice(0, 2).map(i => i.keyword),
                dominantComp: (() => {
                    const counts: Record<string, number> = {}
                    d.items.forEach(i => { counts[i.competition] = (counts[i.competition] || 0) + 1 })
                    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
                })(),
            }
        }).sort((a, b) => b.totalVolume - a.totalVolume)
    }, [trends, dateRange])

    // ── Section 2: Spotlights ──────────────────────────────────────────────────
    const fastestRising = useMemo(() =>
        [...trends].filter(t => t.growth > 0).sort((a, b) => b.growth - a.growth).slice(0, 6),
        [trends]
    )
    const bestOpportunities = useMemo(() =>
        [...trends].sort((a, b) => opportunityScore(b) - opportunityScore(a)).slice(0, 6),
        [trends]
    )

    // ── Section 3: Browse grid ─────────────────────────────────────────────────
    const categories = ["All", ...Array.from(new Set(trends.map(t => t.category))).sort()]
    const filteredTrends = trends.filter(item => {
        const matchesCategory = categoryFilter === "All" || item.category === categoryFilter
        const matchesSearch = searchQuery.trim() === "" || item.keyword.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })
    const totalPages = Math.ceil(filteredTrends.length / ITEMS_PER_PAGE)
    const currentData = filteredTrends.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    const jumpToCategory = (cat: string) => {
        setCategoryFilter(cat)
        setCurrentPage(1)
        setTimeout(() => browseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    }

    const maxVolume = categoryStats[0]?.totalVolume ?? 1

    return (
        <>
        <DashboardLayout>
            <div className="space-y-10">

                {/* ── Header ── */}
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-md shadow-teal-900/20">
                        <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Market Trends</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Explore trending categories and rising niches across Etsy.</p>
                    </div>
                </div>

                {/* ── Section 1: Products & Categories ── */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setSection1View('products'); setProductPage(1) }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                                section1View === 'products'
                                    ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-900/10"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                            )}
                        >
                            <Layers className="h-4 w-4" /> Products
                        </button>
                        <button
                            onClick={() => { setSection1View('categories'); setCategoryPage(1); setProductPage(1) }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                                section1View === 'categories'
                                    ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-900/10"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                            )}
                        >
                            <Tag className="h-4 w-4" /> Categories
                        </button>
                        {/* Divider */}
                        <div className="h-6 w-px bg-slate-200 mx-1" />

                        {/* Product Type dropdown */}
                        {section1View === 'products' && (
                        <div className="relative">
                            <button
                                onClick={() => { setProductTypeOpen(v => !v); setCompetitionOpen(false) }}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                                    productTypeFilter !== 'All'
                                        ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-900/10"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                                )}
                            >
                                <Layers className="h-4 w-4" />
                                Product Type{productTypeFilter !== 'All' ? `: ${productTypeFilter}` : ''}
                                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", productTypeOpen && "rotate-180")} />
                            </button>
                            {productTypeOpen && (
                                <div className="absolute top-full left-0 mt-1.5 z-20 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/10 py-1 min-w-[180px]">
                                    {(['All', 'Print on Demand', 'Digital Download', 'Handmade'] as const).map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => { setProductTypeFilter(opt); setProductTypeOpen(false); setProductPage(1) }}
                                            className={cn(
                                                "w-full text-left px-4 py-2 text-sm font-medium transition-colors",
                                                productTypeFilter === opt
                                                    ? "text-teal-700 bg-teal-50 font-semibold"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                                            )}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        )}

                        {/* Competition dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => { setCompetitionOpen(v => !v); setProductTypeOpen(false) }}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                                    competitionFilter !== 'All'
                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-900/10"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
                                )}
                            >
                                <ShieldCheck className="h-4 w-4" />
                                Competition{competitionFilter !== 'All' ? `: ${competitionFilter}` : ''}
                                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", competitionOpen && "rotate-180")} />
                            </button>
                            {competitionOpen && (
                                <div className="absolute top-full left-0 mt-1.5 z-20 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/10 py-1 min-w-[160px]">
                                    {(['All', 'Low', 'Medium', 'High'] as const).map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => { setCompetitionFilter(opt); setCompetitionOpen(false); setProductPage(1); setCategoryPage(1) }}
                                            className={cn(
                                                "w-full text-left px-4 py-2 text-sm font-medium transition-colors",
                                                competitionFilter === opt
                                                    ? "text-emerald-700 bg-emerald-50 font-semibold"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                                            )}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Date range — pushed to far right */}
                        <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trend Data</span>
                        <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                            {(['30D', '3M', '6M'] as DateRange[]).map(r => (
                                <button
                                    key={r}
                                    onClick={() => { setDateRange(r); setProductPage(1); setCategoryPage(1) }}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all",
                                        dateRange === r
                                            ? "bg-white text-teal-700 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    {r === '30D' && <Calendar className="h-3.5 w-3.5" />}
                                    {r}
                                </button>
                            ))}
                        </div>
                        </div>
                    </div>

                    {/* Products view */}
                    {section1View === 'products' && (() => {
                        const POD_IDS     = new Set(['p1','p2','p6','p7','p10','p15','p16','p17','p18','p29'])
                        const DIGITAL_IDS = new Set(['p8','p10','p14','p27','p30'])
                        const filtered = PRODUCT_TRENDS.filter(product => {
                            if (productTypeFilter === 'Print on Demand' && !POD_IDS.has(product.id)) return false
                            if (productTypeFilter === 'Digital Download' && !DIGITAL_IDS.has(product.id)) return false
                            if (productTypeFilter === 'Handmade' && (POD_IDS.has(product.id) || DIGITAL_IDS.has(product.id))) return false
                            if (competitionFilter !== 'All') {
                                const isHigh = product.competition === 'High' || product.competition === 'Very High'
                                if (competitionFilter === 'High' ? !isHigh : product.competition !== competitionFilter) return false
                            }
                            const { growth, monthlySearches } = applyDateRange(product, dateRange)
                            const s = Math.min(100, Math.round(
                                (growth > 0 ? Math.min(growth, 200) / 2 : 0) +
                                (['Low', 'Medium'].includes(product.competition) ? 30 : 10) +
                                Math.min(monthlySearches / 30000, 20)
                            ))
                            if (s < 70) return false
                            return true
                        })
                        const totalProductPages = Math.ceil(filtered.length / SECTION1_PER_PAGE)
                        const pagedProducts = filtered.slice((productPage - 1) * SECTION1_PER_PAGE, productPage * SECTION1_PER_PAGE)
                        return (
                        <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {pagedProducts.map(product => {
                                const { growth: adjGrowth, monthlySearches: adjSearches } = applyDateRange(product, dateRange)
                                const score = Math.min(100, Math.round(
                                    (adjGrowth > 0 ? Math.min(adjGrowth, 200) / 2 : 0) +
                                    (['Low', 'Medium'].includes(product.competition) ? 30 : 10) +
                                    Math.min(adjSearches / 30000, 20)
                                ))
                                const scoreColor = score >= 70 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : score >= 40 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-rose-700 bg-rose-50 border-rose-200'
                                const scoreBarColor = score >= 70 ? 'from-emerald-400 to-teal-400' : score >= 40 ? 'from-amber-400 to-orange-400' : 'from-rose-400 to-red-400'
                                return (
                                    <ProductTrendCard
                                        key={product.id}
                                        product={product}
                                        adjGrowth={adjGrowth}
                                        adjSearches={adjSearches}
                                        score={score}
                                        scoreColor={scoreColor}
                                        scoreBarColor={scoreBarColor}
                                        onClick={() => { setSelectedProduct(product); setProductRevenueRange('1Y') }}
                                    />
                                )
                            })}
                        </div>
                        {/* Products pagination */}
                        {totalProductPages > 1 && (
                            <div className="flex items-center justify-end gap-2">
                                <button onClick={() => setProductPage(p => Math.max(1, p - 1))} disabled={productPage === 1} className="p-1.5 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                {Array.from({ length: totalProductPages }, (_, i) => i + 1).map(page => (
                                    <button key={page} onClick={() => setProductPage(page)} className={cn("px-3 py-1 rounded-lg text-sm font-semibold transition-colors", productPage === page ? "bg-teal-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-200 hover:text-slate-700")}>
                                        {page}
                                    </button>
                                ))}
                                <button onClick={() => setProductPage(p => Math.min(totalProductPages, p + 1))} disabled={productPage === totalProductPages} className="p-1.5 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                        </div>
                        )
                    })()}

                    {/* Categories view */}
                    {section1View === 'categories' && (() => {
                        const filteredCats = categoryStats.filter(cat => {
                            if (cat.avgGrowth < 60) return false
                            if (competitionFilter !== 'All') {
                                const isHigh = cat.dominantComp === 'High' || cat.dominantComp === 'Very High'
                                if (competitionFilter === 'High' ? !isHigh : cat.dominantComp !== competitionFilter) return false
                            }
                            return true
                        })
                        const totalCatPages = Math.ceil(filteredCats.length / SECTION1_PER_PAGE)
                        const pagedCats = filteredCats.slice((categoryPage - 1) * SECTION1_PER_PAGE, categoryPage * SECTION1_PER_PAGE)
                        return (
                        <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {pagedCats.map(cat => {
                                const isRising = cat.avgGrowth > 0
                                const barWidth = Math.round((cat.totalVolume / maxVolume) * 100)
                                const catImage = trends
                                    .filter(t => t.category === cat.name && t.image)
                                    .sort((a, b) => b.search_volume - a.search_volume)[0]?.image
                                return (
                                    <CategoryTrendCard
                                        key={cat.name}
                                        cat={cat}
                                        isRising={isRising}
                                        catImage={catImage}
                                        barWidth={barWidth}
                                        onClick={() => jumpToCategory(cat.name)}
                                    />
                                )
                            })}
                    </div>
                        {/* Categories pagination */}
                        {totalCatPages > 1 && (
                            <div className="flex items-center justify-end gap-2">
                                <button onClick={() => setCategoryPage(p => Math.max(1, p - 1))} disabled={categoryPage === 1} className="p-1.5 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                {Array.from({ length: totalCatPages }, (_, i) => i + 1).map(page => (
                                    <button key={page} onClick={() => setCategoryPage(page)} className={cn("px-3 py-1 rounded-lg text-sm font-semibold transition-colors", categoryPage === page ? "bg-teal-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-200 hover:text-slate-700")}>
                                        {page}
                                    </button>
                                ))}
                                <button onClick={() => setCategoryPage(p => Math.min(totalCatPages, p + 1))} disabled={categoryPage === totalCatPages} className="p-1.5 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                                    <ChevronRight className="h-4 w-4" />
                                                        </button>
                            </div>
                        )}
                                </div>
                        )
                    })()}

                </div>


                {/* ── Trend Detail Modal ── */}
                    {selectedTrendData && (
                    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedTrendData(null)}>
                        <div className="modal-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-slate-50 shadow-2xl shadow-slate-900/20" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 bg-slate-50 sticky top-0 rounded-t-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                                        <BarChart2 className="h-4 w-4 text-white" />
                                </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-base capitalize">{selectedTrendData.keyword}</h3>
                                        <p className="text-xs text-slate-500">{selectedTrendData.category} · Trend analysis & search history</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedTrendData(null)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-teal-100/35 rounded-xl border border-teal-200 p-4">
                                        <div className="flex items-center gap-1.5 mb-1"><BarChart2 className="h-3.5 w-3.5 text-teal-500" /><p className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Search Volume</p></div>
                                        <p className="text-2xl font-bold text-slate-800">{(selectedTrendData.search_volume ?? 0).toLocaleString()}</p>
                                        <p className="text-xs text-teal-500 mt-0.5">monthly searches</p>
                                    </div>
                                    {(() => { const g = selectedTrendData.growth ?? 0; return (
                                        <div className={cn("rounded-xl border p-4", g > 0 ? "bg-emerald-100/35 border-emerald-200" : "bg-rose-100/60 border-rose-200")}>
                                            <div className="flex items-center gap-1.5 mb-1">
                                                {g > 0 ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : <TrendingDown className="h-3.5 w-3.5 text-rose-500" />}
                                                <p className={cn("text-xs font-semibold uppercase tracking-wider", g > 0 ? "text-emerald-600" : "text-rose-600")}>Growth</p>
                                            </div>
                                            <p className={cn("text-2xl font-bold", g > 0 ? "text-emerald-700" : "text-rose-700")}>{g > 0 ? "+" : ""}{g}%</p>
                                            <p className={cn("text-xs mt-0.5 opacity-60", g > 0 ? "text-emerald-600" : "text-rose-600")}>over 12 months</p>
                                        </div>
                                    )})()}
                                    <div className={cn("rounded-xl border p-4", competitionColor(selectedTrendData.competition))}>
                                        <div className="flex items-center gap-1.5 mb-1"><Tag className="h-3.5 w-3.5" /><p className="text-xs font-semibold uppercase tracking-wider">Competition</p></div>
                                        <p className="text-2xl font-bold">{selectedTrendData.competition}</p>
                                        <p className="text-xs mt-0.5 opacity-60">seller density</p>
                                    </div>
                                    <div className="bg-orange-100/60 rounded-xl border border-orange-200 p-4">
                                        <div className="flex items-center gap-1.5 mb-1"><DollarSign className="h-3.5 w-3.5 text-orange-500" /><p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Avg Price</p></div>
                                        <p className="text-2xl font-bold text-slate-800">{selectedTrendData.avg_price || '—'}</p>
                                        <p className="text-xs text-orange-400 mt-0.5">typical range</p>
                                </div>
                                </div>

                                {(() => {
                                    const chartData = (selectedTrendData.monthly_searches ?? []).length > 0
                                        ? selectedTrendData.monthly_searches!
                                        : generateMockMonthlyData(selectedTrendData.search_volume ?? 0, selectedTrendData.growth ?? 0)
                                    const isMock = (selectedTrendData.monthly_searches ?? []).length === 0
                                    return (
                                        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-sm font-semibold text-slate-700">12-Month Search Volume</p>
                                                {isMock && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Estimated</span>}
                            </div>
                                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                        <defs>
                                                            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={36} />
                                                        <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)' }} formatter={(value: number) => [value.toLocaleString(), 'Search Volume']} itemStyle={{ color: '#0f766e', fontWeight: 600 }} labelStyle={{ color: '#475569', fontWeight: 500 }} />
                                                        <Area type="monotone" dataKey="volume" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#trendGradient)" dot={false} activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    )
                                })()}

                                {(() => {
                                    const months = (selectedTrendData.monthly_searches ?? []).length > 0
                                        ? selectedTrendData.monthly_searches!
                                        : generateMockMonthlyData(selectedTrendData.search_volume ?? 0, selectedTrendData.growth ?? 0)
                                    const getVol = (m: any) => m.volume ?? m.searches ?? 0
                                    const peakMonth = months.length > 0 ? months.reduce((p, c) => getVol(p) > getVol(c) ? p : c) : null
                                    const g = selectedTrendData.growth ?? 0
                                    const sv = selectedTrendData.search_volume ?? 0
                                    const score = Math.min(100, Math.round((g > 0 ? Math.min(g, 200) / 2 : 0) + (['Low', 'Medium'].includes(selectedTrendData.competition ?? '') ? 30 : 10) + Math.min(sv / 1000, 20)))
                                    const scoreColor = score >= 70 ? 'text-emerald-700 bg-emerald-100/35 border-emerald-200' : score >= 40 ? 'text-amber-700 bg-amber-100/60 border-amber-200' : 'text-rose-700 bg-rose-100/60 border-rose-200'
                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div className={cn("rounded-xl border p-4 flex items-start gap-3", scoreColor)}>
                                                <Zap className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wider mb-0.5">Opportunity Score</p>
                                                    <p className="text-2xl font-bold">{score}<span className="text-sm font-medium opacity-60">/100</span></p>
                                                    <p className="text-xs mt-0.5 opacity-70">{score >= 70 ? 'Strong potential' : score >= 40 ? 'Moderate potential' : 'Competitive space'}</p>
                                                </div>
                                            </div>
                                            <div className="rounded-xl border border-blue-200 bg-blue-100/60 p-4 flex items-start gap-3">
                                                <TrendingUp className="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5">Peak Month</p>
                                                    <p className="text-2xl font-bold text-slate-800">{peakMonth?.month ?? '—'}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">{peakMonth ? getVol(peakMonth).toLocaleString() + ' searches' : 'No data'}</p>
                                                </div>
                                            </div>
                                            <div className="rounded-xl border border-violet-300 bg-violet-100/90 p-4 flex items-start gap-3">
                                                <Tag className="h-5 w-5 mt-0.5 text-violet-500 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-0.5">Category</p>
                                                    <p className="text-xl font-bold text-slate-800">{selectedTrendData.category}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">Niche segment</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })()}

                                {(() => {
                                    const tags = generateMockTags(selectedTrendData.keyword, selectedTrendData.category)
                                    return (
                                        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5"><Tag className="h-4 w-4 text-slate-400" />Popular Tags</p>
                                                <button onClick={() => { navigator.clipboard.writeText(tags.join(', ')); setCopiedTags(true); setTimeout(() => setCopiedTags(false), 2000) }} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors bg-white border border-slate-200 hover:border-slate-300 shadow-sm px-2.5 py-1.5 rounded-md">
                                                    {copiedTags ? <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy Tags</>}
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map(tag => (
                                                    <span key={tag} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-md">{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })()}

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <p className="text-xs text-slate-400">Data reflects estimated Etsy market trends</p>
                                    <a href={`https://www.etsy.com/search?q=${encodeURIComponent(selectedTrendData.keyword)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline transition-colors">
                                        View on Etsy <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>
                            </div>
                        </div>
                    )}

            </div>
        </DashboardLayout>

        {/* ── Product Trend Modal ── */}
        {selectedProduct && (() => {
            const { growth: adjGrowth, monthlySearches: adjSearches } = applyDateRange(selectedProduct, dateRange)
            const score = Math.min(100, Math.round(
                (adjGrowth > 0 ? Math.min(adjGrowth, 200) / 2 : 0) +
                (['Low', 'Medium'].includes(selectedProduct.competition) ? 30 : 10) +
                Math.min(adjSearches / 30000, 20)
            ))
            const scoreColor = score >= 70 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : score >= 40 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-rose-700 bg-rose-50 border-rose-200'

            // Chart data — generate 12-month trend from monthlySearches + growth
            const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            const startSearches = adjSearches / (1 + adjGrowth / 100)
            const thisYearData = MONTH_LABELS.map((m, i) => {
                const progress = i / 11
                const trend = startSearches + (adjSearches - startSearches) * progress
                const wobble = adjSearches * 0.04 * Math.sin(i * 1.2)
                return { month: m, searches: Math.max(100, Math.round(trend + wobble)) }
            })
            const prevYearData = MONTH_LABELS.map((m, i) => ({
                month: m + "'23",
                searches: Math.round(thisYearData[i].searches * 0.72),
            }))
            const lastSearches = thisYearData[thisYearData.length - 1].searches
            const oneMonthData = ['Wk 1','Wk 2','Wk 3','Wk 4'].map((wk, i) => ({
                month: wk,
                searches: Math.round(lastSearches / 4 * (0.85 + Math.sin(i * 1.4) * 0.15)),
            }))
            const chartData =
                productRevenueRange === '1M'  ? oneMonthData :
                productRevenueRange === '6M'  ? thisYearData.slice(-6) :
                productRevenueRange === 'ALL' ? [...prevYearData, ...thisYearData] :
                thisYearData
            const RANGES = [
                { key: '1M' as const, label: '1M' },
                { key: '6M' as const, label: '6M' },
                { key: '1Y' as const, label: '1Y' },
                { key: 'ALL' as const, label: 'All' },
            ]

            // Tag rows derived from topNiches + product name
            const COMPS = ['Low', 'Medium', 'High', 'Very High'] as const
            const tagRows = [selectedProduct.name.toLowerCase(), ...selectedProduct.topNiches].slice(0, 6).map((tag, i) => {
                const seed = tag.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
                const comp = COMPS[(seed + i) % 4]
                const volume = Math.round(adjSearches * (0.05 + (seed % 40) / 200))
                const kwScore = Math.min(99, Math.max(20, Math.round(
                    (adjGrowth > 0 ? Math.min(adjGrowth, 200) / 3 : 0) +
                    (['Low', 'Medium'].includes(comp) ? 28 : 8) +
                    Math.min(volume / 3000, 18) +
                    (seed % 20)
                )))
                return { tag, volume, comp, kwScore }
            })
            const allTagsText = tagRows.map(r => r.tag).join(', ')

            const formatSearches = (n: number) =>
                n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${(n / 1000).toFixed(0)}k`

            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />

                    {/* Modal */}
                    <div className="relative z-50 w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200/80 shadow-2xl shadow-slate-900/20 animate-in fade-in zoom-in-95 duration-200">

                        {/* ── Teal Header ── */}
                        <div className="relative rounded-t-2xl bg-teal-500/80 p-5 text-white">
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <div className="flex items-end justify-between gap-3 pr-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-20 rounded-xl bg-white/20 border-2 border-white/30 overflow-hidden flex-shrink-0 shadow-md">
                                        <img
                                            src={selectedProduct.image}
                                            alt={selectedProduct.name}
                                            className="h-full w-full object-cover"
                                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black leading-tight">{selectedProduct.name}</h3>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full border", competitionColor(selectedProduct.competition))}>
                                                {selectedProduct.competition}
                                            </span>
                                            <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full border", scoreColor)}>
                                                Score {score}/100
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <a
                                        href={`https://www.etsy.com/search?q=${encodeURIComponent(selectedProduct.name)}`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-sm font-semibold bg-white/15 hover:bg-white/25 border border-white/30 px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <ExternalLink className="h-4 w-4" /> Search Etsy
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* ── Body ── */}
                        <div className="p-5 space-y-5 bg-slate-50 rounded-b-2xl">

                            {/* Stat Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-stretch">
                                <div className="rounded-xl border border-teal-200 bg-white p-4 flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Monthly Searches</span>
                                        <Search className="h-4 w-4 text-teal-400 opacity-70" />
                                    </div>
                                    <p className="text-2xl font-black text-teal-900">{formatSearches(adjSearches)}</p>
                                    <p className="text-xs text-teal-500 mt-0.5">per month</p>
                                </div>
                                <div className={cn("rounded-xl border bg-white p-4 flex flex-col justify-center", adjGrowth >= 0 ? "border-emerald-200" : "border-rose-200")}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={cn("text-[10px] font-bold uppercase tracking-wider", adjGrowth >= 0 ? "text-emerald-600" : "text-rose-600")}>Growth</span>
                                        {adjGrowth >= 0 ? <TrendingUp className="h-4 w-4 text-emerald-400 opacity-70" /> : <TrendingDown className="h-4 w-4 text-rose-400 opacity-70" />}
                                    </div>
                                    <p className={cn("text-2xl font-black", adjGrowth >= 0 ? "text-emerald-900" : "text-rose-900")}>{adjGrowth >= 0 ? '+' : ''}{adjGrowth}%</p>
                                    <p className={cn("text-xs mt-0.5 opacity-60", adjGrowth >= 0 ? "text-emerald-600" : "text-rose-600")}>over selected period</p>
                                </div>
                                <div className={cn("rounded-xl border bg-white p-4 flex flex-col justify-center", competitionColor(selectedProduct.competition).replace(/bg-\S+/g, ''))}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Competition</span>
                                        <ShieldCheck className="h-4 w-4 opacity-40" />
                                    </div>
                                    <p className="text-2xl font-black whitespace-nowrap">{selectedProduct.competition}</p>
                                    <p className="text-xs mt-0.5 opacity-60">seller density</p>
                                </div>
                                <div className="rounded-xl border border-violet-200 bg-white p-4 flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Avg Price</span>
                                        <DollarSign className="h-4 w-4 text-violet-400 opacity-70" />
                                    </div>
                                    <p className="text-2xl font-black text-violet-900">{selectedProduct.avgPrice}</p>
                                    <p className="text-xs text-violet-500 mt-0.5">price range</p>
                                </div>
                            </div>

                            {/* Search Volume Chart */}
                            <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm font-bold text-slate-700">Search Volume Trend</p>
                                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                                        {RANGES.map(r => (
                                            <button
                                                key={r.key}
                                                onClick={() => setProductRevenueRange(r.key)}
                                                className={cn(
                                                    "px-2.5 py-1 rounded-md text-xs font-semibold transition-all",
                                                    productRevenueRange === r.key
                                                        ? "bg-white text-teal-700 shadow-sm"
                                                        : "text-slate-500 hover:text-slate-700"
                                                )}
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-[180px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="productSearchGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.18} />
                                                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`} width={42} />
                                            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)' }} formatter={(value: number) => [`${value.toLocaleString()}`, 'Searches']} itemStyle={{ color: '#0f766e', fontWeight: 600 }} labelStyle={{ color: '#475569', fontWeight: 500 }} />
                                            <Area type="monotone" dataKey="searches" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#productSearchGradient)" dot={false} activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Top Niches */}
                            <div className="rounded-xl border border-slate-200 bg-white p-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Top Niches</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProduct.topNiches.map((niche, i) => (
                                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-sm font-semibold rounded-full">
                                            <Zap className="h-3.5 w-3.5 text-teal-500" />
                                            {niche}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Tag Table */}
                            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-teal-500/80 text-white text-xs font-bold uppercase tracking-wider">
                                            <th className="px-4 py-3 w-[40%]">
                                                <div className="flex items-center gap-2">
                                                    <Tag className="h-3.5 w-3.5 opacity-80" />
                                                    Top Keywords
                                                    <button
                                                        onClick={() => { navigator.clipboard.writeText(allTagsText); setCopiedAllProductTags(true); setTimeout(() => setCopiedAllProductTags(false), 2000) }}
                                                        className="flex items-center gap-1 text-[10px] font-semibold bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-md transition-colors normal-case tracking-normal"
                                                    >
                                                        {copiedAllProductTags ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy All</>}
                                                    </button>
                                                </div>
                                            </th>
                                            <th className="px-4 py-3 w-[20%]">Volume</th>
                                            <th className="px-4 py-3 w-[22%]">Competition</th>
                                            <th className="px-4 py-3 w-[18%] text-right">Keyword Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {tagRows.map(({ tag, volume, comp, kwScore }) => (
                                            <tr key={tag} className="group hover:bg-teal-50 hover:outline hover:outline-2 hover:outline-teal-500 hover:-outline-offset-1 hover:shadow-[inset_2px_0_0_#0d9488,inset_-2px_0_0_#0d9488]">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => { navigator.clipboard.writeText(tag); setCopiedProductTag(tag); setTimeout(() => setCopiedProductTag(null), 1500) }}
                                                            className="text-slate-300 hover:text-teal-500 transition-colors flex-shrink-0"
                                                        >
                                                            {copiedProductTag === tag ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                                        </button>
                                                        <span className="font-medium text-slate-700 capitalize">{tag}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 font-medium">
                                                    {volume >= 1000 ? `${(volume / 1000).toFixed(0)}k` : volume.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-full border", competitionColor(comp))}>{comp}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${kwScore}%` }} />
                                                        </div>
                                                        <span className="font-bold text-slate-700 text-xs w-6 text-right">{kwScore}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                </div>
            )
        })()}
        </>
    )
}
