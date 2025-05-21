'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsChart } from "@/components/dashboard/analytics/analytics-chart";
import { AnalyticsMetrics } from "@/components/dashboard/analytics/analytics-metrics";
import { AnalyticsData } from "@/app/models/analytics";

interface AnalyticsContentProps {
  analyticsData: AnalyticsData;
}

export function AnalyticsContent({ analyticsData }: AnalyticsContentProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsMetrics data={analyticsData} />

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Event Growth</CardTitle>
                <CardDescription>Number of events created over time</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart 
                  type="events" 
                  data={analyticsData.event_growth} 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Number of users registered over time</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart 
                  type="users" 
                  data={analyticsData.user_growth} 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Analytics</CardTitle>
              <CardDescription>Detailed analytics for events</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart 
                type="events" 
                data={analyticsData.event_growth}
                detailed 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>Detailed analytics for users</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart 
                type="users" 
                data={analyticsData.user_growth}
                detailed 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Detailed analytics for revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart 
                type="revenue" 
                data={analyticsData.event_growth}
                detailed 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 