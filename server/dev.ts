/**
 * Servidor local da API mock (npm run dev:api).
 */
import app from './app';

const PORT = Number(process.env.API_PORT) || 3001;

app.listen(PORT, () => {
  console.log(`🚀 QA Playground API Mock rodando na porta ${PORT}`);
  console.log(`📚 Documentação: http://localhost:${PORT}/api`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});
