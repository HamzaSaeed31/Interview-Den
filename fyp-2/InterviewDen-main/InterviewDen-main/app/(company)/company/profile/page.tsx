"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Mail } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { toast } from "sonner";

export default function CompanyProfilePage() {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    company_name: "",
    industry: "",
    size: "",
    location: "",
    website: "",
    description: "",
    email: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setLoading(false);
        return;
      }
      const userId = user.id;
      // Fetch from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();
      // Fetch from companies
      const { data: company } = await supabase
        .from("companies")
        .select("company_name, industry, size, location, website, description")
        .eq("id", userId)
        .single();
      setCompanyInfo({
        company_name: company?.company_name || "",
        industry: company?.industry || "",
        size: company?.size || "",
        location: company?.location || "",
        website: company?.website || "",
        description: company?.description || "",
        email: profile?.email || user.email || "",
      });
      setLoading(false);
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      setSaving(false);
      return;
    }
    const userId = user.id;
    // Update companies table
    const { error: companyError } = await supabase
      .from("companies")
      .update({
        company_name: companyInfo.company_name,
        industry: companyInfo.industry,
        size: companyInfo.size,
        location: companyInfo.location,
        website: companyInfo.website,
        description: companyInfo.description,
      })
      .eq("id", userId);
    // Optionally update email in profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ email: companyInfo.email })
      .eq("id", userId);
    if (companyError || profileError) {
      toast.error("Failed to save changes");
    } else {
      toast.success("Profile updated successfully!");
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Company Profile</h1>
        <p className="text-muted-foreground">Manage your company information and settings</p>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={companyInfo.company_name}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, company_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={companyInfo.industry}
                  onValueChange={(value) => setCompanyInfo({ ...companyInfo, industry: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Company Size</Label>
                <Input
                  id="size"
                  value={companyInfo.size}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, size: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={companyInfo.location}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={companyInfo.description}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, description: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Update your company contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                    <Globe className="h-4 w-4" />
                  </span>
                  <Input
                    id="website"
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                    className="rounded-l-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </span>
                  <Input
                    id="email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Contact Details"}</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
} 