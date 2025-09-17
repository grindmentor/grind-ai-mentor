import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Activity, Target, Award } from 'lucide-react';

interface ChartDataPoint {
  name: string;
  value: number;
  category?: string;
  trend?: 'up' | 'down' | 'stable';
  target?: number;
}

interface AdvancedChartProps {
  data: ChartDataPoint[];
  type: 'line' | 'area' | 'bar' | 'radar' | 'progress-ring';
  title: string;
  subtitle?: string;
  showTrend?: boolean;
  showTarget?: boolean;
  scientific?: boolean;
  className?: string;
}

export const AdvancedChart: React.FC<AdvancedChartProps> = ({
  data,
  type,
  title,
  subtitle,
  showTrend = false,
  showTarget = false,
  scientific = true,
  className = ''
}) => {
  const chartColors = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    success: 'hsl(142, 76%, 36%)',
    warning: 'hsl(47, 96%, 53%)',
    error: 'hsl(0, 84%, 60%)'
  };

  const overallTrend = useMemo(() => {
    if (data.length < 2) return 'stable';
    const first = data[0].value;
    const last = data[data.length - 1].value;
    const change = ((last - first) / first) * 100;
    
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  }, [data]);

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card border-primary/20 p-3 rounded-lg shadow-lg">
          <p className="font-semibold text-primary">{label}</p>
          {payload.map((pld: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: pld.color }} 
              />
              <span className="text-foreground">
                {pld.name}: <span className="font-mono font-semibold">{pld.value}</span>
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={chartColors.primary}
                strokeWidth={3}
                dot={{ fill: chartColors.primary, strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: chartColors.primary, strokeWidth: 2 }}
              />
              {showTarget && (
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke={chartColors.accent}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={chartColors.primary}
                fill={`${chartColors.primary}33`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill={chartColors.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Radar 
                name="Score" 
                dataKey="value" 
                stroke={chartColors.primary}
                fill={`${chartColors.primary}33`}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'progress-ring':
        const totalValue = data.reduce((sum, item) => sum + item.value, 0);
        const maxValue = Math.max(...data.map(item => item.value));
        
        return (
          <div className="flex items-center justify-center h-[300px]">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {data.map((item, index) => {
                  const circumference = 2 * Math.PI * 40;
                  const strokeDasharray = circumference;
                  const strokeDashoffset = circumference * (1 - item.value / 100);
                  const rotation = (index * 360) / data.length;
                  
                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={Object.values(chartColors)[index % Object.values(chartColors).length]}
                      strokeWidth="6"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        transformOrigin: '50% 50%'
                      }}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {Math.round(totalValue / data.length)}%
                </span>
                <span className="text-sm text-muted-foreground">Average</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={`glass-card border-primary/20 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-gradient flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>{title}</span>
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {showTrend && (
            <div className="flex items-center space-x-2">
              <TrendIcon trend={overallTrend} />
              <Badge variant="outline" className="capitalize">
                {overallTrend}
              </Badge>
            </div>
          )}
        </div>
        
        {scientific && (
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Target className="w-3 h-3" />
              <span>Evidence-based metrics</span>
            </div>
            <div className="flex items-center space-x-1">
              <Award className="w-3 h-3" />
              <span>Peer-reviewed standards</span>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {renderChart()}
        {type === 'progress-ring' && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: Object.values(chartColors)[index % Object.values(chartColors).length] }}
                />
                <span className="text-foreground">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedChart;