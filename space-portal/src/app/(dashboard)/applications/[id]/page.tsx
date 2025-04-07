"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApplication } from "@/components/providers/ApplicationProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { part450FormTemplate } from "@/lib/mock-data";
import { ChevronLeft, Save, Send, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select";
  options?: string[];
}

export default function ApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const { getApplicationById } = useApplication();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("section-0");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const applicationId = params?.id as string;
  const application = applicationId ? getApplicationById(applicationId) : undefined;

  useEffect(() => {
    if (!application && applicationId) {
      router.push("/dashboard");
    }
  }, [application, applicationId, router]);

  if (!application) {
    return null;
  }

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call to save form data
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage("Application saved successfully");
      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    }, 1000);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call to submit application
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/dashboard");
    }, 1500);
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "text":
      case "email":
        return (
          <Input
            id={field.name}
            type={field.type}
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.label}
            className="bg-white/10 border-white/20 text-white"
          />
        );
      case "textarea":
        return (
          <Textarea
            id={field.name}
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.label}
            rows={4}
            className="bg-white/10 border-white/20 text-white"
          />
        );
      case "select":
        return (
          <select
            id={field.name}
            value={formData[field.name] || ""}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white"
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-container py-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center text-white/70 hover:text-white transition-colors">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-3">{application.name}</h1>
          <div className="flex items-center">
            <p className="text-white/60 mr-3">
              {application.type} • Created on{" "}
              {new Date(application.createdAt).toLocaleDateString()}
            </p>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                application.status === "draft"
                  ? "bg-gray-500/20 text-gray-200"
                  : application.status === "under_review"
                  ? "bg-yellow-500/20 text-yellow-300"
                  : application.status === "awaiting_action"
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-green-500/20 text-green-300"
              }`}
            >
              {application.status === "awaiting_action" ? "ACTION NEEDED" : application.status.replace("_", " ").toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex space-x-4 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving || application.status === "active"}
            className="border-white/40 text-white px-6"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || application.status === "active"}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6"
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </div>

      {saveMessage && (
        <Alert className="mb-6 bg-green-500/20 border-green-500/30">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{saveMessage}</AlertDescription>
        </Alert>
      )}

      {application.status === "draft" && (
        <Alert className="mb-6 bg-blue-500/20 border-blue-500/30">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertTitle>Draft Mode</AlertTitle>
          <AlertDescription>
            This application is in draft mode. Complete all required fields before submitting.
          </AlertDescription>
        </Alert>
      )}

      <Card className="space-card">
        <CardContent>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Part 450 License Application Form</h1>
            <p className="text-white/60 mt-2">Complete all sections of the form to submit your application</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex gap-8">
            <div className="w-80">
              <div className="bg-zinc-900/80 rounded-xl overflow-hidden border border-white/10 sticky top-4">
                <TabsList className="flex flex-col w-full">
                  {part450FormTemplate.sections.map((section, index) => (
                    <TabsTrigger
                      key={`section-${index}`}
                      value={`section-${index}`}
                      className="relative data-[state=active]:bg-white/10 data-[state=active]:text-white 
                      data-[state=active]:before:content-[''] data-[state=active]:before:absolute data-[state=active]:before:left-0 
                      data-[state=active]:before:top-0 data-[state=active]:before:h-full data-[state=active]:before:w-1 
                      data-[state=active]:before:bg-gradient-to-b data-[state=active]:before:from-blue-500 data-[state=active]:before:to-purple-500 
                      px-6 py-4 text-white/70 justify-start text-left border-b border-white/5 last:border-b-0
                      hover:bg-white/5 hover:text-white transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center justify-center w-10 h-10 rounded-lg 
                          bg-gradient-to-br from-zinc-800 to-zinc-900 text-sm font-medium 
                          group-data-[state=active]:from-blue-500/20 group-data-[state=active]:to-purple-500/20 
                          group-hover:from-zinc-700 group-hover:to-zinc-800 transition-all duration-200">
                          {index + 1}
                        </span>
                        <span className="font-medium text-base">{section.title}</span>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            <div className="flex-1 min-w-0 pr-4">
              {part450FormTemplate.sections.map((section, sectionIndex) => (
                <TabsContent
                  key={`section-content-${sectionIndex}`}
                  value={`section-${sectionIndex}`}
                  className="space-y-8 mt-0 focus-visible:outline-none focus-visible:ring-0"
                >
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                      {section.title}
                    </h2>
                    <p className="text-white/60 text-lg">
                      Complete the {section.title.toLowerCase()} details
                    </p>
                  </div>

                  <div className="space-y-6">
                    {section.fields.map((field, fieldIndex) => (
                      <div 
                        key={`field-${sectionIndex}-${fieldIndex}`} 
                        className="space-y-3 bg-zinc-900/50 p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                      >
                        <label
                          htmlFor={field.name}
                          className="text-base font-medium text-white flex items-center space-x-2"
                        >
                          {field.label}
                        </label>
                        {renderField(field as FormField)}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-8">
                    {sectionIndex > 0 && (
                      <Button
                        variant="outline"
                        className="border-white/10 text-white hover:bg-white/5 transition-colors px-6"
                        onClick={() => setActiveTab(`section-${sectionIndex - 1}`)}
                      >
                        Previous Section
                      </Button>
                    )}
                    {sectionIndex < part450FormTemplate.sections.length - 1 && (
                      <Button
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 transition-opacity ml-auto px-6"
                        onClick={() => setActiveTab(`section-${sectionIndex + 1}`)}
                      >
                        Next Section
                      </Button>
                    )}
                  </div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
