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
    <div className="space-container py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center text-white/70 hover:text-white transition-colors">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{application.name}</h1>
          <div className="flex items-center">
            <p className="text-white/60 mr-3">
              {application.type} • Created on{" "}
              {new Date(application.createdAt).toLocaleDateString()}
            </p>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
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

        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving || application.status === "active"}
            className="border-white/40 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || application.status === "active"}
            className="spacex-button"
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

      <Card className="space-card mb-8">
        <CardHeader>
          <CardTitle>Part 450 License Application Form</CardTitle>
          <CardDescription className="text-white/60">
            Complete all sections of the form to submit your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex">
            <TabsList className="bg-white/10 p-0 flex flex-col w-64 h-fit border-r border-white/20">
              {part450FormTemplate.sections.map((section, index) => (
                <TabsTrigger
                  key={`section-${index}`}
                  value={`section-${index}`}
                  className="data-[state=active]:bg-white/20 data-[state=active]:text-white px-4 py-4 text-white/70 justify-start text-left border-b border-white/10 last:border-b-0"
                >
                  {index + 1}. {section.title}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 pl-8">
              {part450FormTemplate.sections.map((section, sectionIndex) => (
                <TabsContent
                  key={`section-content-${sectionIndex}`}
                  value={`section-${sectionIndex}`}
                  className="space-y-6 pt-4 m-0"
                >
                  <div className="space-y-1 mb-4">
                    <h2 className="text-xl font-bold text-white">{section.title}</h2>
                    <p className="text-white/60">
                      Complete the {section.title.toLowerCase()} details
                    </p>
                  </div>

                  <div className="space-y-4">
                    {section.fields.map((field, fieldIndex) => (
                      <div key={`field-${sectionIndex}-${fieldIndex}`} className="space-y-2">
                        <label
                          htmlFor={field.name}
                          className="text-sm font-medium text-white"
                        >
                          {field.label}
                        </label>
                        {renderField(field as FormField)}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-4">
                    {sectionIndex > 0 && (
                      <Button
                        variant="outline"
                        className="border-white/40 text-white"
                        onClick={() => setActiveTab(`section-${sectionIndex - 1}`)}
                      >
                        Previous Section
                      </Button>
                    )}
                    {sectionIndex < part450FormTemplate.sections.length - 1 && (
                      <Button
                        className="spacex-button ml-auto"
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
