"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getResultBySlug } from "@/lib/storage";
import { Gift, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SecretSantaResult() {
  const params = useParams();
  const slug = params.slug as string;
  const [secretSantaName, setSecretSantaName] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage after hydration to avoid hydration mismatch
  useEffect(() => {
    if (slug) {
      const result = getResultBySlug(slug);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSecretSantaName(result);
      setNotFound(!result);
    }
    setIsLoading(false);
  }, [slug]);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  // Show loading state during initial hydration to prevent mismatch
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-blue-50 p-3 sm:p-6 md:p-8">
        <div className="mx-auto max-w-2xl">
          <Card className="border-blue-200 bg-white/80 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-blue-500">
                <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl text-red-600">
                Amigo Secreto
              </CardTitle>
              <CardDescription className="text-base sm:text-lg">
                Carregando...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-blue-50 p-3 sm:p-6 md:p-8">
        <div className="mx-auto max-w-2xl">
          <Card className="border-red-200 bg-white/80 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl text-red-600">
                Resultado não encontrado
              </CardTitle>
              <CardDescription>
                Este link não está associado a nenhum sorteio válido.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button className="w-full bg-red-600 hover:bg-red-700 sm:w-auto">
                  Voltar para a página inicial
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-blue-50 p-3 sm:p-6 md:p-8">
      <div className="mx-auto max-w-2xl">
        <Card className="border-blue-200 bg-white/80 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-blue-500">
              <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl text-red-600">
              Amigo Secreto
            </CardTitle>
            <CardDescription className="text-base sm:text-lg">
              {!isRevealed
                ? "Clique no botão abaixo para revelar seu amigo secreto!"
                : "Aqui está o resultado do seu sorteio!"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isRevealed ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="rounded-full bg-amber-100 p-6 sm:p-8">
                  <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-red-600 animate-pulse" />
                </div>
                <Button
                  onClick={handleReveal}
                  className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white text-base sm:text-lg py-4 px-6 sm:py-6 sm:px-8"
                  size="lg"
                >
                  <Gift className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Revelar Amigo Secreto
                </Button>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-lg border-2 border-dashed border-blue-300 bg-gradient-to-br from-amber-50 to-blue-50 p-4 sm:p-6 md:p-8 text-center">
                  <p className="mb-2 text-xs sm:text-sm font-medium text-gray-600">
                    Seu amigo secreto é:
                  </p>
                  <p className="text-3xl font-bold text-red-600 sm:text-4xl md:text-5xl">
                    {secretSantaName}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      Voltar
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

