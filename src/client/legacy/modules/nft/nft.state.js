// ========================================
// NFT Playground - Gerenciamento de Estado
// ========================================

export function createState() {
  return {
    sessionCount: 0,
    lastTestTime: 0,
    currentTest: null,
    isRunning: false,
    cooldownEndTime: 0
  };
}
