/**
 * Google Apps Script - API REST para Avaliação Diagnóstica de Educação Física
 * 
 * INSTRUÇÕES DE IMPLANTAÇÃO:
 * 
 * 1. Abra a planilha: https://docs.google.com/spreadsheets/d/1t7c3D8jYILSgXm6wEPlaE7eLJVC6IkApcneLmQTdHKw
 * 2. Vá em Extensões > Apps Script
 * 3. Cole todo o código abaixo no editor
 * 4. Clique em "Implantar" > "Nova implantação"
 * 5. Tipo: "App da Web"
 * 6. Executar como: "Eu" (sua conta)
 * 7. Quem pode acessar: "Qualquer pessoa"
 * 8. Copie a URL gerada
 * 9. No frontend, defina a variável de ambiente:
 *    VITE_APPS_SCRIPT_URL=<URL copiada>
 * 
 * A planilha deve ter as seguintes abas:
 * - PROFESSORES (id, email, nome)
 * - ALUNOS (ID_ALUNO, NOME, ESCOLA, TURMA, IDADE, SEXO)
 * - QUESTOES (ID_QUESTAO, COMPETENCIA, PERGUNTA, ALTERNATIVA_A, ALTERNATIVA_B, ALTERNATIVA_C, ALTERNATIVA_D, RESPOSTA_CORRETA)
 * - AVALIACOES (ID_AVALIACAO, DATA, ESCOLA, TURMA, PROFESSOR)
 * - RESPOSTAS (ID_ALUNO, ID_AVALIACAO, ID_QUESTAO, RESPOSTA, DATA_HORA)
 * - RESULTADOS (ID_ALUNO, ID_AVALIACAO, ACERTOS, ERROS, PERCENTUAL, NIVEL)
 */

const SPREADSHEET_ID = '1t7c3D8jYILSgXm6wEPlaE7eLJVC6IkApcneLmQTdHKw';

function getSheet(name) {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
}

function sheetToJson(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => h.toString().trim());
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch (action) {
      case 'getEscolas': {
        const avaliacoes = sheetToJson(getSheet('AVALIACOES'));
        const escolas = [...new Set(avaliacoes.map(a => a.ESCOLA))].filter(Boolean);
        return jsonResponse(escolas);
      }
      
      case 'getTurmas': {
        const escola = e.parameter.escola;
        const alunos = sheetToJson(getSheet('ALUNOS'));
        const turmas = [...new Set(alunos.filter(a => a.ESCOLA === escola).map(a => a.TURMA))].filter(Boolean);
        return jsonResponse(turmas);
      }
      
      case 'getAlunos': {
        const escola = e.parameter.escola;
        const turma = e.parameter.turma;
        const alunos = sheetToJson(getSheet('ALUNOS'));
        const filtered = alunos.filter(a => a.ESCOLA === escola && a.TURMA === turma);
        return jsonResponse(filtered);
      }
      
      case 'getAvaliacoes': {
        const escola = e.parameter.escola;
        const turma = e.parameter.turma;
        const avaliacoes = sheetToJson(getSheet('AVALIACOES'));
        const filtered = avaliacoes.filter(a => a.ESCOLA === escola && a.TURMA === turma);
        return jsonResponse(filtered);
      }
      
      case 'getQuestoes': {
        const questoes = sheetToJson(getSheet('QUESTOES'));
        return jsonResponse(questoes);
      }
      
      case 'getResultados': {
        const id_avaliacao = e.parameter.id_avaliacao;
        const resultados = sheetToJson(getSheet('RESULTADOS'));
        const alunos = sheetToJson(getSheet('ALUNOS'));
        const filtered = resultados
          .filter(r => r.ID_AVALIACAO === id_avaliacao)
          .map(r => {
            const aluno = alunos.find(a => a.ID_ALUNO === r.ID_ALUNO);
            return {
              ...r,
              nome_aluno: aluno ? aluno.NOME : 'Desconhecido',
              turma: aluno ? aluno.TURMA : ''
            };
          });
        return jsonResponse(filtered);
      }
      
      case 'getResultadoAluno': {
        const id_aluno = e.parameter.id_aluno;
        const id_avaliacao = e.parameter.id_avaliacao;
        const resultados = sheetToJson(getSheet('RESULTADOS'));
        const alunos = sheetToJson(getSheet('ALUNOS'));
        const r = resultados.find(r => r.ID_ALUNO === id_aluno && r.ID_AVALIACAO === id_avaliacao);
        if (!r) return jsonResponse(null);
        const aluno = alunos.find(a => a.ID_ALUNO === id_aluno);
        return jsonResponse({ ...r, nome_aluno: aluno?.NOME, turma: aluno?.TURMA });
      }
      
      default:
        return jsonResponse({ error: 'Ação não reconhecida' });
    }
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    
    switch (action) {
      case 'submitRespostas': {
        const { id_aluno, id_avaliacao, respostas } = body;
        const questoes = sheetToJson(getSheet('QUESTOES'));
        
        // Check for duplicate submission
        const existingResultados = sheetToJson(getSheet('RESULTADOS'));
        const alreadySubmitted = existingResultados.find(
          r => r.ID_ALUNO === id_aluno && r.ID_AVALIACAO === id_avaliacao
        );
        if (alreadySubmitted) {
          return jsonResponse({ error: 'Avaliação já enviada anteriormente.' });
        }
        
        // Save responses
        const respostasSheet = getSheet('RESPOSTAS');
        const dataHora = new Date().toISOString();
        respostas.forEach(r => {
          respostasSheet.appendRow([id_aluno, id_avaliacao, r.id_questao, r.resposta, dataHora]);
        });
        
        // Calculate results
        let acertos = 0;
        const correcao = respostas.map(r => {
          const q = questoes.find(q => q.ID_QUESTAO === r.id_questao);
          const acertou = q && q.RESPOSTA_CORRETA === r.resposta;
          if (acertou) acertos++;
          return {
            id_questao: r.id_questao,
            pergunta: q ? q.PERGUNTA : '',
            resposta_aluno: r.resposta,
            resposta_correta: q ? q.RESPOSTA_CORRETA : '',
            acertou: !!acertou
          };
        });
        
        const total = respostas.length;
        const erros = total - acertos;
        const percentual = Math.round((acertos / total) * 100);
        
        let nivel = 'Abaixo do Básico';
        if (percentual >= 80) nivel = 'Avançado';
        else if (percentual >= 60) nivel = 'Intermediário';
        else if (percentual >= 40) nivel = 'Básico';
        
        // Save result
        const resultadosSheet = getSheet('RESULTADOS');
        resultadosSheet.appendRow([id_aluno, id_avaliacao, acertos, erros, percentual, nivel]);
        
        const resultado = { id_aluno, id_avaliacao, acertos, erros, percentual, nivel };
        return jsonResponse({ resultado, correcao });
      }
      
      default:
        return jsonResponse({ error: 'Ação não reconhecida' });
    }
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}
