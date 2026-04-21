"use client";

import { useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Upload, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AREA_LABEL_MAP } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

export function UploadZone() {
  const { setCurrentView, setSelectedWorkflowId, updateWorkflowInList } = useAppStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState<{ fields: any[]; documentData: string; fileName: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(true);
  const [templateName, setTemplateName] = useState("");

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
      
      setParsedData({
        fields: data.fields,
        documentData: data.documentData,
        fileName: file.name
      });
      setTemplateName(file.name.replace(".docx", ""));
    } catch (error) { alert("Error al procesar el archivo"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const confirmWorkflow = async () => {
    if (!parsedData) return;
    setUploading(true);
    try {
      if (saveAsTemplate && templateName.trim()) {
         await fetch("/api/templates", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ name: templateName, fields: parsedData.fields })
         });
      }

      const workflowRes = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
           name: parsedData.fileName.replace(".docx", ""), 
           documentName: parsedData.fileName, 
           documentData: parsedData.documentData, 
           fields: parsedData.fields 
        }),
      });
      if (workflowRes.ok) {
        const workflow = await workflowRes.json();
        updateWorkflowInList(workflow);
        setSelectedWorkflowId(workflow.id);
        setCurrentView("workflow-detail");
        setOpen(false);
        setParsedData(null);
      }
    } catch (e) {
      alert("Error al confirmar el flujo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setParsedData(null); }}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="rounded-full bg-[#007AFF] px-5 text-sm font-medium text-white shadow-sm shadow-[#007AFF]/20 hover:bg-[#0066E0]"
        >
          <Upload className="mr-1.5 h-4 w-4" />Subir Word
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-2xl border-black/5">
        <DialogHeader>
          <DialogTitle className="text-lg text-foreground">
             Crear flujo desde Word
          </DialogTitle>
        </DialogHeader>
        
        {!parsedData ? (
           <div className="space-y-4 pt-4">
              <div className="rounded-xl bg-primary/10 p-4 flex gap-3 text-sm text-foreground">
                 <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                 <div>
                   <p className="font-semibold mb-1">Instrucciones para el documento word:</p>
                   <p className="text-muted-foreground text-xs">
                     Asegúrate de que los campos en tu documento de Word que deseas extraer estén encerrados en llaves dobles. 
                     Por ejemplo: <strong className="font-mono text-primary bg-background px-1 rounded">{"{{Nombre del Cliente}}"}</strong> o <strong className="font-mono text-primary bg-background px-1 rounded">{"{{Valor}}"}</strong>. 
                     El sistema los detectará, asignará inteligentemente a las áreas correspondientes y rellenará el flujo automáticamente.
                   </p>
                 </div>
              </div>
              <input ref={fileRef} type="file" accept=".docx" onChange={handleFileUpload} className="hidden" />
              <Button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full h-12 bg-[#007AFF] text-white hover:bg-[#0066E0] rounded-xl"
              >
                {uploading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>Subir y Procesar Archivo</>
                )}
              </Button>
           </div>
        ) : (
           <div className="space-y-4 pt-2">
             <div className="flex items-center gap-2 mb-2">
               <CheckCircle2 className="h-5 w-5 text-[#34C759]" />
               <h3 className="font-semibold text-foreground">Se detectaron {parsedData.fields.length} campos</h3>
             </div>
             
             {parsedData.fields.length > 0 ? (
               <div className="max-h-48 overflow-y-auto space-y-2 border rounded-xl p-3 bg-muted border-border">
                  {parsedData.fields.map((f, i) => (
                     <div key={i} className="flex items-center justify-between bg-card px-3 py-2 rounded-lg text-sm border border-border">
                        <span className="font-medium text-foreground">{f.label}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">{AREA_LABEL_MAP[f.area] || f.area}</span>
                     </div>
                  ))}
               </div>
             ) : (
               <div className="rounded-xl border border-dashed border-border p-6 text-center">
                 <p className="text-sm text-muted-foreground">No se detectaron campos con el formato {"{{Ejemplo}}"}.</p>
               </div>
             )}
             
             <div className="rounded-xl border border-border p-4 space-y-3 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                     id="saveTemplate" 
                     checked={saveAsTemplate} 
                     onCheckedChange={(c) => setSaveAsTemplate(!!c)} 
                     className="border-muted-foreground"
                  />
                  <Label htmlFor="saveTemplate" className="text-sm font-medium text-foreground">Guardar como Plantilla</Label>
                </div>
                {saveAsTemplate && (
                   <div className="pl-6">
                      <Label className="text-xs text-muted-foreground">Nombre de la plantilla</Label>
                      <Input 
                        value={templateName} 
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="mt-1 h-9 bg-muted border-transparent text-foreground"
                      />
                   </div>
                )}
             </div>

             <Button
                onClick={confirmWorkflow}
                disabled={uploading || (saveAsTemplate && !templateName)}
                className="w-full h-11 bg-[#1D1D1F] text-white hover:bg-black rounded-xl"
             >
                {uploading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>Crear Flujo de Trabajo</>
                )}
             </Button>
           </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
