"use client";

import { useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UploadZone() {
  const { setCurrentView, setSelectedWorkflowId, updateWorkflowInList } = useAppStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error al procesar el archivo");
        setUploading(false);
        return;
      }

      const data = await res.json();

      const workflowRes = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name.replace(".docx", ""),
          documentName: file.name,
          documentData: data.documentData,
          fields: data.fields,
        }),
      });

      if (workflowRes.ok) {
        const workflow = await workflowRes.json();
        updateWorkflowInList(workflow);
        setSelectedWorkflowId(workflow.id);
        setCurrentView("workflow-detail");
      } else {
        alert("Error al crear el flujo de trabajo");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error al procesar el archivo");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".docx"
        onChange={handleFileUpload}
        className="hidden"
      />
      <Button
        size="sm"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-md"
      >
        {uploading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Subir Word
          </>
        )}
      </Button>
    </>
  );
}
