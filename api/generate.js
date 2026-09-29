const https = require('https');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, language, category, level, duration, focus, message } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: (language === 'pt' || language === 'pt-PT') 
        ? 'Chave API da OpenAI não configurada no servidor Vercel.' 
        : (language === 'es' ? 'Chave API da OpenAI não configurada no servidor Vercel.' : 'OpenAI API Key is not configured in Vercel environment variables.')
    });
  }

  let systemPrompt = "";
  let userPrompt = "";

  if (type === 'planner') {
    if (language === 'pt' || language === 'pt-PT') {
      systemPrompt = "És um treinador assistente de basquetebol de nível de elite (FIBA / NBA) especialista em planeamento tático e metodológico. Desenhas planos de treino hiper-estruturados, dinâmicos e eficientes. O teu tom é profissional, motivador e claro.";
      userPrompt = `Cria um plano de treino de basquetebol minuto a minuto com os seguintes parâmetros:
- Escalão da Equipa: ${category}
- Nível dos jogadores: ${level}
- Duração total: ${duration}
- Foco técnico da sessão: ${focus}

Instruções metodológicas importantes:
1. Divide o treino em secções lógicas (ex: Aquecimento, Parte Técnica, Parte Tática, Jogo/Competição e Retorno à Calma).
2. Para cada secção, indica o tempo exato (ex: 0-10 min) e detalha o que o treinador e os jogadores devem fazer.
3. Como o utilizador já possui o nosso produto principal de "+150 Exercícios de Basquetebol em Vídeo", integra pelo menos 1 ou 2 exercícios específicos dessa biblioteca correspondentes ao foco de hoje (Drible, Lançamento, Defesa, Passe, Agilidade) e menciona-os sob a forma: "(Utiliza o Exercício X do catálogo de vídeos na tua área de membros)".
4. O plano de treino completo deve ser respondido integralmente em Português de Portugal.`;
    } else if (language === 'es') {
      systemPrompt = "Eres un entrenador asistente de baloncesto de nivel élite (FIBA / NBA) experto en planificación táctica y metodológica. Diseñas planes de entrenamiento hiper-estructurados, dinámicos y eficientes. Tu tono es profesional, motivador y claro.";
      userPrompt = `Crea un plan de entrenamiento de baloncesto minuto a minuto con los siguientes parámetros:
- Categoría del Equipo: ${category}
- Nivel de los jugadores: ${level}
- Duración total: ${duration}
- Foco técnico de la sesión: ${focus}

Instrucciones metodológicas importantes:
1. Divide el entrenamiento en secciones lógicas (ej: Calentamiento, Parte Técnica, Parte Táctica, Juego/Competición y Vuelta a la Calma).
2. Para cada sección, indica el tiempo exacto (ej: 0-10 min) y detalla detalladamente qué debe hacer el entrenador y qué deben hacer los jugadores.
3. Como el usuario ya posee nuestro producto principal de "+150 Ejercicios de Baloncesto en Video", integra al menos 1 o 2 ejercicios específicos de esa biblioteca que correspondan al foco de hoy (Drible, Tiro, Defensa, Pase, Agilidad) y menciónalos de la forma: "(Utiliza el Ejercicio X del catálogo de videos de tu área de miembros)".
4. El plan de entrenamiento completo debe responderse en español.`;
    } else if (language === 'fr') {
      systemPrompt = "Vous êtes un entraîneur adjoint de basket-ball de niveau élite (FIBA / NBA) expert en planification tactique et méthodologique. Vous concevez des plans d'entraînement hyper-structurés, dynamiques et efficaces. Votre ton est professionnel, encourageant et clair.";
      userPrompt = `Créez un plan d'entraînement de basket-ball minute par minute avec les paramètres suivants :
- Catégorie d'Équipe : ${category}
- Niveau des joueurs : ${level}
- Durée totale : ${duration}
- Objectif technique de la séance : ${focus}

Instructions méthodologiques importantes :
1. Divisez l'entraînement en sections logiques (ex : Échauffement, Partie Technique, Travail Tactique, Match d'entraînement/Compétition, et Retour au calme).
2. Pour chaque section, indiquez la durée exacte (ex : 0-10 min) et détaillez ce que l'entraîneur et les joueurs doivent faire.
3. Comme l'utilisateur possède déjà notre produit principal "+150 Exercices de Basket en Vidéo", intégrez au moins 1 ou 2 exercices spécifiques de cette bibliothèque correspondant à l'objectif d'aujourd'hui (Dribble, Tir, Défense, Passe, Agilité) et mentionnez-les sous la forme : "(Utilisez l'Exercice X du catalogue de vidéos dans votre espace membres)".
4. L'intégralité du plan d'entraînement doit être rédigée en français.`;
    } else {
      systemPrompt = "You are an elite basketball assistant coach (FIBA / NBA level) expert in tactical and methodological practice planning. You design hyper-structured, dynamic, and efficient practice plans. Your tone is professional, encouraging, and clear.";
      userPrompt = `Create a minute-by-minute basketball practice plan with the following parameters:
- Team Category: ${category}
- Players' Level: ${level}
- Total Duration: ${duration}
- Technical Focus of the session: ${focus}

Important methodological instructions:
1. Divide the practice into logical sections (e.g., Warm-up, Technical Drills, Tactical Work, Scrimmage/Competition, and Cool-down).
2. For each section, indicate the exact time frame (e.g., 0-10 min) and detail what the coach and players must do.
3. Since the user already owns our main "+150 Basketball Drills in Video" product, integrate at least 1 or 2 specific drills from that library matching today's focus (Dribbling, Shooting, Defense, Passing, Agility) and reference them as: "(Use Drill X from the video catalog in your members area)".
4. The entire practice plan must be in English.`;
    }
  } else {
    // Chat Mode
    if (language === 'pt' || language === 'pt-PT') {
      systemPrompt = "És um treinador de basquetebol especialista em tática, quadros de jogo e preparação física. Ajudas treinadores com conselhos práticos, jogadas ensaiadas, saídas de pressão e correções técnicas de exercícios. Responde sempre em Português de Portugal e mantém as tuas explicações claras e aplicáveis no pavilhão.";
      userPrompt = message;
    } else if (language === 'es') {
      systemPrompt = "Eres un entrenador de baloncesto experto en táctica, pizarra y preparación física. Ayudas a los entrenadores con consejos prácticos, jugadas de pizarra ensayadas, salidas de presión y correcciones técnicas de ejercicios. Responde siempre en español y mantén tus explicaciones claras y aplicables en cancha.";
      userPrompt = message;
    } else if (language === 'fr') {
      systemPrompt = "Vous êtes un entraîneur de basket-ball expert en tactique, schémas de jeu et préparation physique. Vous aidez les entraîneurs avec des conseils pratiques, des systèmes sur tableau noir, des sorties de presse et des corrections techniques d'exercices. Répondez toujours en français et gardez vos explications claires et applicables sur le terrain.";
      userPrompt = message;
    } else {
      systemPrompt = "You are an expert basketball coach specialized in tactics, plays, and athletic conditioning. You help coaches with practical tips, blackboard set plays, press breaks, and technical skill corrections. Always reply in English and keep your explanations clear, concise, and ready to apply on court.";
      userPrompt = message;
    }
  }

  const postData = JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7
  });

  const options = {
    hostname: 'api.openai.com',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const reqApi = https.request(options, (resApi) => {
    let responseBody = '';
    resApi.on('data', (chunk) => { responseBody += chunk; });
    resApi.on('end', () => {
      try {
        const json = JSON.parse(responseBody);
        if (json.error) {
          return res.status(400).json({ error: json.error.message || 'OpenAI API Error' });
        }
        const text = json.choices && json.choices[0] && json.choices[0].message ? json.choices[0].message.content : '';
        return res.status(200).json({ result: text });
      } catch (e) {
        return res.status(500).json({ error: 'Failed to parse OpenAI response' });
      }
    });
  });

  reqApi.on('error', (e) => {
    res.status(500).json({ error: e.message || 'API Request failed' });
  });

  reqApi.write(postData);
  reqApi.end();
};
