/**
 * Fonte única do segredo JWT.
 *
 * Por quê: havia fallback hardcoded em dois arquivos — em produção, sem
 * JWT_SECRET no ambiente, qualquer pessoa conseguiria forjar tokens válidos.
 * Agora a aplicação se recusa a subir sem o segredo configurado.
 */
export function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 16) {
    throw new Error(
      'JWT_SECRET ausente ou muito curto (mínimo 16 caracteres). ' +
        'Configure no .env antes de iniciar a API.',
    );
  }
  return secret;
}
