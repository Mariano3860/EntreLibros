export async function generateReply(text: string): Promise<string> {
  const trimmed = text.trim().toLowerCase();
  if (trimmed.startsWith('hola') || trimmed.startsWith('hello')) {
    return '¡Hola! Soy el bot de EntreLibros.';
  }
  return `Recibí tu mensaje: ${text}`;
}
