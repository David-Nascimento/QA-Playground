/**
 * Script auxiliar para iniciar a API
 * Aguarda a compilação do TypeScript antes de iniciar
 * Reinicia automaticamente quando o arquivo é recompilado (watch mode)
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Saída do tsconfig.server.json
const API_JS_PATH = path.join(__dirname, '..', '..', 'dist', 'server', 'server', 'dev.js');
const MAX_WAIT_TIME = 30000; // 30 segundos
const CHECK_INTERVAL = 500; // 500ms

let apiProcess = null;

function waitForFile(filePath, maxWait, interval) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkFile = () => {
      if (fs.existsSync(filePath)) {
        resolve();
      } else if (Date.now() - startTime > maxWait) {
        reject(new Error(`Timeout: Arquivo ${filePath} não foi criado em ${maxWait}ms`));
      } else {
        setTimeout(checkFile, interval);
      }
    };
    
    checkFile();
  });
}

function startAPIProcess() {
  if (apiProcess) {
    console.log('🔄 Reiniciando API...');
    apiProcess.kill();
    apiProcess = null;
  }
  
  // Aguarda um pouco antes de reiniciar
  setTimeout(() => {
    apiProcess = spawn('node', [API_JS_PATH], {
      stdio: 'inherit',
      shell: true,
    });
    
    apiProcess.on('error', (error) => {
      console.error('❌ Erro ao iniciar API:', error);
    });
    
    apiProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`❌ API encerrou com código ${code}`);
      }
      apiProcess = null;
    });
  }, 500);
}

async function startAPI() {
  try {
    // Aguarda o arquivo compilado existir
    if (!fs.existsSync(API_JS_PATH)) {
      console.log('⏳ Aguardando compilação da API...');
      await waitForFile(API_JS_PATH, MAX_WAIT_TIME, CHECK_INTERVAL);
    }
    
    // Inicia o servidor Node.js
    console.log('🚀 Iniciando API...');
    startAPIProcess();
    
    // Monitora mudanças no arquivo compilado (para watch mode)
    let lastModified = fs.existsSync(API_JS_PATH) 
      ? fs.statSync(API_JS_PATH).mtimeMs 
      : 0;
    
    setInterval(() => {
      if (fs.existsSync(API_JS_PATH)) {
        const currentModified = fs.statSync(API_JS_PATH).mtimeMs;
        if (currentModified > lastModified) {
          lastModified = currentModified;
          startAPIProcess();
        }
      }
    }, 1000); // Verifica a cada 1 segundo
    
    // Mantém o processo rodando
    process.on('SIGINT', () => {
      if (apiProcess) {
        apiProcess.kill();
      }
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      if (apiProcess) {
        apiProcess.kill();
      }
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

startAPI();
