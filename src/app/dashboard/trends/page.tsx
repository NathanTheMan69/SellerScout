"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/Card"
import { DashboardLayout } from "@/components/DashboardLayout"
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Filter, X, ExternalLink, BarChart2, Tag, DollarSign, Zap, ImageOff, Search, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/Button"
import { createClient } from "@/utils/supabase/client"
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
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

// Curated fallback dataset — always visible, merged with live Supabase data when available
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
        'gift idea',
        'handmade',
        'trending'
    ]
    return tags.filter((v, i, a) => a.indexOf(v) === i && v.length > 0).slice(0, 8)
}

const competitionColor = (level: string) => {
    if (level === 'Low') return 'text-emerald-700 bg-emerald-100/60 border-emerald-200'
    if (level === 'Medium') return 'text-amber-700 bg-amber-100/60 border-amber-200'
    if (level === 'High') return 'text-rose-700 bg-rose-100/60 border-rose-200'
    return 'text-purple-700 bg-purple-100/60 border-purple-200'
}

function TrendCard({ item, onClick }: { item: TrendData; onClick: () => void }) {
    const [imgError, setImgError] = useState(false)
    const isRising = item.growth > 0

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-teal-300 hover:shadow-md hover:shadow-teal-900/10 overflow-hidden flex flex-col"
        >
            {/* Photo */}
            <div className="relative h-36 bg-slate-100 overflow-hidden shrink-0">
                {item.image && !imgError ? (
                    <img
                        src={item.image}
                        alt={item.keyword}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center">
                        <ImageOff className="h-8 w-8 text-slate-300" />
                    </div>
                )}
                {/* Growth badge */}
                <div className={cn(
                    "absolute top-2 left-2 flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-md",
                    isRising
                        ? "bg-emerald-600/80 text-white"
                        : "bg-rose-600/80 text-white"
                )}>
                    {isRising ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {isRising ? "+" : ""}{item.growth}%
                </div>
                {/* Category badge */}
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.category}
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 capitalize" title={item.keyword}>
                    {item.keyword}
                </h3>

                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-teal-600">{(item.search_volume ?? 0).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 font-medium">searches/mo</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-slate-100">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Comp.</span>
                        <span className={cn("text-[9px] font-bold w-fit px-1.5 py-0.5 rounded border", competitionColor(item.competition))}>
                            {item.competition}
                        </span>
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

    const supabase = createClient()

    useEffect(() => { fetchTrends() }, [])

    const fetchTrends = async () => {
        try {
            const { data, error } = await supabase
                .from('trends')
                .select('*')
                .order('search_volume', { ascending: false })

            if (error) throw error

            if (data && data.length > 0) {
                const dbKeywords = new Set(data.map((d: any) => d.keyword))
                const merged = [...data, ...STATIC_TRENDS.filter(s => !dbKeywords.has(s.keyword))]
                setTrends(merged)
            }
        } catch (error) {
            console.error('Error fetching trends:', error)
        } finally {
            setLoading(false)
        }
    }

    const categories = ["All", ...Array.from(new Set(trends.map(t => t.category))).sort()]

    const filteredTrends = trends.filter(item => {
        const matchesCategory = categoryFilter === "All" || item.category === categoryFilter
        const matchesSearch = searchQuery.trim() === "" || item.keyword.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const totalPages = Math.ceil(filteredTrends.length / ITEMS_PER_PAGE)
    const currentData = filteredTrends.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)



    return (
        <DashboardLayout>
            <div className="space-y-8">

                {/* Header */}
                <div className="relative pl-4">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full" />
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">Market Trends</h1>
                    <p className="text-muted-foreground">Discover rising search terms and seasonal opportunities.</p>
                </div>

                {/* Search + Filter */}
                <div className="flex items-center gap-3">
                        {/* Search bar */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search trends..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                                className="h-14 w-full pl-12 pr-5 rounded-xl border border-slate-200 bg-white text-lg font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => { setSearchQuery(""); setCurrentPage(1) }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        {/* Category filter */}
                        <div className="relative shrink-0">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }}
                                className="h-14 pl-12 pr-8 rounded-xl border border-slate-200 bg-white text-lg font-medium text-slate-600 focus:border-teal-500 outline-none appearance-none cursor-pointer min-w-[180px] shadow-sm"
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                </div>

                {/* Card Grid */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-800">Trending Now</h2>
                        <span className="text-sm text-slate-500">{filteredTrends.length} keywords</span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                                    <div className="h-36 bg-slate-100 animate-pulse" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                                        <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : currentData.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {currentData.map((item) => (
                                <TrendCard
                                    key={item.id}
                                    item={item}
                                    onClick={() => setSelectedTrendData(item)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-16 text-center">
                            <p className="text-slate-500 font-medium">No trends found matching your filters.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && filteredTrends.length > ITEMS_PER_PAGE && (
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                onClick={() => {
                                    setCurrentPage(p => Math.max(1, p - 1))
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => {
                                        setCurrentPage(page)
                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                    }}
                                    className={cn(
                                        "px-3 py-1 rounded-lg text-sm font-semibold transition-colors",
                                        currentPage === page
                                            ? "bg-teal-600 text-white shadow-sm"
                                            : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                                    )}
                                >
                                    Page {page}
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    setCurrentPage(p => Math.min(totalPages, p + 1))
                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Trend Detail Modal */}
                {selectedTrendData && (
                    <div
                        className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setSelectedTrendData(null)}
                    >
                        <div
                            className="modal-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/80 bg-slate-50 shadow-2xl shadow-slate-900/20"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
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
                                <button
                                    onClick={() => setSelectedTrendData(null)}
                                    className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Stat Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-teal-100/35 rounded-xl border border-teal-200 p-4">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <BarChart2 className="h-3.5 w-3.5 text-teal-500" />
                                            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Search Volume</p>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-800">{(selectedTrendData.search_volume ?? 0).toLocaleString()}</p>
                                        <p className="text-xs text-teal-500 mt-0.5">monthly searches</p>
                                    </div>
                                    {(() => { const g = selectedTrendData.growth ?? 0; return (
                                    <div className={cn("rounded-xl border p-4", g > 0 ? "bg-emerald-100/35 border-emerald-200" : "bg-rose-100/60 border-rose-200")}>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            {g > 0
                                                ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                                                : <TrendingDown className="h-3.5 w-3.5 text-rose-500" />}
                                            <p className={cn("text-xs font-semibold uppercase tracking-wider", g > 0 ? "text-emerald-600" : "text-rose-600")}>Growth</p>
                                        </div>
                                        <p className={cn("text-2xl font-bold", g > 0 ? "text-emerald-700" : "text-rose-700")}>
                                            {g > 0 ? "+" : ""}{g}%
                                        </p>
                                        <p className={cn("text-xs mt-0.5 opacity-60", g > 0 ? "text-emerald-600" : "text-rose-600")}>over 12 months</p>
                                    </div>
                                    )})()}
                                    <div className={cn("rounded-xl border p-4", competitionColor(selectedTrendData.competition))}>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Tag className="h-3.5 w-3.5" />
                                            <p className="text-xs font-semibold uppercase tracking-wider">Competition</p>
                                        </div>
                                        <p className="text-2xl font-bold">{selectedTrendData.competition}</p>
                                        <p className="text-xs mt-0.5 opacity-60">seller density</p>
                                    </div>
                                    <div className="bg-orange-100/60 rounded-xl border border-orange-200 p-4">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <DollarSign className="h-3.5 w-3.5 text-orange-500" />
                                            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Avg Price</p>
                                        </div>
                                        <p className="text-2xl font-bold text-slate-800">{selectedTrendData.avg_price || '—'}</p>
                                        <p className="text-xs text-orange-400 mt-0.5">typical range</p>
                                    </div>
                                </div>

                                {/* Chart */}
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
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)' }}
                                                            formatter={(value: number) => [value.toLocaleString(), 'Search Volume']}
                                                            itemStyle={{ color: '#0f766e', fontWeight: 600 }}
                                                            labelStyle={{ color: '#475569', fontWeight: 500 }}
                                                        />
                                                        <Area type="monotone" dataKey="volume" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#trendGradient)" dot={false} activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    )
                                })()}

                                {/* Insights */}
                                {(() => {
                                    const months = (selectedTrendData.monthly_searches ?? []).length > 0
                                        ? selectedTrendData.monthly_searches!
                                        : generateMockMonthlyData(selectedTrendData.search_volume ?? 0, selectedTrendData.growth ?? 0)
                                    const getVol = (m: any) => m.volume ?? m.searches ?? 0
                                    const peakMonth = months.length > 0 ? months.reduce((p, c) => getVol(p) > getVol(c) ? p : c) : null
                                    const g = selectedTrendData.growth ?? 0
                                    const sv = selectedTrendData.search_volume ?? 0
                                    const opportunityScore = Math.min(100, Math.round(
                                        (g > 0 ? Math.min(g, 200) / 2 : 0) +
                                        (['Low', 'Medium'].includes(selectedTrendData.competition ?? '') ? 30 : 10) +
                                        Math.min(sv / 1000, 20)
                                    ))
                                    const scoreColor = opportunityScore >= 70 ? 'text-emerald-700 bg-emerald-100/35 border-emerald-200'
                                        : opportunityScore >= 40 ? 'text-amber-700 bg-amber-100/60 border-amber-200'
                                        : 'text-rose-700 bg-rose-100/60 border-rose-200'
                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div className={cn("rounded-xl border p-4 flex items-start gap-3", scoreColor)}>
                                                <Zap className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wider mb-0.5">Opportunity Score</p>
                                                    <p className="text-2xl font-bold">{opportunityScore}<span className="text-sm font-medium opacity-60">/100</span></p>
                                                    <p className="text-xs mt-0.5 opacity-70">{opportunityScore >= 70 ? 'Strong potential' : opportunityScore >= 40 ? 'Moderate potential' : 'Competitive space'}</p>
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

                                {/* Tags */}
                                {(() => {
                                    const tags = generateMockTags(selectedTrendData.keyword, selectedTrendData.category)
                                    return (
                                        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                                    <Tag className="h-4 w-4 text-slate-400" />
                                                    Popular Tags
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(tags.join(', '))
                                                        setCopiedTags(true)
                                                        setTimeout(() => setCopiedTags(false), 2000)
                                                    }}
                                                    className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors bg-white border border-slate-200 hover:border-slate-300 shadow-sm px-2.5 py-1.5 rounded-md"
                                                >
                                                    {copiedTags ? (
                                                        <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied!</>
                                                    ) : (
                                                        <><Copy className="h-3.5 w-3.5" /> Copy Tags</>
                                                    )}
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {tags.map(tag => (
                                                    <span key={tag} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-md">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })()}

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <p className="text-xs text-slate-400">Data reflects estimated Etsy market trends</p>
                                    <a
                                        href={`https://www.etsy.com/search?q=${encodeURIComponent(selectedTrendData.keyword)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline transition-colors"
                                    >
                                        View on Etsy <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    )
}
