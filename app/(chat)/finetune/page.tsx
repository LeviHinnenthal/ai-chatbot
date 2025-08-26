"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { Buffer } from "buffer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Trash2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { FinetuneSkeleton } from "@/components/finetune-skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FinetuneStatus {
  id: string;
  status: "Pending" | "Ready" | "Error";
  result: { finetune_id: string } | null;
  progress: null;
  details: null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reader.abort();
      reject(new Error("Problem reading file"));
    };
    reader.onload = () => {
      // reader.result is "data:application/zip;base64,XXX…"
      const dataUrl = reader.result as string;
      const [, base64] = dataUrl.split(",", 2);
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });
}

export default function FinetunesPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/finetune", fetcher, {
    revalidateOnFocus: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [creatingFinetune, setCreatingFinetune] = useState<{
    id: string;
    pollingUrl: string;
  } | null>(null);

  // advanced params
  const [triggerWord, setTriggerWord] = useState("TOK");
  const [mode, setMode] = useState<"general" | "lora">("general");
  const [iterations, setIterations] = useState(300);
  const [learningRate, setLearningRate] = useState(0.0001);
  const [captioning, setCaptioning] = useState(true);
  const [priority, setPriority] = useState<"speed" | "quality">("quality");
  const [finetuneType, setFinetuneType] = useState<"full" | "lora">("full");
  const [loraRank, setLoraRank] = useState(32);

  // Función para hacer polling del estado
  const pollFinetuneStatus = async (id: string) => {
    try {
      const response = await fetch(
        `https://api.eu1.bfl.ai/v1/get_result?id=${id}`
      );
      const data = await response.json();

      if (data.status === "Ready") {
        setCreatingFinetune(null);
        mutate(); // Refrescar la lista
        return;
      }

      // Si aún está pendiente, continuar polling
      setTimeout(() => pollFinetuneStatus(id), 30000); // 30 segundos
    } catch (error) {
      console.error("Error polling finetune status:", error);
      setCreatingFinetune(null);
    }
  };

  // Modificar handleCreate para iniciar el polling
  async function handleCreate() {
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);

      const payload = {
        file_data: base64,
        finetune_comment: comment || file.name,
        trigger_word: triggerWord,
        mode,
        iterations,
        learning_rate: learningRate,
        captioning,
        priority,
        finetune_type: finetuneType,
        lora_rank: loraRank,
      };

      const response = await fetch("/api/finetune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create finetune");
      }

      const result = await response.json();

      // Iniciar el polling
      setCreatingFinetune({
        id: result.id,
        pollingUrl: result.polling_url,
      });
      pollFinetuneStatus(result.id);

      // Reset form
      setFile(null);
      setComment("");
    } catch (error) {
      console.error("Error creating finetune:", error);
    }
  }

  async function handleDelete(id: string) {
    await fetch("/api/finetune", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ finetune_id: id }),
    });
    mutate();
  }

  return (
    <div className="max-w-7xl flex flex-col lg:flex-row gap-4 p-6">
      {/* Create form */}
      <Card className="max-w-2xl h-fit w-full lg:w-1/2 lg:sticky lg:top-20">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Eigenes GPT konfigurieren</h2>

          <div className="space-y-2">
            <Label>Training file</Label>
            <Input
              type="file"
              accept=".zip,.jsonl,.txt,.csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              placeholder="Enter a name for the model"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch checked={advanced} onCheckedChange={setAdvanced} />
            <span className="select-none">Advanced settings</span>
          </div>

          {advanced && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Trigger Word</Label>
                  <Input
                    placeholder="TOK"
                    value={triggerWord}
                    onChange={(e) => setTriggerWord(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Mode</Label>
                  <select
                    className="block w-full rounded-md border p-2"
                    value={mode}
                    onChange={(e) => setMode(e.target.value as any)}
                  >
                    <option value="general">General</option>
                    <option value="character">Character</option>
                    <option value="style">Style</option>
                    <option value="product">Product</option>
                  </select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <select
                    className="block w-full rounded-md border p-2"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <option value="quality">quality</option>
                    <option value="speed">speed</option>
                  </select>
                </div>
                <div>
                  <Label>Type</Label>
                  <select
                    className="block w-full rounded-md border p-2"
                    value={finetuneType}
                    onChange={(e) => setFinetuneType(e.target.value as any)}
                  >
                    <option value="full">full</option>
                    <option value="lora">lora</option>
                  </select>
                </div>
                <div>
                  <Label>LoRA Rank</Label>
                  <select
                    className="block w-full rounded-md border p-2"
                    value={loraRank}
                    onChange={(e) => setLoraRank(e.target.value as any)}
                  >
                    <option value="16">16</option>
                    <option value="32">32</option>
                  </select>
                </div>
                <div></div>
                <div className="space-y-2">
                  {/* Show label + current value */}
                  <div className="flex justify-between items-baseline">
                    <Label>Iterations</Label>
                    <span className="text-sm font-medium">{iterations}</span>
                  </div>

                  {/* The actual slider */}
                  <Slider
                    value={[iterations]}
                    onValueChange={(val) => setIterations(val[0])}
                    defaultValue={[100]}
                    min={100}
                    max={1000}
                    step={1}
                  />

                  {/* Show min/max at the ends */}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{100}</span>
                    <span>{1000}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <Label>Learning Rate</Label>
                    <span className="text-sm font-medium">{learningRate}</span>
                  </div>

                  <Slider
                    value={[learningRate]}
                    onValueChange={(value) => setLearningRate(value[0])}
                    min={0.000001}
                    max={0.005}
                    step={0.000001}
                    defaultValue={[0.005]}
                  />

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{0.0001}</span>
                    <span>{0.005}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 my-4">
                  <Switch
                    checked={captioning}
                    onCheckedChange={setCaptioning}
                  />
                  <span>Captioning</span>
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleCreate} disabled={!file}>
            {isLoading && <Loader2 className="animate-spin size-4 mr-2" />}
            Create
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <div className="w-full lg:w-1/2">
        <h2 className="text-xl mb-4 font-semibold text-center">Meine GPTs</h2>
        {error && <p className="text-red-500">Failed to load finetunes.</p>}
        {isLoading && (
          <div className="flex justify-center items-center mt-10">
            <Loader2 className="animate-spin size-4 mr-2" />
            Loading finetunes...
          </div>
        )}
        {data?.finetunes?.length === 0 && <p>No finetunes yet.</p>}
        <div className="grid grid-cols-1 gap-4 mx-auto">
          {/* Mostrar skeleton si hay un finetune en creación */}
          {creatingFinetune && <FinetuneSkeleton />}

          {/* Lista de finetunes existentes */}
          {data?.finetunes?.map((ft: any) => (
            <Card
              key={ft.id}
              className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg mb-4 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="px-4 py-2 bg-gray-100 dark:bg-zinc-900 rounded-t-lg flex justify-between">
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {ft.finetune_comment || "Untitled Finetune"}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ID: {ft.id}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600"
                >
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Trash2 className="h-5 w-5 cursor-pointer" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your finetune and remove its data from our
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(ft.id)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </Button>
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-200">
                  <div className="space-y-1">
                    <p>
                      <strong>Mode:</strong> {ft.mode}
                    </p>
                    <p>
                      <strong>Trigger:</strong> {ft.trigger_word}
                    </p>
                    <p>
                      <strong>Iterations:</strong> {ft.iterations}
                    </p>
                    <p>
                      <strong>LoRA Rank:</strong> {ft.lora_rank}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p>
                      <strong>Learning Rate:</strong> {ft.learning_rate}
                    </p>
                    <p>
                      <strong>Priority:</strong> {ft.priority}
                    </p>
                    <p>
                      <strong>Type:</strong> {ft.finetune_type}
                    </p>
                    <p>
                      <strong>Timestamp:</strong>{" "}
                      {new Date(ft.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>

              {/* Footer con botón de acción */}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
