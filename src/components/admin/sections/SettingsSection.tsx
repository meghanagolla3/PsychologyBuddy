"use client";

import React, { useState } from 'react';
import { Building2, Bell, Shield, Palette, Database, Key } from "lucide-react";
import { AdminHeader } from '../layout/AdminHeader';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsSection() {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader 
        title="Settings" 
        subtitle="Manage platform configuration and preferences"
        showTimeFilter={false}
      />
      
      <div className="flex-1 overflow-auto p-6 animate-fade-in">
        <Tabs defaultValue="organization" className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 w-full lg:w-auto bg-[#edf0f3]">
            <TabsTrigger value="organization" className="gap-2 data-[state=active]:bg-[#f9fafb] text-[#65758b] hover:text-gray-900 data-[state=active]:text-black">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Organization</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-[#f9fafb] text-[#65758b] hover:text-gray-900 data-[state=active]:text-black">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2 data-[state=active]:bg-[#f9fafb] text-[#65758b] hover:text-gray-900 data-[state=active]:text-black">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Permissions</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2 data-[state=active]:bg-[#f9fafb] text-[#65758b] hover:text-gray-900 data-[state=active]:text-black">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2 data-[state=active]:bg-[#f9fafb] text-[#65758b] hover:text-gray-900 data-[state=active]:text-black">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-[#f9fafb] text-[#65758b] hover:text-gray-900 data-[state=active]:text-black">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="organization">
            <Card>
              <CardHeader>
                <CardTitle>Organization Profile</CardTitle>
                <CardDescription>Manage your school's information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input id="schoolName" defaultValue="Greenfield High School" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input id="adminEmail" type="email" defaultValue="admin@greenfield.edu" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" defaultValue="123 Education Lane, Learning City, LC 12345" rows={2} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="est">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                        <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                        <SelectItem value="cst">Central Time (CST)</SelectItem>
                        <SelectItem value="est">Eastern Time (EST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Separator />
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure alert and notification settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Critical Alerts</p>
                      <p className="text-sm text-muted-foreground">Receive immediate notifications for critical alerts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Daily Digest</p>
                      <p className="text-sm text-muted-foreground">Receive daily summary of platform activity</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Reports</p>
                      <p className="text-sm text-muted-foreground">Receive weekly analytics reports</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                <Separator />
                <div className="grid gap-2">
                  <Label>Notification Email</Label>
                  <Input type="email" defaultValue="alerts@greenfield.edu" />
                </div>
                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Role & Permission Management</CardTitle>
                <CardDescription>Configure access levels for different user roles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium">Super Admin</p>
                        <p className="text-sm text-muted-foreground">Full system access</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">All Permissions</span>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium">Admin</p>
                        <p className="text-sm text-muted-foreground">Platform management</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-muted px-2 py-1 rounded">Content</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">Analytics</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">Users</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">Settings</span>
                    </div>
                  </div>
                </div>
                <Button>Create New Role</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance & Branding</CardTitle>
                <CardDescription>Customize the look and feel of the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input type="color" defaultValue="#3b82f6" className="w-12 h-10 p-1" />
                      <Input defaultValue="#3b82f6" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Logo</Label>
                    <Input type="file" accept="image/*" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show School Logo</p>
                    <p className="text-sm text-muted-foreground">Display logo in navigation</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button>Save Appearance</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Data & Privacy</CardTitle>
                <CardDescription>Manage data retention and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label>Data Retention Period</Label>
                  <Select defaultValue="2years">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="2years">2 Years</SelectItem>
                      <SelectItem value="5years">5 Years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Anonymize Inactive Users</p>
                    <p className="text-sm text-muted-foreground">Automatically anonymize data for inactive users</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Data Export</p>
                    <p className="text-sm text-muted-foreground">Allow admins to export student data</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button variant="outline">Export All Data</Button>
                  <Button variant="destructive">Purge Old Data</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure authentication and security options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">IP Allowlist</p>
                    <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Audit Logging</p>
                    <p className="text-sm text-muted-foreground">Log all admin actions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button>Save Security Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
