"use client";

import { useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Upload } from "lucide-react";
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
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) { alert((await res.json()).error || "Error"); setUploading(false); return; }
      const data = await res.json();
      const workflowRes = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name.replace(".docx", ""), documentName: file.name, documentData: data.documentData, fields: data.fields }),
      });
      if (workflowRes.ok) {
        const workflow = await workflowRes.json();
        updateWorkflowInList(workflow);
        setSelectedWorkflowId(workflow.id);
        setCurrentView("workflow-detail");
      }
    } catch (error) { alert("Error al procesar el archivo"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  return (
    <>
      <input ref={fileRef} type="file" accept=".docx" onChange={handleFileUpload} className="hidden" />
      <Button
        size="sm"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="rounded-full bg-[#007AFF] px-5 text-sm font-medium text-white shadow-sm shadow-[#007AFF]/20 hover:bg-[#0066E0]"
      >
        {uploading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <><Upload className="mr-1.5 h-4 w-4" />Subir Word</>
        )}
      </Button>
    </>
  );
}
