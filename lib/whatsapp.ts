/**
 * Gera um link do WhatsApp com mensagem pré-formatada
 */
export function generateWhatsAppLink(
  phone: string,
  message: string
): string {
  // Remove caracteres não numéricos do telefone
  const cleanPhone = phone.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Gera a mensagem para enviar via WhatsApp
 */
export function generateWhatsAppMessage(
  participantName: string,
  secretSantaName: string,
  link: string
): string {
  return `Olá ${participantName}!\n\nSeja bem vindo ao nosso Amigo Secreto 2025.\n\nAcesse seu resultado: ${link}`;
}

