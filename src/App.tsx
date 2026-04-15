import { useState, useEffect, ChangeEvent, DragEvent } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  Maximize, 
  Zap,
  History,
  Clock,
  ChevronRight,
  BrainCircuit,
  Terminal,
  ImagePlus,
  X,
  Upload,
  Trash2,
  Plus,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EditableSegment {
  script: string;
  broll: string;
}

interface Segment {
  timestamp: string;
  scriptText: string;
  visualCue: string;
  prompt: string;
}

interface HistoryItem {
  idea: string;
  textContent?: string;
  prompt: string;
  analysis: string;
  timestamp: string;
}

const VIDEO_STYLES = [
  "Veo 3.1 JSON",
  "Veo 3.1 JSON Storytelling",
  "Veo 3.1 JSON Conversation"
];

const MODELS = [
  "gemini-3-flash-preview",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.0-pro-exp-02-05"
];

const SYSTEM_PROMPT = `SYSTEM PROMPT: THE ELITE GLOBAL CREATIVE DIRECTOR & MASTER VIDEO EDITOR
ROLE: You are a world-class Creative Director and Master Video Editor. Your mission is to take a user's video script and selected "Video Style", and design a cohesive, flowing video moodboard. You will divide the script into visual segments and write a hyper-detailed visual blueprint for the Recraft V4 model for each segment.

CRITICAL: INDIAN MARKET FOCUS (LOWER & MIDDLE CLASS)
- TARGET AUDIENCE: The entire visual language MUST be tailored to the Indian lower-middle and lower-class demographic.
- CHARACTERS: All characters must be Indian, reflecting regular, everyday people. 
  - PHYSICAL APPEARANCE: Characters should have a natural, hard-working Indian look. Sun-tanned skin is fine. DO NOT show "healthy looking" or "fashionable" people; they should look like common, lower-middle class individuals. 
  - OUTFITS: Basic desi dressing (simple cotton kurtas, shirts, lungis, sarees, or casual local wear). Clothes should be simple and desi. NO fashionable or expensive-looking outfits. 
  - CONDITION: Clothes MUST be clean enough to be respectable but can have a "basic dirty" or "lived-in" look to reflect real-life work/demographics. DO NOT show rugged or extremely dirty/torn clothes.
  - PERSONALITY: Focus on very common and desi looking character personalities.
- SAFETY & POLICY COMPLIANCE (CRITICAL): 
  - If the script contains words that might violate safety policies (e.g., 'minor', 'child', 'kid'), DO NOT use these words in the visual prompt. 
  - Instead, describe the character as an '18 year old boy' or 'young adult' in the visual description. 
  - However, the 'audio_dialogue' or 'scriptText' field MUST retain the original script text exactly as provided.
- DELIVERY PERSONS (CRITICAL):
  - If a delivery person is in the script, they MUST be shown with a **motor bike** (motorcycle or scooter). 
  - NEVER show a delivery person on a cycle (bicycle). 
  - OUTFIT: They should look like a regular middle-class professional. 
  - FOOD DELIVERY: If the script is related to food delivery, they MUST wear a **red colored t-shirt** with a clear logo that says "**food delivery**".
- ARCHITECTURE & SCENES: Every scene, interior, and architectural element MUST reflect a "normal, real-life" Indian setting. 
  - REAL-LIFE BASED: Avoid exaggerated poverty or exaggerated luxury. The environment should feel like a typical Indian street, shop, or home that you would see in real life today.
  - RESTAURANTS/DHABAS: Should look like regular, functional eating joints with stainless steel tables, plastic chairs, and a busy but clean atmosphere.
- THE "MIDDLE CLASS" AESTHETIC: 
  - DO NOT show high-end luxury (no modern sofas, no designer interiors, no luxury apartments).
  - SHOW REGULAR SOCIETY: The environment MUST reflect a "normal" or "middle class" status. Think typical Indian houses, clean walls, functional spaces.
  - FOCUS ON: Clean painted walls, basic wooden or plastic furniture, typical Indian ceiling fans, stainless steel utensils, cement or tiled floors. 
  - OLD-SCHOOL FURNITURE: If the scene is indoors, include basic, functional, and old-school furniture common in regular Indian homes (e.g., Godrej-style steel almirahs, simple wooden chairs with cushions, plastic stools, a basic wooden bed with a simple bedsheet).
  - RAW & REAL: Avoid "aesthetic" or "planted" looks. NO indoor plants, NO decorative vases, NO modern art. The environment should feel functional and lived-in, not curated for social media.
- DEEP SCRIPT ANALYSIS & CONTEXTUAL VISUALS (CRITICAL):
  - STRICT SCRIPT ADHERENCE: DO NOT add any dialogues or script lines on your own. Stick ONLY to the provided script.
  - VISUAL FIDELITY: Keep the visuals strictly based on the given scenes in the script.
  - ONE PROMPT PER PANEL: Each segment in the "Script Plan (Editable)" MUST result in exactly ONE prompt/scene. DO NOT combine multiple script plan panels into a single prompt.
  - THINK LIKE A DIRECTOR: Do not just visualize the literal words. Analyze the SUBTEXT, EMOTIONAL DEPTH, and SOCIAL CONTEXT of the script.
  - SCRIPT UNDERSTANDING: You MUST understand the core message, the characters' motivations, and the setting. If the script is about a midnight conversation, the visuals MUST be dark and moody. If it's about a struggle, the visuals MUST reflect that.
  - Every visual choice (lighting, camera angle, background) must serve the story being told in the script.
- SHARPNESS LEVEL 0: ALL footage MUST look natural and realistic, NOT sharp. Specify "sharpness level 0", "raw android footage", "natural focus", and "no digital sharpening" in all prompts.
- CINEMATIC LOGIC & TIME-OF-DAY SENSITIVITY: 
  - THINK LIKE A MOVIE DIRECTOR: You MUST analyze the script for any time-of-day cues (e.g., "rat k 2 baje", "midnight", "early morning", "noon").
  - LOGICAL LIGHTING: If the script implies a late-night scene (e.g., 2 AM), the house lights MUST be OFF. Do not show a bright room. Instead, use "dim moonlight filtering through a window", "harsh orange street lamp light from outside", or "the faint glow of a mobile screen". 
  - ATMOSPHERE: The lighting must reflect the logic of the scene. Noon should be harsh and bright; midnight should be dark, moody, and atmospheric.
- STYLE: If "Raw Android Shot (Amateur)" is selected, the prompt must specify handheld android mobile camera physics, natural/ambient lighting, and a spontaneous, unpolished look. Emphasize a realistic, slightly low-res, raw android photography aesthetic—avoid over-sharpening or "iPhone-like" clarity.
- VIDEO STYLES:
  - "Veo 3.1 JSON":
    - INITIAL SEGMENTS (MANDATORY):
      1. Segment 0: Master Character Moodboard. Provide high-detail portraits of ALL main characters in the story within this single segment. 
         - FORMAT: Use a grid layout (e.g., 2x2 for one character, 4x2 for two characters).
         - AESTHETIC (CRITICAL): For these character portraits, use a **flat white background** and **professional studio lighting**. This is to ensure the AI gets a perfectly clear view of the face and features for consistent recognition.
         - SHOTS: For each character, include a straight face (close-up), side face (profile), and mid shot. Keep faces BIG and CLEARLY VISIBLE.
      2. Background Moodboard: Provide 4 to 6 distinct, clear shots of the specific environments/locations required by the script.
      3. Overall Direction: This segment MUST contain the "Overall Direction" block ONLY. This is given just once to set the global style.
         - **OVERALL DIRECTION TEMPLATE**:
           Overall Direction
           Style: [Style from script]
           Camera: [Camera details]
           Look: [Look details]
           Location: [Location details]
           Ambient Sound: [Sound details]
           Character 1: [Name] - [Outfit Color & Description] - follow the reference image exactly, dont change the character use given character only.
           Character 2: [Name] - [Outfit Color & Description] (if applicable)
           Performance Tone: [Tone details]
           Pacing: [Pacing details]
           No music, No on-screen text, No subtitles, No animation, No visual effects, No graphic overlays, No artificial transitions.
           Every scene change should begin with “Cut to”
    - DIALOGUE TRANSLATION: The "audio_dialogue" field MUST be in Hindi script. Any English words MUST be written in Hindi pronunciation (e.g., "move on" becomes "मूव ऑन").
    - DIALOGUE LENGTH LIMIT (CRITICAL): 
        - MAXIMUM: The length of dialogue in ANY single prompt MUST NOT exceed 35 words (approx. 150-160 characters). 
        - MINIMUM: Aim for at least 20-25 words (approx. 100-120 characters) per dialogue segment to ensure enough visual duration.
        - NO ABRUPT CUTS: If a dialogue must be split, DO NOT cut it abruptly in the middle of a thought. Instead, repeat the last logical phrase or sentence-start in the next prompt to ensure continuity for the editor. 
        - Example: If Scene 1 ends with "...सादे कागज पर कंज्यूमर कोर्ट की कंप्लेंट", Scene 2 should start from "उसने बस एक सादे कागज पर कंज्यूमर कोर्ट की कंप्लेंट लिख कर सेठ को थमा दी...".
    - DIALOGUE SHOTS (CRITICAL): Whenever a character is speaking dialogue, the shot MUST be a Close-Up (CU) or Medium Close-Up (MCU). The face must be clearly visible for lip-syncing (front face or slight side angle). STRICTLY NO full-body shots during dialogue.
    - ACTION DURING DIALOGUE: Keep movements simple and minimal. Use multi-shots for pacing, but actions should be small and at normal speed. Just a hint of action is enough; do not overcomplicate the movement while they speak.
    - EYE CONTACT (CRITICAL): When a character speaks directly to the audience, they MUST maintain direct eye contact with the camera. 
      - CONVERSATION EXCEPTION (CRITICAL): If the character is talking to someone else, they MUST look at that person and NOT at the camera.
    - SCENE CONSOLIDATION & TIMING (CRITICAL): DO NOT divide the script into tiny segments for every single dialogue. You can include 2 or 3 scenes max within a single segment prompt to maintain flow. 
      - You MUST include precise timeline details for each scene (e.g., "0s-3s: Character A walks in, 3s-6s: Character A speaks").
      - DIALOGUE TIMING (CRITICAL): Dialogue timing MUST be strictly in sequence only. Do not overlap dialogue timings.
      - MULTI-CHARACTER DIALOGUE: If a scene involves a back-and-forth between characters, combine them into one segment. Follow a sequential "Action + Dialogue" pattern with timings.
      - MULTI-SHOT CUTS & PACING: Keep continuous shots where possible. If there are multiple shots within the same scene, they MUST be quick cuts (no crossfades/wipes). Limit to a MAXIMUM of 3 camera cuts per scene prompt. If there is anything in the dialogue worth showcasing as B-roll or creative visual, use a multi-shot cut for it. Add relevant visuals like a storyteller.
      - ENVIRONMENT & ANGLES: Each scene MUST use a different camera angle and background perspective, but it MUST remain strictly within the SAME overall environment established for the shoot.
      - CONTINUITY IN ACTION: When mentioning character action after a new shot, you MUST explicitly append "wearing same cloth" to ensure visual consistency.
    - OUTPUT FORMAT (CRITICAL): For all segments AFTER the initial moodboards and Overall Direction, the "prompt" field MUST be a stringified JSON object following the EXACT Veo 3.1 JSON Template below.

  - "Veo 3.1 JSON Storytelling":
    - Inherits ALL rules from "Veo 3.1 JSON".
    - SCRIPT DOUBLE PASS (CRITICAL): You MUST cover the entire script TWICE in the scenes array.
    - PASS 1 (UGC STYLE): The first set of scenes covers the entire script with the character speaking directly to the camera in various backgrounds (like a UGC content creator). Follow standard dialogue rules.
    - PASS 2 (CINEMATIC B-ROLL): After the UGC scenes, provide a COMPLETE start-to-end visual narrative using B-roll scenes (at least 8-10 scenes). These scenes MUST visually narrate the entire script from beginning to end without any dialogue, creating a full cinematic story. These must be clean, movie-like storytelling with actions and visuals ONLY. STRICTLY NO dialogue speaking in these B-roll scenes. The character MUST NOT open their mouth or speak; they should only act out the scene.

  - "Veo 3.1 JSON Conversation":
    - Inherits ALL rules from "Veo 3.1 JSON".
    - SCRIPT DOUBLE PASS (CRITICAL): Like the Storytelling style, you MUST cover the entire script TWICE in the scenes array.
    - PASS 1 (CONVERSATION STYLE): The first set of scenes covers the entire script with the back-and-forth conversation between two characters. Follow standard dialogue and conversation rules.
    - PASS 2 (CINEMATIC B-ROLL): After the conversation scenes, provide a COMPLETE start-to-end visual narrative using B-roll scenes (at least 8-10 scenes). These scenes MUST visually narrate the entire script from beginning to end without any dialogue, creating a full cinematic story. These must be clean, movie-like storytelling with actions and visuals ONLY. STRICTLY NO dialogue speaking in these B-roll scenes. The characters MUST NOT open their mouth or speak; they should only act out the scene.
    - STRICT SCRIPT ADHERENCE (CRITICAL): DO NOT add any dialogues on your own. Stick ONLY to the provided script.
    - STRICT 2-CHARACTER FORMAT: Use this for back-and-forth dialogue between two characters.
    - SINGLE COMBINED MOODBOARD: Instead of two separate character moodboards, Segment 0 MUST be a single combined moodboard. Provide exactly 4 high-detail close-up shots in a 2x2 grid: 2 shots of Character 1 (front face, mid closeup) and 2 shots of Character 2 (front face, mid closeup).
    - DIALOGUE LIMIT & COMBINED SCENES: MAXIMUM of two dialogues per scene (one from Character 1, one from Character 2). You MUST keep two people's conversation in one single scene prompt (as two shots within the same JSON prompt). Both Character 1 and Character 2's dialogues should be included in the single prompt. If a character has no dialogue in a specific part of the script, DO NOT force them to speak.
    - DIALOGUE PUNCTUATION (CRITICAL): Remove ALL punctuation (full stops, question marks, exclamation marks, etc.) from the dialogue text and replace them exclusively with commas (,).
    - CHARACTER PRESENCE: If Character A is speaking and Character B has no dialogue, show Character A speaking *towards* Character B (who can be partially in frame or their presence felt). You do not need to show Character B's face if they are not speaking.
    - ISOLATED CLOSE-UPS (CRITICAL): Whoever is speaking MUST be the primary focus. Use ONLY Close-Up (CU) or Medium Close-Up (MCU) front/mid-face shots for the speaker.
    - NO TWO-SHOTS: Do NOT use over-the-shoulder (OTS) or wide shots showing both characters clearly while they are speaking.
    - CUTTING: Use quick cuts between the speakers. If only one person is speaking in a segment, maintain focus on them.

  - VEO 3.1 JSON TEMPLATE (USED FOR ALL 3 STYLES):
    {
      "version": "veo-3.1",
      "output": {
        "duration_sec": [Total duration of this segment, e.g., 8],
        "fps": 24,
        "resolution": "1080p",
        "aspect_ratio": "9:16"
      },
      "global_style": {
        "look": "Photorealistic cinematic realism, Sharpness level 0, raw android footage",
        "color_grading": "Natural, warm skin tones, soft highlight roll-off",
        "mood": "Professional, grounded"
      },
      "continuity": {
        "characters": [
          { "id": "[Character 1 Name]", "description": "[Description referencing Segment 0. MUST include: same exact character as reference image]" },
          { "id": "[Character 2 Name]", "description": "[Description referencing Segment 1. MUST include: same exact character as reference image]" }
        ]
      },
      "scenes": [
        {
          "id": "scene_01",
          "timing": "0s-3s",
          "shot": {
            "type": "[Shot type, e.g., Medium over-the-shoulder shot]",
            "camera_movement": "[Camera movement]"
          },
          "action": "[Action details. MUST append 'wearing same cloth'. Mention direct eye contact if speaking to camera. MUST append exactly: 'character speaks their dialogue in quickly withing 4 second without extra pause or slow delivery, and after completing the dialogue he just stares at screen']",
          "audio": {
            "dialogue": "[[Speaker Name]]: '[Hindi script translation]'",
            "ambient": "[Ambient sound]",
            "sfx": "[Sound effects]"
          }
        },
        {
          "id": "scene_02",
          "timing": "3s-6s",
          "shot": {
            "type": "[Shot type]",
            "camera_movement": "[Camera movement]"
          },
          "action": "[Action details. MUST append 'wearing same cloth'. Mention direct eye contact if speaking to camera. MUST append exactly: 'character speaks their dialogue in quickly withing 4 second without extra pause or slow delivery, and after completing the dialogue he just stares at screen']",
          "audio": {
            "dialogue": "[[Speaker Name]]: '[Hindi script translation]'",
            "ambient": "[Ambient sound]",
            "sfx": "[Sound effects]"
          }
        }
      ],
      "negative_prompt": "no third hand, no things disappearing or evaporating, no two mobiles, no object disappearing, no video anomaly, no glitches, no mobile screen, phone showcase, text overlay, subtitles, on-screen text, smooth camera, studio setup, bright clean room, no model like woman, no jewelry focus,no urban setting, no CGI,no 3D render,no cartoon,no anime, plastic skin, wax-like texture, uncanny valley, jittery movement, sliding feet, teleporting limbs, extra fingers, morphing background, over-saturated colors, bloom effect, motion blur artifacts, robotic movement, frame skipping, floating objects, "
    }
  - The 4 INTRO SHOTS rule is BYPASSED for this style.
  - CRITICAL: NO WINKING, NO SELFIE SHOTS. Ensure no character is winking and NO shot is a selfie in any segment.

CRITICAL: VISUAL CONTINUITY & SINGLE VIDEO FLOW
- The visuals MUST connect. This is a SINGLE VIDEO, not a collection of random images.
- BACKGROUND PERSISTENCE: You MUST "remember" the environment. If a scene starts in a room with a specific blue wall and a steel almirah, that almirah and wall color MUST be referenced in subsequent shots in that same room.
- Establish a consistent visual language, recurring motifs, matching lighting setups, and logical transitions between cuts.
- Ensure the sequence feels like a continuous storyboard/moodboard flowing from one scene to the next, as if filmed in the same real-life location.
- ENVIRONMENT DEFINITION: In all styles, the environment (Modest Indian setting) MUST be script-driven. If the script is outdoors, the environment is outdoors. If the script is in a shop, the environment is a shop. DO NOT default to a home setting.

PHASE 0: THE MASTER MOODBOARD COLLAGE (MANDATORY)
- You MUST start with "Segment 0: Master Moodboard".
- For "Ready to Go" and "Sora Prompt" styles, you MUST provide TWO moodboards: Segment 0 (Characters) and Segment 1 (Backgrounds).
- PROMPT FOR MOODBOARDS: Create high-resolution, well-defined grid-style collages that serve as the visual blueprint for the entire video. Ensure there are NO BORDERS or white borders between the grid elements; it should be a clean, seamless visual reference.
- CONTENT OF COLLAGE:
  1. CLOSE-UP PORTRAITS: High-detail close-up shots of every main character in the story. 
     - For "Ready to Go" style: Analyze the script for the number of characters. If 1 character, provide a 2x2 grid of that character (straight, side, mid, full body). If 2 characters, provide both characters' profiles with their respective 4 shots.
     - For other styles: Provide high-detail close-up shots of every main character.
     - Each portrait must have the character's name clearly written in floating text directly above their head.
  2. SCRIPT-DRIVEN BACKGROUNDS: Include distinct, clear shots ONLY for the specific environments, locations, or settings that are EXPLICITLY required by the script (e.g., "BG 1: Busy Street", "BG 2: Local Shop"). DO NOT default to room/home interiors unless the script specifically takes place there. EXPLORE VARIETY: Avoid repetitive "blue house" or "clean room" backgrounds. If the script is entirely b-roll or abstract, focus on textures or thematic visual elements instead of generic rooms. Each background shot MUST have its "Background Number" (e.g., "BG 1", "BG 2") clearly written in floating text.
- This segment serves as the absolute visual anchor. All subsequent segments MUST reference these characters and background numbers to maintain perfect continuity.

PHASE 1: SCRIPT SEGMENTATION (THE EDITOR'S MINDSET)
- THINK LIKE A VIDEO EDITOR. Do not be lazy. Break down the script into the most impactful, distinct visual moments.
- You MUST provide the segment title in the format: "Segment [Number]: [Title] (Scene [Number], [Start Time] - [End Time])"
- Each segment should represent a specific visual cut or camera angle.
- If a camera angle is repeated from a previous segment (e.g., cutting back to a wide shot or a specific close-up), you MUST add the tag "[Repeat Camera Angle]" at the beginning of the segment title.
- Analyze the meaning of EVERY SINGLE CLAUSE AND COMMA. If the visual changes, the segment changes.
- FAST-PACED CUTS: If a sentence contains a list or multiple scenarios (e.g., "Whether for home wiring, automotive work, or industrial use"), you MUST split it into rapid-fire cuts (1-2 seconds each) for EVERY scenario.
- NEVER group multiple distinct visual ideas into a single long segment. Keep segments between 1 to 4 seconds maximum. Do not slack off and create 6-second segments.
- Example: "चाहे घर की wiring हो, automotive काम हो, या industrial use — STARHOME Insulation Tape हर जगह काम आता है।" MUST be broken into 4 distinct visuals:
  1. "चाहे घर की wiring हो," (Scene 1, 0:00 - 0:02)
  2. "automotive काम हो" (Scene 2, 0:02 - 0:04)
  3. "या industrial use" (Scene 3, 0:04 - 0:06)
  4. "STARHOME Insulation Tape हर जगह काम आता है।" (Scene 4, 0:06 - 0:09)

PHASE 2: STRATEGIC ANALYSIS (THE DIRECTOR'S VISION)
- Analyze the requested "VIDEO STYLE" and define a unique "Visual Signature", color theory, and material palette that perfectly matches this style within the specified Indian demographic context.
- REFERENCE IMAGE (PRODUCT): If a reference image is provided, treat it as the PRODUCT IMAGE. DO NOT describe the product's physical details in the prompt. Instead, simply state "use the provided product reference image" whenever the product appears in a scene. The focus should be on the environment, lighting, and composition around the product.
- TEXT INTEGRATION: If the user provides "REQUIRED TEXT CONTENT", architect exactly how this text is integrated into specific scenes.

PHASE 3: THE ARCHITECTURAL BLUEPRINTS (HYPER-DETAILED PROMPTS)
For each segment, construct a dense, technical, and evocative multi-part paragraph.
Be hyper-specific about:
1. SUBJECT DEFINITION: Describe the scene. This MUST be a single frame shot, no split screen (except for Segment 0). If "UGC (Vlog Style)" is selected, the character (Regular Indian, matching Segment 0) MUST be speaking directly to the camera in a vlog/selfie format. If "Conversation" is selected, describe two characters facing each other at a close distance, bodies oriented towards each other, engaged in talking (no extra objects or activities). If "B-Roll Focus" is selected, focus on cinematic action, objects, or environments where the character is acting out the scene (no direct eye contact). If "Storytelling Narrative" is selected, the character MUST NOT look into the camera; focus on their actions and interactions within the scene. Otherwise, describe the characters (using their names from Segment 0) and environment (Modest Desi Setting). If the product is in the scene, just reference the provided product image. CRITICAL: Whenever you refer to a character by name, you MUST append their outfit color and "(same exact character as reference)" immediately after the name (e.g., "Rajesh in a blue shirt (same exact character as reference)"). This is especially CRITICAL in scenes with multiple characters to ensure visual distinction.
2. ACTION & POSTURE: Define the exact kinetic energy or static tension. For UGC, describe the character's speaking gestures and facial expressions.
3. ENVIRONMENT: A tangible, high-concept space (Modest Indian setting). You MUST explicitly reference the "Background Number" from Segment 0 (e.g., "Use Background 2 from Segment 0"). For "Conversation" style, you MUST maintain the spatial logic of the "270-degree environment shot" established in the moodboard. Describe any specific details needed for this shot while maintaining the core look of that background.
4. MOOD & STORY: The emotional subtext.
5. VISUAL STYLE: Specify the exact medium based on the requested VIDEO STYLE. If "Raw Android Shot", emphasize android mobile camera aesthetics (realistic, slightly low-res, raw photography, not too sharp). If "UGC (Vlog Style)", emphasize handheld vlog/selfie aesthetics with a consistent environment matching Segment 0. If the segment is a "[Repeat Camera Angle]", ensure the camera position and framing exactly match the previous instance.
6. LIGHTING & COLOR: Define the setup and color theory (keep consistent across the moodboard). For UGC, use natural, uncorrected lighting. For cinematic styles, ensure the lighting matches the TIME-OF-DAY logic established in the script analysis (e.g., if it's 2 AM, specify "pitch black environment with only a single dim blue moonlight source" or "dark room with orange street-light spill").
7. CAMERA & LENS PHYSICS: Specify camera, lens, and aperture. For Android/UGC style, use android mobile lens specs (e.g., 26mm, f/1.8) and mention handheld jitter, selfie-stick angles, and the character looking directly into the lens. Emphasize a "normal" android phone look—not too sharp, realistic, with a raw photography feel. For "Storytelling Narrative" and "B-Roll Focus" (after the intro), use cinematic lens specs (e.g., 35mm, 50mm, 85mm) and ensure the character is NOT looking into the lens.
8. TEXTURE & PBR: Micro-details and materials.
9. NEGATIVE CONSTRAINTS: For all segments EXCEPT Segment 0, you MUST append: "--no split screen, no collage, no grid, no multiple views, no multiple panels, no multiple frames, single frame only, no indoor plants, no decorative vases, no modern art, no luxury furniture, no designer sofas, no broken walls, no extreme poverty, no plastic skin, glossy, overly smooth, artificial lighting, 3D render, cartoonish, arbitrary placement, centered framing, stock photography vibe, no winking, no winks, over-sharpened, high-end DSLR look, professional studio lighting, CGI, 3D render, cartoon, anime, wax-like texture, uncanny valley, jittery movement, sliding feet, teleporting limbs, extra fingers, morphing background, over-saturated colors, bloom effect, motion blur artifacts, robotic movement, frame skipping, floating objects. MUST follow real life physics."
10. FINAL CONSISTENCY CHECK: At the absolute end of EVERY prompt (after the negative constraints), you MUST append the exact sentence: "Make sure to use same exact character as given in reference"

CRITICAL: OUTPUT FORMAT
- You MUST output the segments in order, starting with "Segment 0: Master Moodboard".
- For "Ready to Go" and "Veo 3.1 JSON" styles, Segment 1 is also a Moodboard (Backgrounds).
- For "Conversation" style, you MUST follow the specific SHOT DISTRIBUTION defined in the "Conversation Style" section above.
- For each segment, provide the title and the detailed prompt paragraph.
- Remember to include the 4 INTRO SHOTS (Talking/Direct to Camera) immediately after Segment 0 for ALL video styles EXCEPT "Conversation", "Storytelling Narrative", "Ready to Go", and "Veo 3.1 JSON".
- Use Scene Numbers (e.g., Scene 1, Scene 2) consistently alongside the time in the segment titles.
- Use the "[Repeat Camera Angle]" tag whenever a visual setup is reused.

Your goal is to create a sequence of rapid, high-impact, deeply connected visuals that look like they cost $1M to produce.`;

const CopyButton = ({ text, isCopied, onCopy }: { text: string, isCopied: boolean, onCopy: () => void }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    onCopy();
  };

  return (
    <button 
      onClick={handleCopy}
      className={`p-1.5 rounded transition-all ${
        isCopied ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/10 text-muted hover:text-white'
      }`}
      title={isCopied ? "Copied!" : "Copy Prompt"}
    >
      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

export default function App() {
  const [idea, setIdea] = useState('');
  const [videoStyle, setVideoStyle] = useState(VIDEO_STYLES[0]);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [imageText, setImageText] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [editableSegments, setEditableSegments] = useState<EditableSegment[]>([]);
  const [editableDialogueSegments, setEditableDialogueSegments] = useState<{ script: string }[]>([]);
  const [editableBrollSegments, setEditableBrollSegments] = useState<{ broll: string }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const saveToHistory = async (idea: string, textContent: string, prompt: string, analysis: string) => {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, textContent, prompt, analysis }),
      });
      fetchHistory(); // Refresh history
    } catch (err) {
      console.error("Failed to save history:", err);
    }
  };

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) handleFile(file);
          break;
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleClear = () => {
    setIdea('');
    setImageText('');
    setReferenceImage(null);
    setSegments([]);
    setEditableSegments([]);
    setEditableDialogueSegments([]);
    setEditableBrollSegments([]);
    setIsAnalyzing(false);
    setAnalysis('');
    setError(null);
    setVideoStyle(VIDEO_STYLES[0]);
  };

  const analyzeScript = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      let prompt = "";
      if (videoStyle === "Veo 3.1 JSON") {
        prompt = `You are a script analyst. Divide the following script into logical segments for a video. 
        For each segment, provide:
        1. The script text (MUST be in Hindi as provided).
        2. A creative B-roll idea that visually represents that part of the script.
        
        Format the output as a JSON object with a "segments" array containing objects with "script" and "broll" fields.
        
        SCRIPT: ${idea}
        VIDEO STYLE: ${videoStyle}`;
      } else {
        prompt = `You are a script analyst. Divide the following script into logical segments for a video.
        
        For "${videoStyle}", you MUST provide TWO separate lists:
        1. "dialogueSegments": 
           - For "Storytelling": A list of segments where the character speaks to the camera (UGC style).
           - For "Conversation": A list of segments where characters talk to EACH OTHER (NOT to the camera).
           - CRITICAL: In the "script" field, you MUST include the character's name followed by their dialogue in Hindi (e.g., "Rajesh: नमस्ते, कैसे हो?").
        2. "brollSegments": A list of cinematic B-roll segments that visually narrate the story. These should be "small cuts" of activities or actions. Provide only a short "broll" description.
        
        CRITICAL: For "${videoStyle}", you MUST generate a high volume of B-roll segments (at least 10-12 segments) to ensure a rich visual narrative that covers the entire script from start to finish.
        
        Format the output as a JSON object with "dialogueSegments" and "brollSegments" arrays.
        
        SCRIPT: ${idea}
        VIDEO STYLE: ${videoStyle}`;
      }

      const result = await ai.models.generateContent({
        model: selectedModel,
        contents: { parts: [{ text: prompt }] },
        config: {
          responseMimeType: "application/json",
        }
      });

      const data = JSON.parse(result.text || '{}');
      if (videoStyle === "Veo 3.1 JSON") {
        setEditableSegments(data.segments || []);
      } else {
        setEditableDialogueSegments(data.dialogueSegments || []);
        setEditableBrollSegments(data.brollSegments || []);
      }
      setIsAnalyzing(true);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze script. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const addEditableSegment = () => {
    setEditableSegments([...editableSegments, { script: '', broll: '' }]);
  };

  const addDialogueSegment = () => {
    setEditableDialogueSegments([...editableDialogueSegments, { script: '' }]);
  };

  const addBrollSegment = () => {
    setEditableBrollSegments([...editableBrollSegments, { broll: '' }]);
  };

  const updateEditableSegment = (index: number, field: keyof EditableSegment, value: string) => {
    const newSegments = [...editableSegments];
    newSegments[index][field] = value;
    setEditableSegments(newSegments);
  };

  const updateDialogueSegment = (index: number, value: string) => {
    const newSegments = [...editableDialogueSegments];
    newSegments[index].script = value;
    setEditableDialogueSegments(newSegments);
  };

  const updateBrollSegment = (index: number, value: string) => {
    const newSegments = [...editableBrollSegments];
    newSegments[index].broll = value;
    setEditableBrollSegments(newSegments);
  };

  const removeEditableSegment = (index: number) => {
    setEditableSegments(editableSegments.filter((_, i) => i !== index));
  };

  const removeDialogueSegment = (index: number) => {
    setEditableDialogueSegments(editableDialogueSegments.filter((_, i) => i !== index));
  };

  const removeBrollSegment = (index: number) => {
    setEditableBrollSegments(editableBrollSegments.filter((_, i) => i !== index));
  };

  const generatePrompt = async () => {
    const hasSegments = videoStyle === "Veo 3.1 JSON" ? editableSegments.length > 0 : (editableDialogueSegments.length > 0 || editableBrollSegments.length > 0);
    if (!hasSegments) return;
    
    setLoading(true);
    setError(null);
    setAnalysis('');
    setSegments([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const plan = videoStyle === "Veo 3.1 JSON" 
        ? JSON.stringify(editableSegments)
        : JSON.stringify({ dialogueSegments: editableDialogueSegments, brollSegments: editableBrollSegments });

      const parts: any[] = [
        { text: `USER SCRIPT PLAN: ${plan}\nVIDEO STYLE: ${videoStyle}${imageText ? `\nREQUIRED TEXT CONTENT (USE EXACTLY AS IS, DO NOT ALTER): "${imageText}"` : ''}\n\nBased on the provided script segments and B-roll ideas, generate the final hyper-detailed architectural blueprints for Recraft V4.` }
      ];

      if (referenceImage) {
        const base64Data = referenceImage.split(',')[1];
        const mimeType = referenceImage.split(';')[0].split(':')[1];
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
        parts[0].text += "\n\nPRODUCT REFERENCE IMAGE PROVIDED: Please treat the attached image as the product. Do not describe the product details in the prompts, just reference it as 'use the provided product reference image' when it appears in a scene.";
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: { parts },
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.9,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: {
                type: Type.STRING,
                description: "A deep strategic analysis of the overall script, identifying themes and art direction choices."
              },
              segments: {
                type: Type.ARRAY,
                description: "The visual segments of the video script.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timestamp: {
                      type: Type.STRING,
                      description: "Estimated timestamp (e.g., '0:00 - 0:04')"
                    },
                    scriptText: {
                      type: Type.STRING,
                      description: "The exact portion of the script for this segment."
                    },
                    visualCue: {
                      type: Type.STRING,
                      description: "A brief description of the visual action or scene."
                    },
                    prompt: {
                      type: Type.STRING,
                      description: "The final multi-part architectural prompt for Recraft V4 for this specific segment. For 'Ready to Go' style, this MUST be a stringified JSON object following the structure defined in the system instructions."
                    }
                  },
                  required: ["timestamp", "scriptText", "visualCue", "prompt"]
                }
              }
            },
            required: ["analysis", "segments"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      setAnalysis(data.analysis || '');
      setSegments(data.segments || []);
      
      // Save to Google Sheets
      saveToHistory(`[${videoStyle}] ${idea}`, imageText, JSON.stringify(data.segments || []), data.analysis || '');
    } catch (err) {
      console.error(err);
      setError("Failed to synthesize prompt. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(segments.map(s => `[${s.timestamp}] ${s.visualCue}\nPrompt: ${s.prompt}`).join('\n\n'));
    setCopiedAll(true);
    setCopiedIndex(null);
  };

  const renderPrompt = (prompt: string) => {
    try {
      const json = JSON.parse(prompt);
      
      // Handle Veo 3.1 JSON format
      if (json && json.version === "veo-3.1") {
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-mono uppercase tracking-widest text-muted">
              <div className="bg-white/5 p-2 rounded">
                <span className="text-white block mb-1 opacity-50">Duration</span>
                {json.output?.duration_sec}s
              </div>
              <div className="bg-white/5 p-2 rounded">
                <span className="text-white block mb-1 opacity-50">FPS</span>
                {json.output?.fps}
              </div>
              <div className="bg-white/5 p-2 rounded">
                <span className="text-white block mb-1 opacity-50">Resolution</span>
                {json.output?.resolution}
              </div>
              <div className="bg-white/5 p-2 rounded">
                <span className="text-white block mb-1 opacity-50">Aspect Ratio</span>
                {json.output?.aspect_ratio}
              </div>
            </div>

            <div className="p-4 bg-black/20 rounded-lg border border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white block mb-2 opacity-50">Global Style</span>
              <div className="text-sm text-zinc-300 space-y-1">
                <p><span className="text-zinc-500">Look:</span> {json.global_style?.look}</p>
                <p><span className="text-zinc-500">Color:</span> {json.global_style?.color_grading}</p>
                <p><span className="text-zinc-500">Mood:</span> {json.global_style?.mood}</p>
              </div>
            </div>

            {json.scenes?.map((scene: any, idx: number) => (
              <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white opacity-50">Scene: {scene.id}</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">{scene.timing}</span>
                </div>
                
                <div className="text-sm text-zinc-300">
                  <p className="mb-2"><span className="text-zinc-500">Shot:</span> {scene.shot?.type} ({scene.shot?.camera_movement})</p>
                  <p className="mb-2"><span className="text-zinc-500">Action:</span> {scene.action}</p>
                  
                  {scene.audio?.dialogue && (
                    <div className="mt-3 p-3 bg-emerald-500/10 rounded border border-emerald-500/20">
                      <p className="text-emerald-400 font-bold">Dialogue: {scene.audio.dialogue}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-400/30 block mb-1">Negative Prompt</span>
              <p className="text-[10px] text-zinc-500 italic">{json.negative_prompt}</p>
            </div>
          </div>
        );
      }
    } catch (e) {
      // Not JSON, render as plain text
    }

    // Highlight "Dialogue:" lines in green for plain text prompts
    const highlightedPrompt = prompt.split('\n').map((line, i) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('Dialogue:') || trimmedLine.includes(' Dialogue:') || trimmedLine.match(/^\[.*\]:/)) {
        return (
          <div key={i} className="text-emerald-400 font-bold">
            {line}
          </div>
        );
      }
      return <div key={i}>{line}</div>;
    });

    return <div className="font-mono text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap bg-black/20 p-4 rounded-lg">{highlightedPrompt}</div>;
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-black fill-black" />
            </div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase">AI Creative Director</h1>
          </div>
          <p className="text-muted text-sm max-w-md">
            Advanced visual synthesis for Recraft V4. 
            The engine autonomously handles art direction, lighting, and physics.
          </p>
        </div>
        <div className="flex gap-4 text-[10px] font-mono text-muted uppercase tracking-widest">
          <span>v5.0.0</span>
          <span>Engine: Gemini 3.0</span>
          <span>Status: Autonomous</span>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <section className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <div className="glass p-6 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="label">Video Script</label>
                <button 
                  onClick={handleClear}
                  className="text-[10px] font-mono text-muted hover:text-white flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-all uppercase tracking-widest"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All
                </button>
              </div>
              <textarea 
                className="input-field w-full min-h-[200px] resize-none text-lg"
                placeholder="Paste your video script here. I will segment it and generate visual prompts..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
              />

              <div className="space-y-3">
                <label className="label text-[10px] opacity-50">AI Engine</label>
                <div className="flex flex-wrap gap-2">
                  {MODELS.map(model => (
                    <button
                      key={model}
                      onClick={() => setSelectedModel(model)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono transition-colors ${
                        selectedModel === model 
                          ? 'bg-blue-500 text-white font-bold' 
                          : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="label text-[10px] opacity-50">Video Style & Direction</label>
                <div className="flex flex-wrap gap-2">
                  {VIDEO_STYLES.map(style => (
                    <button
                      key={style}
                      onClick={() => setVideoStyle(style)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono transition-colors ${
                        videoStyle === style 
                          ? 'bg-emerald-500 text-black font-bold' 
                          : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="label text-[10px] opacity-50">Product Reference Image (Optional)</label>
                <div className="relative group">
                  {!referenceImage ? (
                    <label 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-6 h-6 text-muted mb-2 group-hover:text-white transition-colors" />
                        <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Paste, Drag & Drop or Click to Upload</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  ) : (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10">
                      <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setReferenceImage(null)}
                        className="absolute top-2 right-2 p-1 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="label text-[10px] opacity-50">Text Content (Optional)</label>
                <input 
                  type="text"
                  className="input-field w-full py-3 px-4 text-sm"
                  placeholder="Any specific text to include in the image?"
                  value={imageText}
                  onChange={(e) => setImageText(e.target.value)}
                />
              </div>
              
              <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                <p className="text-[10px] font-mono text-muted uppercase tracking-widest leading-relaxed">
                  Director's Note: I will autonomously determine the optimal mood, brand tonality, 
                  cinematic lighting, and lens physics based on your concept.
                </p>
              </div>

              {!isAnalyzing ? (
                <button 
                  onClick={analyzeScript}
                  disabled={loading || !idea.trim()}
                  className="w-full bg-white text-black font-bold py-5 rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <BrainCircuit className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      ANALYZE & PLAN SCRIPT
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="label mb-0">Script Plan (Editable)</h3>
                    <button 
                      onClick={addEditableSegment}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                      title="Add Segment"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {videoStyle === "Veo 3.1 JSON" ? (
                      editableSegments.map((seg, idx) => (
                        <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3 relative group">
                          <button 
                            onClick={() => removeEditableSegment(idx)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div>
                            <label className="text-[9px] font-mono text-muted uppercase tracking-widest block mb-1">Script (Hindi)</label>
                            <textarea 
                              className="input-field w-full text-sm min-h-[60px] resize-none"
                              value={seg.script}
                              onChange={(e) => updateEditableSegment(idx, 'script', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-mono text-muted uppercase tracking-widest block mb-1">B-Roll Idea</label>
                            <textarea 
                              className="input-field w-full text-sm min-h-[60px] resize-none border-emerald-500/20"
                              value={seg.broll}
                              onChange={(e) => updateEditableSegment(idx, 'broll', e.target.value)}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-8">
                        {/* Dialogue Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="label mb-0 text-emerald-400">
                              {videoStyle === "Veo 3.1 JSON Storytelling" ? "Dialogue Segments (UGC)" : "Dialogue Segments (Conversation)"}
                            </h3>
                            <button 
                              onClick={addDialogueSegment}
                              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                              title="Add Dialogue"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {editableDialogueSegments.map((seg, idx) => (
                              <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10 relative group">
                                <button 
                                  onClick={() => removeDialogueSegment(idx)}
                                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                <textarea 
                                  className="input-field w-full text-sm min-h-[50px] resize-none"
                                  placeholder="Enter Hindi script..."
                                  value={seg.script}
                                  onChange={(e) => updateDialogueSegment(idx, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* B-Roll Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="label mb-0 text-amber-400">B-Roll Segments (Action)</h3>
                            <button 
                              onClick={addBrollSegment}
                              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                              title="Add B-Roll"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {editableBrollSegments.map((seg, idx) => (
                              <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10 relative group">
                                <button 
                                  onClick={() => removeBrollSegment(idx)}
                                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                <textarea 
                                  className="input-field w-full text-sm min-h-[50px] resize-none border-amber-500/20"
                                  placeholder="Enter B-roll action..."
                                  value={seg.broll}
                                  onChange={(e) => updateBrollSegment(idx, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsAnalyzing(false)}
                      className="flex-1 bg-white/5 text-white font-bold py-4 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      BACK
                    </button>
                    <button 
                      onClick={generatePrompt}
                      disabled={loading || (videoStyle === "Veo 3.1 JSON" ? editableSegments.length === 0 : (editableDialogueSegments.length === 0 && editableBrollSegments.length === 0))}
                      className="flex-[2] bg-emerald-500 text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          GENERATE FINAL BLUEPRINTS
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Output Section */}
        <section className="lg:col-span-7 space-y-6">
          {/* Agent Analysis */}
          <AnimatePresence>
            {(analysis || loading) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass rounded-xl p-6 border-emerald-500/20"
              >
                <div className="flex items-center gap-2 mb-4">
                  <BrainCircuit className="w-4 h-4 text-emerald-400" />
                  <h2 className="label mb-0 text-emerald-400">Strategist Analysis</h2>
                </div>
                <div className="min-h-[60px]">
                  {loading ? (
                    <div className="flex gap-2">
                      <div className="w-1 h-4 bg-emerald-500/40 animate-pulse" />
                      <div className="w-1 h-4 bg-emerald-500/40 animate-pulse delay-75" />
                      <div className="w-1 h-4 bg-emerald-500/40 animate-pulse delay-150" />
                      <span className="text-[10px] font-mono text-muted uppercase tracking-widest ml-2">Deconstructing intent...</span>
                    </div>
                  ) : (
                    <p className="text-xs font-mono text-zinc-400 leading-relaxed italic">
                      "{analysis}"
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Blueprint Output */}
          <div className="glass rounded-xl p-6 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-white" />
                <h2 className="label mb-0">Architectural Blueprints (Segments)</h2>
              </div>
              {segments.length > 0 && (
                <button 
                  onClick={copyToClipboard}
                  className={`flex items-center gap-2 text-xs transition-all px-3 py-1.5 rounded-lg ${
                    copiedAll ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedAll ? 'Copied All' : 'Copy All Prompts'}
                </button>
              )}
            </div>

            <div className="flex-grow relative">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                    <div className="space-y-1">
                      <p className="text-sm font-mono text-white">Synthesizing visual semantics...</p>
                      <p className="text-[10px] text-muted uppercase tracking-widest">Mapping brand tonality to photographic physics</p>
                    </div>
                  </motion.div>
                ) : segments.length > 0 ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {segments.map((segment, idx) => (
                      <div key={idx} className="space-y-3 pb-6 border-b border-white/10 last:border-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono text-white">{segment.timestamp}</span>
                            <h3 className="text-sm font-bold text-emerald-400">
                              {segment.visualCue.includes('[Repeat Camera Angle]') ? (
                                <>
                                  <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse">
                                    [Repeat Camera Angle]
                                  </span>
                                  {segment.visualCue.replace('[Repeat Camera Angle]', '')}
                                </>
                              ) : segment.visualCue.includes('[B-Roll]') ? (
                                <>
                                  <span className="text-blue-400 font-bold">[B-Roll]</span>
                                  {segment.visualCue.replace('[B-Roll]', '')}
                                </>
                              ) : (
                                segment.visualCue
                              )}
                            </h3>
                          </div>
                          <CopyButton 
                            text={segment.prompt} 
                            isCopied={copiedIndex === idx}
                            onCopy={() => {
                              setCopiedIndex(idx);
                              setCopiedAll(false);
                            }}
                          />
                        </div>
                        <p className="text-xs font-mono text-zinc-400 italic border-l-2 border-white/10 pl-3">
                          "{segment.scriptText}"
                        </p>
                        {renderPrompt(segment.prompt)}
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-20"
                  >
                    <Maximize className="w-12 h-12 mb-4" />
                    <p className="text-sm font-mono">Awaiting architectural directives</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs font-mono">
                {error}
              </div>
            )}

            {segments.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted uppercase font-mono block">Model</span>
                  <span className="text-xs font-medium">Recraft V4 Pro</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted uppercase font-mono block">Resolution</span>
                  <span className="text-xs font-medium">2048 x 2048</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted uppercase font-mono block">Format</span>
                  <span className="text-xs font-medium">RAW / Vector</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted uppercase font-mono block">Fidelity</span>
                  <span className="text-xs font-medium">High-End</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* History Section */}
      <section className="mt-16">
        <div className="flex items-center gap-3 mb-8">
          <History className="w-5 h-5 text-white" />
          <h2 className="text-xl font-bold uppercase tracking-tighter">Architectural History</h2>
          <div className="h-[1px] flex-grow bg-white/10" />
        </div>

        {loadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-muted" />
          </div>
        ) : history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="glass p-5 rounded-xl space-y-4 hover:border-white/20 transition-colors group cursor-pointer"
                onClick={() => {
                  let loadedIdea = item.idea;
                  let loadedStyle = VIDEO_STYLES[0];
                  const styleMatch = loadedIdea.match(/^\[(.*?)\] (.*)/s);
                  if (styleMatch) {
                    loadedStyle = styleMatch[1];
                    loadedIdea = styleMatch[2];
                  }
                  
                  setIdea(loadedIdea);
                  setVideoStyle(loadedStyle);
                  setImageText(item.textContent || '');
                  try {
                    const parsed = JSON.parse(item.prompt);
                    if (Array.isArray(parsed)) {
                      setSegments(parsed);
                    } else {
                      setSegments([{ timestamp: "0:00", scriptText: "", visualCue: "Legacy Prompt", prompt: item.prompt }]);
                    }
                  } catch {
                    setSegments([{ timestamp: "0:00", scriptText: "", visualCue: "Legacy Prompt", prompt: item.prompt }]);
                  }
                  setAnalysis(item.analysis || '');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wide line-clamp-1 text-white/90">
                    {item.idea}
                  </h3>
                  {item.textContent && (
                    <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                      Text: "{item.textContent}"
                    </p>
                  )}
                  <p className="text-[10px] font-mono text-muted line-clamp-3 leading-relaxed">
                    {(() => {
                      try {
                        const parsed = JSON.parse(item.prompt);
                        if (Array.isArray(parsed)) {
                          return `${parsed.length} Segments Generated`;
                        }
                        return item.prompt;
                      } catch {
                        return item.prompt;
                      }
                    })()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass rounded-xl border-dashed border-white/10">
            <p className="text-sm font-mono text-muted uppercase tracking-widest">No architectural records found</p>
          </div>
        )}
      </section>

      {/* Footer Info */}
      <footer className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-8 pb-12">
        <div className="max-w-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-2">The Recraft V4 Paradigm</h3>
          <p className="text-[11px] text-muted leading-relaxed">
            Unlike legacy models, Recraft V4 embeds design logic directly into the generative process. 
            This application ensures visual choices—arrangement, color interaction, and spatial movement—are 
            intentional rather than arbitrary.
          </p>
        </div>
        <div className="flex gap-12">
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono text-muted uppercase tracking-widest">Framework</h4>
            <ul className="text-[10px] space-y-1 uppercase">
              <li>10-Part Architecture</li>
              <li>PBR Texturing</li>
              <li>Optical Engineering</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono text-muted uppercase tracking-widest">Capabilities</h4>
            <ul className="text-[10px] space-y-1 uppercase">
              <li>Native Vector Synthesis</li>
              <li>Typographic Integration</li>
              <li>Commercial Art Direction</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
