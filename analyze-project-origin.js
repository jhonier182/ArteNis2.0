#!/usr/bin/env node

/**
 * Script para analizar todo el proyecto ArteNis2.0 y determinar el porcentaje de código humano vs IA
 */

const fs = require('fs');
const path = require('path');

// Patrones que indican código generado por IA
const aiPatterns = {
  // Comentarios muy detallados con ejemplos
  detailedComments: /\/\*[\s\S]*?EJEMPLO DE USO[\s\S]*?\*\//g,
  // Comentarios de documentación extensos
  extensiveDocs: /\/\*\*[\s\S]*?\*\//g,
  // Interfaces muy completas con muchas propiedades opcionales
  comprehensiveInterfaces: /interface\s+\w+\s*\{[\s\S]*?\?\s*:\s*\w+[\s\S]*?\}/g,
  // Manejo de errores muy específico
  specificErrorHandling: /if\s*\(\s*error\.message\.includes\(/g,
  // Uso de patrones de "mejor práctica" muy consistentes
  bestPracticePatterns: /useState|useEffect|useCallback|useMemo/g,
  // Nombres de variables muy descriptivos
  descriptiveNames: /\b[a-z]+[A-Z][a-zA-Z]*\b/g,
  // Comentarios explicativos muy detallados
  explanatoryComments: /\/\/\s*[A-Z][^.]*\./g,
  // Manejo de transacciones complejas
  complexTransactions: /sequelize\.transaction\(/g,
  // Patrones de retry con backoff
  retryPatterns: /maxRetries|backoff|exponential/g,
  // Comentarios de características
  featureComments: /CARACTERÍSTICAS:|PATRÓN DE TAMAÑOS:|RESULTADO:/g
};

// Patrones que indican código humano
const humanPatterns = {
  // Comentarios informales
  informalComments: /\/\/\s*(TODO|FIXME|HACK|NOTE|console\.log)/i,
  // Console.logs de debug
  debugLogs: /console\.(log|warn|error|info)/g,
  // Código comentado (típico de desarrollo humano)
  commentedCode: /\/\/\s*[a-zA-Z]/g,
  // Nombres de variables más cortos o abreviados
  shortNames: /\b[a-z]{1,3}\b/g,
  // Typos en comentarios o strings
  typos: /(paddinhorizotal|actualizacion|intentalo|refrescando|refrescar)/i,
  // Comentarios específicos del proyecto
  projectSpecificComments: /(ArteNis|tatuaje|tatuador|artista)/i,
  // Manejo de errores más simple
  simpleErrorHandling: /catch\s*\(\s*error\s*\)\s*\{[\s\S]*?console\.error/g,
  // Comentarios de desarrollo
  devComments: /\/\/\s*(Solo|Solo obtener|Delay|Evitar|No fallar)/i,
  // Mensajes de commit informales (en comentarios)
  commitMessages: /(Cambio|actualizacion|Refactoriza|Actualiza)/i
};

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const analysis = {
      file: filePath,
      aiScore: 0,
      humanScore: 0,
      indicators: {
        ai: [],
        human: []
      },
      lines: content.split('\n').length
    };

    // Analizar patrones de IA
    for (const [patternName, pattern] of Object.entries(aiPatterns)) {
      const matches = content.match(pattern);
      if (matches) {
        analysis.aiScore += matches.length;
        analysis.indicators.ai.push(`${patternName}: ${matches.length} coincidencias`);
      }
    }

    // Analizar patrones humanos
    for (const [patternName, pattern] of Object.entries(humanPatterns)) {
      const matches = content.match(pattern);
      if (matches) {
        analysis.humanScore += matches.length;
        analysis.indicators.human.push(`${patternName}: ${matches.length} coincidencias`);
      }
    }

    // Calcular porcentaje
    const totalScore = analysis.aiScore + analysis.humanScore;
    if (totalScore > 0) {
      analysis.aiPercentage = Math.round((analysis.aiScore / totalScore) * 100);
      analysis.humanPercentage = Math.round((analysis.humanScore / totalScore) * 100);
    } else {
      analysis.aiPercentage = 50;
      analysis.humanPercentage = 50;
    }

    return analysis;
  } catch (error) {
    console.error(`Error analizando ${filePath}:`, error.message);
    return null;
  }
}

function getAllFiles(dir, extensions = ['.js', '.ts', '.tsx', '.jsx']) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Saltar node_modules y otros directorios irrelevantes
        if (!['node_modules', '.git', 'logs', 'dist', 'build'].includes(item)) {
          files = files.concat(getAllFiles(fullPath, extensions));
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignorar errores de directorios inaccesibles
  }
  
  return files;
}

function main() {
  console.log('🔍 ANALIZANDO PROYECTO ARTENIS2.0');
  console.log('================================\n');

  // Obtener todos los archivos del proyecto
  const frontendFiles = getAllFiles('./Frontend');
  const backendFiles = getAllFiles('./Backend');
  const allFiles = [...frontendFiles, ...backendFiles];

  console.log(`📁 Archivos encontrados: ${allFiles.length}`);
  console.log(`   - Frontend: ${frontendFiles.length}`);
  console.log(`   - Backend: ${backendFiles.length}\n`);

  let totalAnalysis = {
    totalFiles: 0,
    totalLines: 0,
    totalAiScore: 0,
    totalHumanScore: 0,
    files: []
  };

  // Analizar cada archivo
  for (const file of allFiles) {
    const analysis = analyzeFile(file);
    if (analysis) {
      totalAnalysis.totalFiles++;
      totalAnalysis.totalLines += analysis.lines;
      totalAnalysis.totalAiScore += analysis.aiScore;
      totalAnalysis.totalHumanScore += analysis.humanScore;
      totalAnalysis.files.push(analysis);
    }
  }

  // Calcular porcentajes totales
  const totalScore = totalAnalysis.totalAiScore + totalAnalysis.totalHumanScore;
  const aiPercentage = totalScore > 0 ? Math.round((totalAnalysis.totalAiScore / totalScore) * 100) : 50;
  const humanPercentage = totalScore > 0 ? Math.round((totalAnalysis.totalHumanScore / totalScore) * 100) : 50;

  console.log('📊 RESULTADOS GENERALES');
  console.log('======================');
  console.log(`📁 Total de archivos analizados: ${totalAnalysis.totalFiles}`);
  console.log(`📝 Total de líneas de código: ${totalAnalysis.totalLines.toLocaleString()}`);
  console.log(`🤖 Puntuación total IA: ${totalAnalysis.totalAiScore}`);
  console.log(`👤 Puntuación total Humano: ${totalAnalysis.totalHumanScore}`);
  console.log(`📊 Probabilidad IA: ${aiPercentage}%`);
  console.log(`📊 Probabilidad Humano: ${humanPercentage}%\n`);

  // Análisis por categorías
  console.log('📋 ANÁLISIS POR CATEGORÍAS');
  console.log('==========================');

  // Frontend vs Backend
  const frontendAnalysis = totalAnalysis.files.filter(f => f.file.includes('Frontend'));
  const backendAnalysis = totalAnalysis.files.filter(f => f.file.includes('Backend'));

  const frontendAiScore = frontendAnalysis.reduce((sum, f) => sum + f.aiScore, 0);
  const frontendHumanScore = frontendAnalysis.reduce((sum, f) => sum + f.humanScore, 0);
  const frontendTotal = frontendAiScore + frontendHumanScore;
  const frontendAiPercentage = frontendTotal > 0 ? Math.round((frontendAiScore / frontendTotal) * 100) : 50;

  const backendAiScore = backendAnalysis.reduce((sum, f) => sum + f.aiScore, 0);
  const backendHumanScore = backendAnalysis.reduce((sum, f) => sum + f.humanScore, 0);
  const backendTotal = backendAiScore + backendHumanScore;
  const backendAiPercentage = backendTotal > 0 ? Math.round((backendAiScore / backendTotal) * 100) : 50;

  console.log(`🎨 Frontend: ${frontendAiPercentage}% IA, ${100 - frontendAiPercentage}% Humano`);
  console.log(`⚙️  Backend: ${backendAiPercentage}% IA, ${100 - backendAiPercentage}% Humano\n`);

  // Top archivos con más indicadores de IA
  const topAiFiles = totalAnalysis.files
    .filter(f => f.aiScore > 0)
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 5);

  console.log('🤖 TOP 5 ARCHIVOS CON MÁS INDICADORES DE IA');
  console.log('==========================================');
  topAiFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file.file.replace('./', '')}`);
    console.log(`   IA: ${file.aiScore} puntos (${file.aiPercentage}%)`);
    console.log(`   Líneas: ${file.lines}`);
    if (file.indicators.ai.length > 0) {
      console.log(`   Indicadores: ${file.indicators.ai.slice(0, 3).join(', ')}`);
    }
    console.log('');
  });

  // Top archivos con más indicadores humanos
  const topHumanFiles = totalAnalysis.files
    .filter(f => f.humanScore > 0)
    .sort((a, b) => b.humanScore - a.humanScore)
    .slice(0, 5);

  console.log('👤 TOP 5 ARCHIVOS CON MÁS INDICADORES HUMANOS');
  console.log('============================================');
  topHumanFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file.file.replace('./', '')}`);
    console.log(`   Humano: ${file.humanScore} puntos (${file.humanPercentage}%)`);
    console.log(`   Líneas: ${file.lines}`);
    if (file.indicators.human.length > 0) {
      console.log(`   Indicadores: ${file.indicators.human.slice(0, 3).join(', ')}`);
    }
    console.log('');
  });

  // Conclusión final
  console.log('🎯 CONCLUSIÓN FINAL');
  console.log('==================');
  
  if (aiPercentage > 70) {
    console.log('🤖 El proyecto tiene un ALTO porcentaje de código generado por IA');
    console.log('   - Probablemente usaste herramientas como ChatGPT, Copilot, o similar');
    console.log('   - El código muestra patrones típicos de generación automática');
  } else if (humanPercentage > 70) {
    console.log('👤 El proyecto tiene un ALTO porcentaje de código escrito por humanos');
    console.log('   - Desarrollado principalmente por ti con posible ayuda ocasional de IA');
    console.log('   - Muestra patrones típicos de desarrollo manual');
  } else {
    console.log('🔄 El proyecto es una COMBINACIÓN de código humano y generado por IA');
    console.log('   - Probablemente usaste IA para partes específicas (componentes, servicios)');
    console.log('   - Y desarrollaste manualmente otras partes (configuración, ajustes)');
  }

  console.log(`\n📈 Estadísticas detalladas:`);
  console.log(`   - Archivos analizados: ${totalAnalysis.totalFiles}`);
  console.log(`   - Líneas de código: ${totalAnalysis.totalLines.toLocaleString()}`);
  console.log(`   - Puntuación IA: ${totalAnalysis.totalAiScore}`);
  console.log(`   - Puntuación Humano: ${totalAnalysis.totalHumanScore}`);
  console.log(`   - Porcentaje final: ${aiPercentage}% IA / ${humanPercentage}% Humano`);
}

//node analyze-project-origin.js

main();



