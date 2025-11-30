"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateSlug, generateSecretSanta } from "@/lib/drawing";
import { saveSecretSantaData, getSecretSantaData, clearSecretSantaData, type Participant } from "@/lib/storage";
import { generateWhatsAppLink, generateWhatsAppMessage } from "@/lib/whatsapp";
import { Share2, Plus, Trash2, Gift } from "lucide-react";

export default function Home() {
  // Initialize all state with default values to ensure consistent SSR
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentName, setCurrentName] = useState("");
  const [currentPhone, setCurrentPhone] = useState("");
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const [drawDate, setDrawDate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load data from server after hydration to avoid hydration mismatch
  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await getSecretSantaData();
        if (saved) {
          setParticipants(saved.participants ?? []);
          setResults(saved.results ?? null);
          setDrawDate(saved.drawDate ?? null);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
        setMounted(true);
      }
    };

    loadData();
  }, []);

  const addParticipant = () => {
    if (currentName.trim() && currentPhone.trim()) {
      const newParticipant: Participant = {
        name: currentName.trim(),
        phone: currentPhone.trim(),
        slug: generateSlug(currentName.trim()),
      };
      setParticipants([...participants, newParticipant]);
      setCurrentName("");
      setCurrentPhone("");
    }
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
    // Limpar resultados se houver
    if (results) {
      setResults(null);
      setDrawDate(null);
    }
  };

  const performDraw = async () => {
    if (participants.length < 2) {
      alert("É necessário pelo menos 2 participantes para realizar o sorteio!");
      return;
    }

    setIsSaving(true);
    try {
      const drawResults = generateSecretSanta(participants);
      const now = Date.now();
      
      setResults(drawResults);
      setDrawDate(now);

      // Salvar no servidor
      await saveSecretSantaData({
        participants,
        results: drawResults,
        drawDate: now,
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao realizar sorteio");
      // Revert state on error
      setResults(null);
      setDrawDate(null);
    } finally {
      setIsSaving(false);
    }
  };

  const getParticipantLink = (slug: string) => {
    // Only use full URL after component has mounted to ensure consistent hydration
    if (mounted && typeof window !== "undefined" && window.location) {
      return `${window.location.origin}/${slug}`;
    }
    // Return relative path during SSR and initial render for consistent hydration
    return `/${slug}`;
  };

  const shareViaWhatsApp = (participant: Participant, secretSantaName: string) => {
    const link = getParticipantLink(participant.slug);
    const message = generateWhatsAppMessage(participant.name, secretSantaName, link);
    const whatsappUrl = generateWhatsAppLink(participant.phone, message);
    window.open(whatsappUrl, "_blank");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addParticipant();
    }
  };

  // Show loading state during initial hydration to prevent mismatch
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-blue-50 p-3 sm:p-6 md:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-red-600 sm:text-4xl md:text-5xl">
              🎁 Amigo Secreto
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Organize seu sorteio de forma fácil e divertida
            </p>
          </div>
          <Card className="mb-4 sm:mb-6 border-red-200 bg-white/80 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-red-600">Carregando...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-blue-50 p-3 sm:p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-red-600 sm:text-4xl md:text-5xl">
            🎁 Amigo Secreto
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Organize seu sorteio de forma fácil e divertida
          </p>
        </div>

        {!results ? (
          <Card className="mb-4 sm:mb-6 border-red-200 bg-white/80 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-red-600">Adicionar Participantes</CardTitle>
              <CardDescription>
                Adicione o nome e telefone de cada participante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-red-700">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Bruno Otávio"
                    value={currentName}
                    onChange={(e) => setCurrentName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="border-red-200 focus:border-red-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-red-700">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="Ex: 5511999999999"
                    value={currentPhone}
                    onChange={(e) => setCurrentPhone(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="border-red-200 focus:border-red-500"
                  />
                </div>
              </div>
              <Button
                onClick={addParticipant}
                className="w-full bg-red-600 hover:bg-red-700 sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Participante
              </Button>

              {participants.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="font-semibold text-red-600">
                    Participantes ({participants.length})
                  </h3>
                  <div className="space-y-2">
                    {participants.map((participant, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-red-200 bg-amber-50 p-3"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {participant.name}
                          </p>
                          <p className="text-sm text-gray-600">{participant.phone}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeParticipant(index)}
                          className="text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {participants.length >= 2 && (
                <Button
                  onClick={performDraw}
                  disabled={isSaving}
                  className="mt-6 w-full bg-blue-600 hover:bg-blue-700 sm:w-full"
                  size="lg"
                >
                  <Gift className="mr-2 h-5 w-5" />
                  {isSaving ? "Salvando..." : "Realizar Sorteio"}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <Card className="border-blue-200 bg-white/80 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl text-blue-600">
                  🎉 Sorteio Realizado!
                </CardTitle>
                <CardDescription>
                  {drawDate && !isLoading &&
                    `Realizado em ${new Date(drawDate).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {participants.map((participant) => {
                    const secretSanta = results[participant.slug];
                    const link = getParticipantLink(participant.slug);
                    return (
                      <div
                        key={participant.slug}
                        className="rounded-lg border border-blue-200 bg-amber-50 p-4"
                      >
                        <div className="mb-3">
                          <p className="font-semibold text-gray-900">
                            {participant.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 break-words">
                            Link:{" "}
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline break-all"
                            >
                              {link}
                            </a>
                          </p>
                        </div>
                        <Button
                          onClick={() => shareViaWhatsApp(participant, secretSanta)}
                          className="w-full bg-green-600 hover:bg-green-700 sm:w-auto"
                          size="sm"
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Enviar via WhatsApp
                        </Button>
                      </div>
                    );
                  })}
                </div>
                <Button
                  onClick={() => {
                    setResults(null);
                    setDrawDate(null);
                    setParticipants([]);
                    clearSecretSantaData();
                  }}
                  variant="outline"
                  className="mt-6 w-full border-red-300 text-red-600 hover:bg-red-50"
                >
                  Novo Sorteio
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
