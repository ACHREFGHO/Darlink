'use client'

import React from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'

interface DashboardChartsProps {
    viewsData: any[]
    revenueData: any[]
    occupancy: number
    stats: {
        viewsToday: number
        viewsYesterday: number
        totalEarnings: number
        upcomingBookings: number
    }
}

export function DashboardCharts({ viewsData, revenueData, occupancy, stats }: DashboardChartsProps) {
    const viewTrend = stats.viewsToday >= stats.viewsYesterday ? 'up' : 'down'
    const viewDiff = stats.viewsYesterday > 0
        ? Math.round(((stats.viewsToday - stats.viewsYesterday) / stats.viewsYesterday) * 100)
        : 100

    return (
        <div className="space-y-6">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-blue-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-bold text-[#0B3D6F] uppercase tracking-wider">Property Views</CardTitle>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-4 h-4 text-[#0B3D6F]" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-[#0B3D6F]">{stats.viewsToday}</div>
                        <div className={`flex items-center text-xs font-bold mt-1 ${viewTrend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                            {viewTrend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                            {viewDiff}% vs yesterday
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-orange-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-bold text-[#0B3D6F] uppercase tracking-wider">Total Earnings</CardTitle>
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <DollarSign className="w-4 h-4 text-[#F17720]" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-[#0B3D6F]">{stats.totalEarnings.toLocaleString()} <span className="text-sm font-normal text-slate-500">TND</span></div>
                        <p className="text-xs font-bold text-slate-400 mt-1">Confirmed revenue</p>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-green-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-bold text-[#0B3D6F] uppercase tracking-wider">Occupancy Rate</CardTitle>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-[#0B3D6F]">{occupancy}%</div>
                        <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                            <div
                                className="bg-green-500 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${occupancy}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-white to-purple-50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-bold text-[#0B3D6F] uppercase tracking-wider">Upcoming</CardTitle>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-[#0B3D6F]">{stats.upcomingBookings}</div>
                        <p className="text-xs font-bold text-slate-400 mt-1">Nights booked next 30 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50/50">
                        <CardTitle className="text-lg font-bold text-[#0B3D6F] flex items-center gap-2">
                            <div className="w-2 h-6 bg-[#F17720] rounded-full" />
                            Revenue Projection
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-10">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F17720" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#F17720" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ stroke: '#F17720', strokeWidth: 2 }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#F17720"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Views Chart */}
                <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50/50">
                        <CardTitle className="text-lg font-bold text-[#0B3D6F] flex items-center gap-2">
                            <div className="w-2 h-6 bg-[#0B3D6F] rounded-full" />
                            Traffic Insights
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-10">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={viewsData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: '#f8fafc' }}
                                    />
                                    <Bar
                                        dataKey="views"
                                        fill="#0B3D6F"
                                        radius={[8, 8, 0, 0]}
                                        animationDuration={1500}
                                    >
                                        {viewsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === viewsData.length - 1 ? '#F17720' : '#0B3D6F'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
