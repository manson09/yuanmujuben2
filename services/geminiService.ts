
import { GoogleGenAI } from "@google/genai";

/**
 * 指向性保护协议 (Directional Protection Protocol):
 * 1. 严格标签隔离：使用 XML 风格标签包裹不同性质的输入。
 * 2. 职责唯一性：明确原著是剧情的唯一来源，参考文件禁止贡献任何情节。
 */

export const generateStoryOutline = async (
  originalText: string,
  layoutRefText: string,
  styleRefText: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  
  const prompt = `
    你现在是一名专业的漫剧总编剧。你的任务是基于【原著小说内容】创作大纲。
    
    【输入指令 - 优先级声明】：
    1. <ORIGINAL_NOVEL> 标签内是【唯一剧情来源】。严禁从其他标签中提取任何人物、背景或事件。
    2. <STYLE_REFERENCE> 标签内仅用于【词汇与语气参考】。
    3. <LAYOUT_TEMPLATE> 标签内仅用于【排版符号参考】。

    <ORIGINAL_NOVEL>
    ${originalText}
    </ORIGINAL_NOVEL>

    <STYLE_REFERENCE>
    ${styleRefText || '无特定的文笔参考，请保持人类化的爽剧叙事感。'}
    </STYLE_REFERENCE>

    <LAYOUT_TEMPLATE>
    ${layoutRefText || '无特定排版模版。'}
    </LAYOUT_TEMPLATE>

    【创作要求】：
    - **逻辑溯源**：确保大纲中的每一个冲突和人物动机都直接源自 <ORIGINAL_NOVEL>。
    - **视觉克隆**：如果 <LAYOUT_TEMPLATE> 中使用了特殊的括号（如【】）或分段标记，请在输出中完整复刻。
    - **抗AI干扰**：保持语言的熵值，避免使用 AI 常用连接词（如“然而”、“因此”）。
    - **输出目标**：第一行建议集数（60-80集），后续为 2000-3000 字的深度大纲。

    请开始分析并生成。
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.85,
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });

  return response.text;
};

export const generateScriptSegment = async (
  batchIndex: number,
  mode: 'male' | 'female',
  originalText: string,
  outlineText: string,
  previousScripts: string,
  layoutRefText: string,
  styleRefText: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';

  const startEp = (batchIndex - 1) * 3 + 1;
  const endEp = batchIndex * 3;
  const contextHistory = previousScripts ? previousScripts.substring(previousScripts.length - 12000) : '无往期脚本';

  const prompt = `
    任务：编写动漫脚本 第 ${startEp} - ${endEp} 集。
    频道：${mode === 'male' ? '男频' : '女频'}

    【输入隔离与职责（严格执行）】：
    - <ORIGINAL_SOURCE>：提供本集的核心细节。
    - <STORY_OUTLINE>：提供剧情走向框架。
    - <PREVIOUS_CONTEXT>：提供上下文衔接状态，第 ${startEp} 集开头必须与此内容末尾无缝连接。
    - <STYLE_AND_LAYOUT>：仅提供文笔韵味和排版格式参考，禁止从中提取剧情！

    <ORIGINAL_SOURCE>
    ${originalText.substring(0, 10000)}
    </ORIGINAL_SOURCE>

    <STORY_OUTLINE>
    ${outlineText}
    </STORY_OUTLINE>

    <PREVIOUS_CONTEXT>
    ${contextHistory}
    </PREVIOUS_CONTEXT>

    <STYLE_AND_LAYOUT>
    文笔风格：${styleRefText}
    排版模版：${layoutRefText}
    </STYLE_AND_LAYOUT>

    【脚本生成准则】：
    1. **上下文锚定**：分析 <PREVIOUS_CONTEXT> 最后一段的动作和对白，确保第 ${startEp} 集第一秒钟就是其后续。
    2. **剧情忠诚度**：所有台词和动作逻辑必须直接基于 <ORIGINAL_SOURCE>。
    3. **去AI痕迹**：禁止使用“随着时间的推移”、“他意识到”等描述性废话。多用动词，少用副词。
    4. **物理指纹**：严格复刻 <STYLE_AND_LAYOUT> 中的所有符号特征。

    输出中文纯文本脚本。
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      temperature: 0.9,
      topP: 0.95,
      thinkingConfig: { thinkingBudget: 5000 }
    }
  });

  return response.text;
};
