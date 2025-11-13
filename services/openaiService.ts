
import OpenAI from 'openai';
import { Project, CriticalPathResult, TaskStatus } from '../types';

const API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

if (!API_KEY) {
  console.warn("A variável de ambiente OPENAI_API_KEY não foi definida. Os recursos de IA serão desativados.");
}

const openai = API_KEY ? new OpenAI({ apiKey: API_KEY, dangerouslyAllowBrowser: true }) : null;

// Helper para tentar novamente as chamadas de API com um simples backoff
const withRetry = async <T>(apiCall: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
    let lastError: any;
    for (let i = 0; i < retries; i++) {
        try {
            return await apiCall();
        } catch (error) {
            lastError = error;
            console.warn(`Tentativa de chamada da API ${i + 1}/${retries} falhou. Tentando novamente em ${delay * (i + 1)}ms...`, error);
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delay * (i + 1)));
            }
        }
    }
    console.error("A chamada da API falhou após todas as tentativas.", lastError);
    if (lastError && lastError.toString().includes('500')) {
         throw new Error("O serviço de IA está com instabilidade temporária (erro 500). Por favor, tente novamente mais tarde.");
    }
    throw lastError;
};

export const analyzeRisksAndOpportunities = async (projects: Project[]): Promise<string> => {
    if (!openai) return "Chave da API OpenAI não configurada. A análise está indisponível.";

    const projectDataSummary = projects.map(p => {
        const overdueTasks = p.tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== TaskStatus.Done).length;
        const clientLabel = p.clientName ? `Cliente: ${p.clientName}.` : 'Cliente não informado.';
        return `- Projeto "${p.name}": ${p.tasks.length} tarefas, ${overdueTasks} tarefas atrasadas. ${clientLabel}`;
    }).join('\n');

    const prompt = `
    Como um gerente de projetos sênior, analise o seguinte resumo de dados de projetos.
    Identifique os 2-3 riscos mais significativos e potenciais oportunidades.
    Seja conciso e forneça insights acionáveis em formato de lista markdown.

    Dados dos Projetos:
    ${projectDataSummary}
    `;
    
    const apiCall = async () => {
        const response = await openai!.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        });
        return response.choices[0]?.message?.content || 'Sem resposta da IA.';
    };

    try {
        const response = await withRetry<string>(apiCall);
        return response;
    } catch (error) {
        console.error("Erro final ao analisar riscos com OpenAI:", error);
        throw error instanceof Error ? error : new Error("Falha ao obter análise da OpenAI.");
    }
};


export const getCriticalPathInsights = async (project: Project, criticalPath: CriticalPathResult): Promise<string> => {
    if (!openai) return "Chave da API OpenAI não configurada. Insights indisponíveis.";

    const pathTasks = criticalPath.path
        .map(taskId => project.tasks.find(t => t.id === taskId))
        .filter(Boolean);

    const pathSummary = pathTasks.map(task => 
        `- ${task?.name} (Duração: ${task?.duration} dias, Vencimento: ${task?.dueDate}, Responsável: ${task?.assignee?.name || 'Não atribuído'})`
    ).join('\n');

    const prompt = `
    Você é um gerente de projetos especialista. O caminho crítico para o projeto "${project.name}" foi calculado.
    A duração total deste caminho é de ${criticalPath.duration} dias.
    As tarefas neste caminho são:
    ${pathSummary}

    Com base nesta informação, forneça conselhos breves e acionáveis para manter o projeto nos trilhos.
    Foque em possíveis gargalos e gerenciamento de recursos para estas tarefas específicas.
    Formate sua resposta como um parágrafo curto.
    `;

    const apiCall = async () => {
        const response = await openai!.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        });
        return response.choices[0]?.message?.content || 'Sem resposta da IA.';
    };

    try {
        const response = await withRetry<string>(apiCall);
        return response;
    } catch (error) {
        console.error("Erro final ao obter insights do caminho crítico com OpenAI:", error);
        throw error instanceof Error ? error : new Error("Falha ao obter insights da OpenAI.");
    }
};
