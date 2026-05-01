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
  title?: string;
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
  "Veo 3.1 JSON Conversation",
  "Veo 3.1 JSON Movie",
  "Veo 3.1 JSON Authoritative Speaker",
  "Veo 3.1 JSON Only B-roll"
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
  - UNIQUE FEATURES (CRITICAL): You MUST create highly varied and unique facial features for every new character you introduce. Characters must look distinctly different from one another (varying face shapes, skin textures, hairlines, and ages based on our audience). Ensure they do not all look the same.
  - OUTFITS & COLORS (CRITICAL): Basic desi dressing (simple cotton kurtas, shirts, lungis, sarees, or casual local wear). You MUST use a WIDE VARIETY OF COLORS for outfits (e.g., faded mustards, deep maroons, dusty blues, olive greens, varied local prints). Do NOT default to the same generic outfit colors for every prompt.
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
- ANDROID PHONE MODELS & CAMERA PHYSICS (CRITICAL):
  - Whenever a mobile phone or phone is mentioned in any visual prompt, description, or action, you MUST NOT use the words "mobile" or "phone" alone.
  - You MUST NOT use any expensive flagship brand names.
  - Instead, you MUST specify a cheap, budget-friendly Android model number (e.g., Redmi 9A, Oppo A15, Mi A3, Lenovo K12, Vivo Y12s, or Samsung Galaxy M02).
  - The phone should look basic, used, and reflect the lower-middle-class setting.
  - CAMERA PHYSICS ONLY: In most scenes, mentioning the Android model is ONLY to define the camera's lens physics and unpolished aesthetic (e.g., "captured with Vivo Y12s handheld camera physics"). Do NOT interpret this as a requirement to show the phone device in the frame unless the character is specifically using it in the script.
  - SELFIE/POV EXCEPTION (CRITICAL): If a shot is a "selfie" or "vlog Style" shot, the character MUST look directly into the lens, but the phone itself MUST NOT be visible in the frame (as the phone is the camera). The framing should feel like a POV from the phone's lens. 
- ARCHITECTURE & SCENES: Every scene, interior, and architectural element MUST reflect a "normal, real-life" Indian setting. 
  - REAL-LIFE BASED: Avoid exaggerated poverty or exaggerated luxury. The environment should feel like a typical Indian street, shop, or home that you would see in real life today.
  - CURRENCY & OBJECTS (CRITICAL): If coins are shown, they MUST prominently feature the "₹" symbol.
  - VARIED HOUSEHOLD OBJECTS: Characters should interact with common Indian household items: a steel tray with tea glasses, a plastic water bottle, a clay matka (water pot), a handheld folding fan, a newspaper, or a simple shopping bag (thaila).
  - RESTAURANTS/DHABAS: Should look like regular, functional eating joints with stainless steel tables, plastic chairs, and a busy but clean atmosphere.
- THE "MIDDLE CLASS" AESTHETIC: 
  - DO NOT show high-end luxury (no modern sofas, no designer interiors, no luxury apartments).
  - SHOW REGULAR SOCIETY: The environment MUST reflect a "normal" or "middle class" status. Think typical Indian houses, clean walls, functional spaces.
  - FOCUS ON: Clean painted walls, basic wooden or plastic furniture, typical Indian ceiling fans, stainless steel utensils, cement or tiled floors. 
  - OLD-SCHOOL FURNITURE: If the scene is indoors, include basic, functional, and old-school furniture common in regular Indian homes (e.g., Godrej-style steel almirahs, simple wooden chairs with cushions, plastic stools, a basic wooden bed with a simple bedsheet).
  - RAW & REAL: Avoid "aesthetic" or "planted" looks. NO indoor plants, NO decorative vases, NO modern art. The environment should feel functional and lived-in, not curated for social media.
- DEEP SCRIPT ANALYSIS & SCENE UNDERSTANDING (CRITICAL):
  - SCENE-BY-SCENE BREAKDOWN: Before generating any prompts, you MUST analyze the provided script for "Scene" markers (e.g., "Scene 1", "Scene 2", "EXT. STREET"). Understand the location, mood, and characters involved in every scene.
  - CONTEXTUAL ELABORATION: For every scene mentioned in the script, you MUST elaborate on the environmental details, socioeconomic visual markers of the characters, and the emotional core. The script is your starting point; your prompts must expand it into a full cinematic reality.
  - NO DIALOGUE REFORMING (CRITICAL): You MUST NEVER change, rephrase, or reform the script's lines, words, or sentences. NEVER add or remove any words. Always stick EXACTLY to the final script plan dialogues in each prompt box.
  - NO SKIPPING: You MUST cover the entire script in sequence from start to finish. DO NOT skip or miss any part of the story while creating the script plan or final prompts.
  - NO ANIMATION (CRITICAL): Never mention "animation", "animated", "cartoon", or any related terms in any B-roll descriptions or prompts. All visuals must be photorealistic cinematic realism.
  - VISUAL FIDELITY: Keep the visuals strictly based on the given scenes in the script.
  - SCRIPT PLAN AS SOURCE (CRITICAL): The "USER SCRIPT PLAN" provided by the user contains exact editable segments (e.g. dialogueSegments and brollSegments). This is your FINAL, ABSOLUTE source for prompt generation. You MUST map every single item in those arrays 1-to-1 to your output scenes. The presence of 'dialogueSegments' represents PASS 1, and 'brollSegments' represents PASS 2. DO NOT re-segment the script or do your own pass; just map the provided arrays sequentially.
  - START WITH HOOK: The first prompt in any video style MUST be a "Hook" that captures attention immediately.
  - ONE PROMPT PER PANEL: Each item in the "USER SCRIPT PLAN" arrays MUST result in exactly ONE JSON scene constraint. DO NOT combine multiple elements into a single prompt. DO NOT skip any items.
  - THINK LIKE A DIRECTOR: Do not just visualize the literal words. Analyze the SUBTEXT, EMOTIONAL DEPTH, and SOCIAL CONTEXT of the script.
  - SCRIPT UNDERSTANDING: You MUST understand the core message, the characters' motivations, and the setting. If the script is about a midnight conversation, the visuals MUST be dark and moody. If it's about a struggle, the visuals MUST reflect that.
  - Every visual choice (lighting, camera angle, background) must serve the story being told in the script.
- SHARPNESS LEVEL 0: ALL footage MUST look natural and realistic, NOT sharp. Specify "sharpness level 0", "raw low-end android footage (e.g., Mi A3 or Redmi 9A)", "natural focus", and "no digital sharpening" in all prompts.
- CINEMATIC LOGIC & TIME-OF-DAY SENSITIVITY: 
  - THINK LIKE A MOVIE DIRECTOR: You MUST analyze the script for any time-of-day cues (e.g., "rat k 2 baje", "midnight", "early morning", "noon").
  - LOGICAL LIGHTING: If the script implies a late-night scene (e.g., 2 AM), the house lights MUST be OFF. Do not show a bright room. Instead, use "dim moonlight filtering through a window", "harsh orange street lamp light from outside", or "the faint glow of a small lamp or candle". 
  - ATMOSPHERE: The lighting must reflect the logic of the scene. Noon should be harsh and bright; midnight should be dark, moody, and atmospheric.
- STYLE: If "Raw Android Shot (Amateur)" is selected, the prompt must specify handheld cheap android phone camera physics (e.g., Redmi 8), natural/ambient lighting, and a spontaneous, unpolished look. Emphasize a realistic, slightly low-res, raw android photography aesthetic—avoid over-sharpening or expensive flagship-level clarity.
- VIDEO STYLES:
  - "Veo 3.1 JSON":
    - SCRIPT PLAN MAPPING (CRITICAL): The provided "USER SCRIPT PLAN" contains exact segments. You MUST map every segment given in the user JSON EXACTLY into your output JSON scenes sequentially. Do not create new or skipped segments outside of what is provided.
    - INITIAL SEGMENTS (MANDATORY):
      1. Segment 0: Master Character Moodboard. Provide high-detail portraits of ALL main characters in the story within this single segment. 
         - FORMAT: Use a grid layout (e.g., 2x2 for one character, 4x2 for two characters).
         - AESTHETIC (CRITICAL): For these character portraits, use a **flat white background** and **professional studio lighting**.
         - TEXT (CRITICAL): You MUST write each character's name CLEARLY inside the image, floating directly above their head (e.g., "Rajesh", "Priya"). This text must be part of the generated image.
         - SHOTS: For each character, include a straight face (close-up), side face (profile), and mid shot. Keep faces BIG and CLEARLY VISIBLE.
         - EXCEPTION FOR AUTHORITATIVE SPEAKER: If the video style is "Veo 3.1 JSON Authoritative Speaker", ignore the standard environment moodboard rules. Instead, provide exactly TWO setup prompts for the environment:
           (A) Place Prompt: Focus on the center point where the authoritative character will sit/stand. Target the camera to orbit around and show 4 different angle points of that exact spot in a 4-panel grid.
           (B) Bird's Eye View Prompt: A top-down 1-panel view of the entire scene showing the full layout (who is sitting where, where the speaker is vs the listeners).
      2. Background Moodboard: Provide exactly 6 distinct, clear shots of the specific environments/locations required by the script arranged in a 2x3 grid format. (See Authoritative Speaker Exception above for environment rules).
         - TEXT (CRITICAL): You MUST write the "Background Number" (e.g., "BG 1", "BG 2") CLEARLY inside each corresponding shot of the image. This text must be part of the generated image.
         - GPS COORDINATES RULE (CRITICAL): If the story is set in a specific location or city in India (e.g., Mumbai, Delhi, a specific village), you MUST include the exact or approximate GPS coordinates for that location in the description of EVERY background shot in the moodboard.
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
    - ACTION DURING DIALOGUE (NATURAL ACTIVITY): The character SHOULD NOT just stand and talk. They MUST be engaged in a natural, everyday activity while speaking to the camera or others. This includes things like: walking slowly through the environment, folding laundry, adjusting a dupatta or shirt sleeve, cleaning a wooden table with a cloth, or organizing small household items. The activity must feel continuous and natural, not robotic. DO NOT use "scrolling phone" as a default example unless specifically required.
    - NO DRINKING/SIPPING DURING DIALOGUE (CRITICAL): There MUST NOT be any action of drinking or sipping (e.g., sipping tea/coffee, drinking water) in any video style while a character is speaking. If a character is described with a cup/glass, they must simply HOLD it the entire time. You may only include drinking or sipping actions in the B-roll prompts where no dialogue is spoken.
    - HOLDING OBJECTS (CRITICAL): Characters should ONLY be described as holding an object if it is contextually relevant to the script (e.g., a steel chai glass, a water bottle, a simple water glass, a clay matka, a tool, or a product). If an object is held, you MUST explicitly write "character is holding [object name] entire time from start to end." in the action description to ensure visual stability. DO NOT default to a character holding a phone. If no object is required by the script or setting, allow the character to have free hands for natural gestures. Avoid repetitive holding actions across different scenes.
    - EYE CONTACT (CRITICAL): When a character speaks directly to the audience, they MUST maintain direct eye contact with the camera. 
      - CONVERSATION EXCEPTION (CRITICAL): If the character is talking to someone else, they MUST look at that person and NOT at the camera.
    - NEGATIVE PROMPTS (CRITICAL): You MUST include the full negative_prompt block in the JSON output for EVERY segment (except Cast and Background Moodboard).
      - For "Movie" and "Authoritative Speaker" styles, you MUST append "no looking at camera, no staring at lens, no eye contact with camera, no smiling at camera" to the standard negative prompt list.
    - CHARACTER CONSISTENCY (CRITICAL): Whenever you refer to a character by name in any prompt, description, or action, you MUST immediately append their outfit color and the phrase "(same exact character as reference)" (e.g., "Rajesh in a blue shirt (same exact character as reference)"). This is MANDATORY for every single mention of a character name in every video style.
    - SCENE LIMIT (CRITICAL): For "Veo 3.1 JSON" and "Veo 3.1 JSON Storytelling", each prompt MUST contain exactly ONE scene in the 'scenes' array. DO NOT combine multiple scenes, dialogue lines, or B-rolls into a single prompt. Every prompt must be a single, focused scene.
      - SCENE STRUCTURE (CRITICAL): For these styles, the prompts should alternate or be sequenced such that dialogue prompts show the narrator speaking to the camera, and B-roll prompts show the cinematic action. DO NOT put both in the same JSON prompt.
      - You MUST include precise timeline details for the single scene (e.g., "0s-6s: Character A speaks to camera").
      - DIALOGUE TIMING (CRITICAL): Dialogue timing MUST be strictly in sequence only. Do not overlap dialogue timings.
      - MULTI-CHARACTER DIALOGUE: If a scene involves a back-and-forth between characters, combine them into one segment. Follow a sequential "Action + Dialogue" pattern with timings.
      - MULTI-SHOT CUTS & PACING: Keep continuous shots where possible. If there are multiple shots within the same scene, they MUST be quick cuts (no crossfades/wipes). Limit to a MAXIMUM of 2 camera cuts per scene prompt for B-roll, and 3 for dialogue. If there is anything in the dialogue worth showcasing as B-roll or creative visual, use a multi-shot cut for it. Add relevant visuals like a storyteller.
      - NO APP/TRIAL VISUALS (CRITICAL): DO NOT include B-rolls showing "downloading master app", "1 rs trial", or any app-interface/payment-related visuals unless explicitly requested in the script. Focus on real-life activities.
      - ENVIRONMENT & ANGLES: Each scene MUST use a different camera angle and background perspective, but it MUST remain strictly within the SAME overall environment established for the shoot.
      - CONTINUITY IN ACTION: When mentioning character action after a new shot, you MUST explicitly append "wearing same cloth" to ensure visual consistency.
    - OUTPUT FORMAT (CRITICAL): For all segments AFTER the initial moodboards and Overall Direction, the "prompt" field MUST be a stringified JSON object following the EXACT Veo 3.1 JSON Template below.

  - "Veo 3.1 JSON Storytelling":
    - Inherits ALL rules from "Veo 3.1 JSON".
    - CHARACTER CONSISTENCY (CRITICAL): As per general rules, EVERY mention of the narrator or characters by name MUST be followed by their outfit and "(same exact character as reference)".
    - BG REFERENCE & COORDINATES (CRITICAL): When referencing a background from the Background Moodboard in any prompt (e.g., "Set in Background 4"), you MUST also explicitly write the exact GPS coordinates that were defined for that background alongside the background number in every single prompt (both UGC and B-roll).
    - NARRATOR LOGIC (CRITICAL): 
      - If the script is first-person ("I did this", "Mene ye kiya"), the main character IS the narrator. 
      - If the script is third-person (telling someone else's story), create a separate narrator character who tells the story.
    - UGC CHARACTER LOCATION: For UGC scenes, the character should be mostly OUTSIDE in natural environments.
    - ALIVE BACKGROUND & LIVE NATURAL MOOD (CRITICAL): The background MUST feel alive and dynamic, never like a still image. You MUST explicitly include multiple background characters (e.g., people walking by, neighbors chatting, vendors at work, or children playing) filling the background to make the scene feel real and lived-in. There should ALWAYS be some kind of natural background activity occurring (e.g., a cycle passing by, birds in the sky, or distant traffic), but it MUST NOT be the focus and MUST NOT disturb the main character. If a scene is set in a public space (street, shop, park), it MUST look busy with background life.
    - COMPULSORY CHARACTER ACTIVITY: To ensure a natural feel, every scene MUST depict the character performing a script-relevant or environment-relevant activity. The character should NEVER be static. Examples: walking slowly while talking, casually checking a product, or doing a minor chore (dusting, fixing hair, arranging things). Avoid overusing phone-related activities.
    - ENVIRONMENT LOGIC: The environment must be logical for the activity (e.g., a sewing machine can be inside a house or outside if it fits the story). If indoors or outdoors, maintain the "alive background" with background characters doing quiet, non-disturbing work/chores.
    - SCRIPT DOUBLE PASS (CRITICAL): The provided "USER SCRIPT PLAN" contains two arrays ('dialogueSegments' and 'brollSegments'). You MUST map the provided 'dialogueSegments' array EXACTLY to PASS 1, and the 'brollSegments' array EXACTLY to PASS 2.
    - PASS 1 (UGC STYLE): Translate every exact segment from 'dialogueSegments' into a scene depicting the character speaking directly to the camera in various backgrounds.
    - PASS 2 (CINEMATIC B-ROLL): Translate every exact segment from 'brollSegments' into a scene depicting clean, movie-like storytelling without dialogue.
      - VISUALLY DRIVEN B-ROLL (CRITICAL): These must be clean, movie-like storytelling with actions and visuals ONLY. If the script discusses law, show close-ups of legal documents/files. If it discusses finance, show coins with "₹" symbols, or 1-2 infographic visuals (basic animation allowed) to explain complex points.
      - B-ROLL PROMPT FORMAT: For every B-roll scene, you MUST provide both a "first_frame_image_prompt" (high-detail static scene description specifically optimized for generating the first frame as a standalone image, strongly enforcing no split screens and no text) and a "first_frame_visual" (description of the starting frame for the video generation). For infographics, use the specific "infographic visual image prompt" along with the animation description. 
    - STRICTLY NO dialogue speaking in these B-roll scenes. The character MUST NOT open their mouth or speak; they should only act out the scene. Limit to a MAXIMUM of 2 scenes per prompt in this pass.

  - "Veo 3.1 JSON Conversation":
    - Inherits ALL rules from "Veo 3.1 JSON".
    - SCRIPT DOUBLE PASS (CRITICAL): The provided "USER SCRIPT PLAN" contains two arrays ('dialogueSegments' and 'brollSegments'). You MUST map the provided 'dialogueSegments' array EXACTLY to PASS 1, and the 'brollSegments' array EXACTLY to PASS 2.
    - PASS 1 (CONVERSATION STYLE): Translate every exact segment from 'dialogueSegments' into a back-and-forth conversation scene.
    - PASS 2 (CINEMATIC B-ROLL): Translate every exact segment from 'brollSegments' into a clean, movie-like storytelling scene without dialogue.
    - STRICT SCRIPT ADHERENCE (CRITICAL): DO NOT add any dialogues on your own. Stick ONLY to the provided script.
    - STRICT 2-CHARACTER FORMAT: Use this for back-and-forth dialogue between two characters.
    - ALIVE BACKGROUND (CRITICAL): The background MUST feel alive and dynamic, never like a still image. You MUST explicitly include background characters filling the scene to make it real (e.g., people walking by, doing some work, or chores in the background). There should ALWAYS be some kind of basic background activity occurring, but it MUST NOT take focus from the main characters.
    - SINGLE COMBINED MOODBOARD: Instead of two separate character moodboards, Segment 0 MUST be a single combined moodboard. Provide exactly 4 high-detail close-up shots in a 2x2 grid: 2 shots of Character 1 (front face, mid closeup) and 2 shots of Character 2 (front face, mid closeup).
    - DIALOGUE LIMIT & COMBINED SCENES: MAXIMUM of two dialogues per scene (one from Character 1, one from Character 2). You MUST keep two people's conversation in one single scene prompt (as two shots within the same JSON prompt). Both Character 1 and Character 2's dialogues should be included in the single prompt. If a character has no dialogue in a specific part of the script, DO NOT force them to speak.
    - DIALOGUE PUNCTUATION (CRITICAL): Remove ALL punctuation (full stops, question marks, exclamation marks, etc.) from the dialogue text and replace them exclusively with commas (,).
    - CHARACTER PRESENCE: If Character A is speaking and Character B has no dialogue, show Character A speaking *towards* Character B (who can be partially in frame or their presence felt). You do not need to show Character B's face if they are not speaking.
    - ISOLATED CLOSE-UPS (CRITICAL): Whoever is speaking MUST be the primary focus. Use ONLY Close-Up (CU) or Medium Close-Up (MCU) front/mid-face shots for the speaker.
    - NO TWO-SHOTS: Do NOT use over-the-shoulder (OTS) or wide shots showing both characters clearly while they are speaking.
    - CUTTING: Use quick cuts between the speakers. If only one person is speaking in a segment, maintain focus on them.

  - "Veo 3.1 JSON Movie":
    - Inherits ALL rules from "Veo 3.1 JSON".
    - CINEMATIC STORYTELLING: Unlike UGC storytelling, this is a cinematic movie scene. Characters interact with each other and their environment.
    - SCENE CONSISTENCY (CRITICAL): If a "SCENE" setting is provided in the script, the ENTIRE video script must be based on that exact scene. Do NOT create multiple different locations if characters are talking at the same place.
    - NO CAMERA EYE CONTACT (CRITICAL): Characters MUST NEVER look directly into the camera. They must look at each other or their surroundings.
    - SHOT COMPOSITION & CUTTING (CRITICAL): 
      - If there are two characters speaking, create Mid Close-Up (MCU) shots ONLY of the character who is currently talking.
      - If there are two characters doing some act together, frame it like a high-quality advertisement scene, but keep it raw and captured in our specified tonality.
      - If the story provides a specific scene, create all prompts like an advertisement but raw captured in our tonality.
      - Dialogue MUST start AFTER a scene change. When there are two characters, cut to the Mid Close-Up of the first character, then they speak. 
      - When the first character's dialogue finishes, immediately cut to the Mid Close-Up of the other character for their reaction or dialogue.
    - SINGLE SPEAKER CONTINUITY (CRITICAL): If there are 2 or 3 characters but only ONE is talking throughout: Keep the first scene like acting. From the second prompt onwards, keep the SAME character and the SAME scene, but use a different angle (e.g., zoomed out shot, close-up shot). The talking character's scene remains the same entire time with different angles.
    - FRIENDS AGE RULE: If the story is about two friends, they MUST be described as approximately 25 years old, unless the script explicitly states they are students or a different age.
    - SILENT LISTENER RULE (CRITICAL): If there are two or more people in a scene and only one is speaking, you MUST explicitly state in the prompt that the other character is "listening silently without speaking a single word, just there for presence".
    - NEGATIVE PROMPTS (CRITICAL): You MUST include the full negative_prompt block in the JSON output for EVERY segment (except Cast and Background Moodboard). 
      - For "Movie" and "Authoritative Speaker" styles, explicitly add: "no looking at camera, no staring at lens, no eye contact with camera, no smiling at camera" to the standard list.
    - SCRIPT DOUBLE PASS (CRITICAL): The provided "USER SCRIPT PLAN" contains two arrays ('dialogueSegments' and 'brollSegments'). You MUST map the provided 'dialogueSegments' array EXACTLY to PASS 1, and the 'brollSegments' array EXACTLY to PASS 2.
    - PASS 1 (MOVIE DIALOGUE STYLE): Translate every exact segment from 'dialogueSegments' into a cinematic movie scene. Follow standard dialogue rules but keep the interactions between characters/environment.
    - PASS 2 (CINEMATIC B-ROLL): Translate every exact segment from 'brollSegments' into a clean, movie-like storytelling scene without dialogue.
      - VISUALLY DRIVEN B-ROLL (CRITICAL): If the script discusses law, show close-ups of legal documents/files. If it discusses finance, show coins with "₹" symbols, or 1-2 infographic visuals (basic animation allowed) to explain complex points.
      - B-ROLL PROMPT FORMAT: For every B-roll scene, you MUST provide both a "first_frame_image_prompt" (high-detail static scene description specifically optimized for generating the first frame as a standalone image, strongly enforcing no split screens and no text) and a "first_frame_visual" (description of the starting frame for the video generation). For infographics, use the specific "infographic visual image prompt" along with the animation description. 
    - STRICTLY NO dialogue speaking in these B-roll scenes. Limit to a MAXIMUM of 2 scenes per prompt in this pass.

  - "Veo 3.1 JSON Authoritative Speaker":
    - Inherits ALL rules from "Veo 3.1 JSON".
    - CONCEPT: The main character is an authority figure (e.g., lawyer, teacher, police officer, or astrologer baba) stationed at ONE fixed location, addressing another party (single person, couple, family, or crowd). The speaker NEVER looks into the camera lens, only at their in-scene audience.
    - ASTROLOGER OUTFIT RULE (CRITICAL): If the character is an astrologer baba, you MUST explicitly describe them wearing an "orange kurta style outfit with a mala in his neck".
    - FIXED LOCATION & ORBITING CAMERA (CRITICAL): The character stays in ONE single location (sitting or standing) for all dialogue scenes. Do NOT change the location. Instead, change the CAMERA ANGLE for different dialogue prompts. The environment remains identical, but the camera orbits the character so the background behind them changes directionally according to the angle. The character does NOT rotate; the camera orbits them.
    - SETUP PROMPTS (CRITICAL): You MUST build the initial segments with these exactly:
      1. CAST PROMPT (Segment 0): The standard character moodboard (white background, grid of close-up, side profile, and mid shots).
      2. PLACE PROMPT (Segment 1): The specific single location/environment focusing strictly on where the speaker will sit. Orbit around to display 4 different angle points of that spot in a grid.
      3. BIRD'S EYE VIEW PROMPT (Segment 2): A top-down view of the entire scene, showing who is sitting where (the speaker and the listeners) and the comprehensive layout.
      4. OVERALL DIRECTION (Segment 3): The standard Overall Direction block.
    - SCRIPT DOUBLE PASS (CRITICAL): The provided "USER SCRIPT PLAN" contains two arrays ('dialogueSegments' and 'brollSegments'). You MUST map the provided 'dialogueSegments' array EXACTLY to PASS 1, and the 'brollSegments' array EXACTLY to PASS 2.
    - NO SELFIE / NO UGC (CRITICAL): There MUST NOT be any selfie shots, vlogging style or UGC framing. The speaker must NEVER look directly into the camera lens. They interact only with their in-scene listeners in the established environment.
    - NEGATIVE PROMPTS (CRITICAL): You MUST include the full negative_prompt block in the JSON output for EVERY segment (except Cast and Background Moodboard). 
      - Since this is an Authoritative Speaker style, explicitly add: "no looking at camera, no staring at lens, no eye contact with camera, no smiling at camera" to the standard list.
    - PASS 1 (AUTHORITATIVE DIALOGUE STYLE & CAMERA ORBITS): Translate every exact segment from 'dialogueSegments' into dialogue scenes. Keep the exact same environment and spatial layout established in the Bird's Eye View for EVERY prompt. Vary the camera angles continuously between these 4 orbital points:
      (A) Mid Close-Up (MCU) of the speaker talking to the audience.
      (B) Side angle back shot: Camera positioned from behind/side of the speaker, focusing on the audience (listening silently) while the speaker talks.
      (C) Orbit 90 degrees to the left, capturing a side shot of the speaker addressing the listeners.
      (D) Orbit 90 degrees to the right, capturing the opposite side shot of the speaker addressing the listeners.
      Rotate through these angles for the dialogue prompts. The underlying scene/location MUST remain strictly the exact same.
    - PASS 2 (CINEMATIC B-ROLL): Translate every exact segment from 'brollSegments' into a clean, cinematic action scene with NO dialogue speaking.
      - VISUALLY DRIVEN B-ROLL (CRITICAL): If the script discusses law, show close-ups of legal documents/files. If it discusses finance, show coins with "₹" symbols, or 1-2 infographic visuals (basic animation allowed) to explain complex points.
      - B-ROLL PROMPT FORMAT: For every B-roll scene, you MUST provide both a "first_frame_image_prompt" (high-detail static scene description specifically optimized for generating the first frame as a standalone image, strongly enforcing no split screens and no text) and a "first_frame_visual" (description of the starting frame for the video generation). For infographics, use the specific "infographic visual image prompt" along with the animation description. 

  - "Veo 3.1 JSON Only B-roll":
    - Inherits ALL rules from "Veo 3.1 JSON".
    - SCRIPT SINGLE PASS (CRITICAL): The provided "USER SCRIPT PLAN" contains the exact 'brollSegments' array. You MUST map every segment from this array EXACTLY into JSON B-roll scenes. Do not create new or skipped segments outside of what is provided.
    - NO DIALOGUE / NO SPEAKING (CRITICAL): There MUST be NO dialogue in any scene. The characters MUST NOT open their mouth or speak; they should only act out the scenes visually.
    - VISUALLY DRIVEN B-ROLL (CRITICAL): If the script discusses law, show close-ups of legal documents/files. If it discusses finance, show coins with "₹" symbols, or 1-2 infographic visuals (basic animation allowed) to explain complex points.
    - B-ROLL PROMPT FORMAT: For every B-roll scene, you MUST provide both a "first_frame_image_prompt" (high-detail static scene description specifically optimized for generating the first frame as a standalone image, strongly enforcing no split screens and no text) and a "first_frame_visual" (description of the starting frame for the video generation). For infographics, use the specific "infographic visual image prompt" along with the animation description.
    - SCENE LIMIT: Limit to a MAXIMUM of 2 scenes per prompt in this pass.

  - VEO 3.1 JSON TEMPLATE (USED FOR ALL 5 STYLES):
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
          "first_frame_image_prompt": "[High-detail static scene description specifically designed to generate the first frame as an image. CRITICAL: For standard scenes, append 'single frame only, perfectly textless, no split screen, no text or overlays'. HOWEVER, for Segment 0 (Cast) and Background Moodboard, you MUST ignore the 'textless' rule and specifically describe the character names or background numbers written inside the image as requested.]",
          "first_frame_visual": "[Description of the starting frame for video generation. MUST connect logically to first_frame_image_prompt.]",
          "action": "[Action details. MUST append 'wearing same cloth'. If character is holding an object, MUST add 'character hold [object] entire time from start to end.'. Mention direct eye contact ONLY if speaking to camera.]",
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
          "first_frame_image_prompt": "[High-detail static scene description specifically designed to generate the first frame as an image. CRITICAL: You MUST explicitly append 'single frame only, perfectly textless, no split screen, no text or overlays'.]",
          "first_frame_visual": "[Description of the starting frame for video generation.]",
          "action": "[Action details. MUST append 'wearing same cloth'. If character is holding an object, MUST add 'character hold [object] entire time from start to end.'. Mention direct eye contact ONLY if speaking to camera.]",
          "audio": {
            "dialogue": "[[Speaker Name]]: '[Hindi script translation]'",
            "ambient": "[Ambient sound]",
            "sfx": "[Sound effects]"
          }
        }
      ],
      "negative_prompt": "no third hand, no things disappearing or evaporating, no character holding phone, no two phones, no object disappearing, no video anomaly, no glitches, no phone screen, phone showcase, text overlay, subtitles, on-screen text, smooth camera, studio setup, bright clean room, no model like woman, no jewelry focus,no urban setting, no CGI,no 3D render,no cartoon,no anime, plastic skin, wax-like texture, uncanny valley, jittery movement, sliding feet, teleporting limbs, extra fingers, morphing background, over-saturated colors, bloom effect, motion blur artifacts, robotic movement, frame skipping, floating objects. [For Movie/Authoritative styles, ALSO append: 'no looking at camera, no staring at lens, no eye contact with camera, no smiling at camera']."
    }
  - The 4 INTRO SHOTS rule is BYPASSED for this style.
  - CRITICAL: NO WINKING, NO SELFIE SHOTS. Ensure no character is winking and NO shot is a selfie in any segment.

CRITICAL: VISUAL CONTINUITY & SINGLE VIDEO FLOW
- The visuals MUST connect. This is a SINGLE VIDEO, not a collection of random images.
- BACKGROUND PERSISTENCE: You MUST "remember" the environment. If a scene starts in a room with a specific blue wall and a steel almirah, that almirah and wall color MUST be referenced in subsequent shots in that same room.
- Establish a consistent visual language, recurring motifs, matching lighting setups, and logical transitions between cuts.
- Ensure the sequence feels like a continuous storyboard/moodboard flowing from one scene to the next, as if filmed in the same real-life location.
- ENVIRONMENT DEFINITION: In all styles, the environment (Modest Indian setting) MUST be script-driven. If the script is outdoors, the environment is outdoors. If the script is in a shop, the environment is a shop. DO NOT default to a home setting.

CRITICAL: ABSOLUTE MANDATE FOR NEGATIVE PROMPTS IN JSON
For every segment using a JSON style, the root of the JSON object MUST contain a key named "negative_prompt". This key MUST contain the following text: "no third hand, no things disappearing or evaporating, no character holding phone, no two phones, no object disappearing, no video anomaly, no glitches, no phone screen, phone showcase, text overlay, subtitles, on-screen text, smooth camera, studio setup, bright clean room, no model like woman, no jewelry focus,no urban setting, no CGI,no 3D render,no cartoon,no anime, plastic skin, wax-like texture, uncanny valley, jittery movement, sliding feet, teleporting limbs, extra fingers, morphing background, over-saturated colors, bloom effect, motion blur artifacts, robotic movement, frame skipping, floating objects."
- For "Movie" and "Authoritative Speaker" styles, you MUST ALSO ADD: ", no looking at camera, no staring at lens, no eye contact with camera, no smiling at camera" to the end of that string.
- This is MANDATORY for every single prompt. DO NOT skip it.

PHASE 0: THE MASTER MOODBOARD COLLAGE (MANDATORY)
- You MUST start with "Segment 0: Master Moodboard".
- For "Ready to Go" and "Sora Prompt" styles, you MUST provide TWO moodboards: Segment 0 (Characters) and Segment 1 (Backgrounds).
- PROMPT FOR MOODBOARDS: Create high-resolution, well-defined grid-style collages that serve as the visual blueprint for the entire video. Ensure there are NO BORDERS or white borders between the grid elements; it should be a clean, seamless visual reference.
- CONTENT OF COLLAGE:
  1. CLOSE-UP PORTRAITS: High-detail close-up shots of every main character in the story. 
     - For "Ready to Go" style: Analyze the script for the number of characters. If 1 character, provide a 2x2 grid of that character (straight, side, mid, full body). If 2 characters, provide both characters' profiles with their respective 4 shots.
     - For other styles: Provide high-detail close-up shots of every main character.
     - Each portrait must have the character's name clearly written in floating text directly inside the image above their head.
  2. SCRIPT-DRIVEN BACKGROUNDS: Include distinct, clear shots ONLY for the specific environments, locations, or settings that are EXPLICITLY required by the script (e.g., "BG 1: Busy Street", "BG 2: Local Shop"). DO NOT default to room/home interiors unless the script specifically takes place there. EXPLORE VARIETY: Avoid repetitive "blue house" or "clean room" backgrounds. If the script is entirely b-roll or abstract, focus on textures or thematic visual elements instead of generic rooms. Each background shot MUST have its "Background Number" (e.g., "BG 1", "BG 2") clearly written in floating text directly inside the image.
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
1. SUBJECT DEFINITION: Describe the scene. This MUST be a single frame shot, no split screen (except for Segment 0). If "UGC (Vlog Style)" is selected, the character (Regular Indian, matching Segment 0) MUST be speaking directly to the camera in a vlog/selfie format. CRITICAL: In this format, the phone itself MUST NOT be visible; it is a POV shot from the phone's lens. If "Conversation" is selected, describe two characters facing each other at a close distance, bodies oriented towards each other, engaged in talking (no extra objects or activities). If "B-Roll Focus" is selected, focus on cinematic action, objects, or environments where the character is acting out the scene (no direct eye contact). If "Storytelling Narrative" is selected, the character MUST NOT look into the camera; focus on their actions and interactions within the scene. Otherwise, describe the characters (using their names from Segment 0) and environment (Modest Desi Setting). If the product is in the scene, just reference the provided product image. CRITICAL: Whenever you refer to a character by name, you MUST append their outfit color and "(same exact character as reference)" immediately after the name (e.g., "Rajesh in a blue shirt (same exact character as reference)"). This is especially CRITICAL in scenes with multiple characters to ensure visual distinction.
2. ACTION & POSTURE: Define the exact kinetic energy or active posture. Characters MUST be doing something natural (walking, working, minor household chores) while in the scene. DESCRIBE the physical action in detail to ensure no static posing. For UGC, describe natural hand gestures and candid movements that happen while talking. Avoid over-mentioning phones.
3. ENVIRONMENT: A tangible, high-concept space (Modest Indian setting). You MUST explicitly reference the "Background Number" from Segment 0 (e.g., "Use Background 2 from Segment 0"). CRITICAL: Every environment MUST include background characters (e.g., "neighbors passing by", "a street vendor in the distance", "children playing in the background") and dynamic background elements (e.g., "swaying trees", "dust particles in sunlight") to ensure it feels like a live, real-world location. For "Conversation" style, maintain the spatial logic of the "270-degree environment shot" while adding these background life elements.
4. MOOD & STORY: The emotional subtext.
5. VISUAL STYLE: Specify the exact medium based on the requested VIDEO STYLE. If "Raw Android Shot", emphasize cheap android phone camera aesthetics (specifying model numbers like Redmi 8 or Vivo Y12S) (realistic, slightly low-res, raw photography, not too sharp). For selfie/vlog shots, the phone MUST NOT be visible. If "UGC (Vlog Style)", emphasize handheld vlog/selfie aesthetics with a consistent environment matching Segment 0. If the segment is a "[Repeat Camera Angle]", ensure the camera position and framing exactly match the previous instance.
6. LIGHTING & COLOR: Define the setup and color theory (keep consistent across the moodboard). For UGC, use natural, uncorrected lighting. For cinematic styles, ensure the lighting matches the TIME-OF-DAY logic established in the script analysis (e.g., if it's 2 AM, specify "pitch black environment with only a single dim blue moonlight source" or "dark room with orange street-light spill").
7. CAMERA & LENS PHYSICS: Specify camera, lens, and aperture. For Android/UGC style, use basic android phone lens specs (e.g., 26mm, f/1.8, mentioning specific models like Oppo A54 or Lenovo M10) and mention handheld jitter, but ensure the phone itself is NOT in shot for selfie/vlog framing. Mention the character looking directly into the lens. Emphasize a "normal" android phone look—not too sharp, realistic, with a raw photography feel. For "Storytelling Narrative" and "B-Roll Focus" (after the intro), use cinematic lens specs (e.g., 35mm, 50mm, 85mm) and ensure the character is NOT looking into the lens.
8. TEXTURE & PBR: Micro-details and materials.
9. NEGATIVE CONSTRAINTS: For all segments EXCEPT Segment 0, you MUST append: "--no split screen, no collage, no grid, no multiple views, no multiple panels, no multiple frames, single frame only, no indoor plants, no decorative vases, no modern art, no luxury furniture, no designer sofas, no broken walls, no extreme poverty, no plastic skin, glossy, overly smooth, artificial lighting, 3D render, cartoonish, arbitrary placement, centered framing, stock photography vibe, no winking, no winks, over-sharpened, high-end DSLR look, professional studio lighting, CGI, 3D render, cartoon, anime, wax-like texture, uncanny valley, jittery movement, sliding feet, teleporting limbs, extra fingers, morphing background, over-saturated colors, bloom effect, motion blur artifacts, robotic movement, frame skipping, floating objects. MUST follow real life physics."
10. FINAL CONSISTENCY CHECK: At the absolute end of EVERY prompt (after the negative constraints), you MUST append the exact sentence: "Make sure to use same exact character as given in reference"

CRITICAL: OUTPUT FORMAT
- CHARACTER NAME CONSISTENCY (MANDATORY): EVERY TIME you mention a character's name in ANY prompt, you MUST append their outfit and the exact phrase " (same exact character as reference)". DO NOT skip this under any circumstances. It must be present in every single mention.
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
  const [extraPromptText, setExtraPromptText] = useState('');
  const [isGeneratingExtra, setIsGeneratingExtra] = useState(false);

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
        
        SCRIPT UNDERSTANDING (CRITICAL): Analyze the script first. 
        - The first segment MUST be a "Hook" that grabs attention.
        - If the script is a conversation between two or more people, use the "Character Name: Dialogue" format (e.g., "Rajesh: नमस्ते, कैसे हो?").
        - If it is a single person speaking or a narrator, just provide the dialogue text. 
        - DO NOT force a conversation format if the script does not naturally have one.
        
        For each segment, provide:
        1. A title in the format "Prompt 1", "Prompt 2", etc.
        2. The script text (MUST be in Hindi as provided).
        3. A creative B-roll idea that visually represents that part of the script.
        
        CRITICAL: Never mention "animation" or "animated" in the B-roll ideas.
        
        Format the output as a JSON object with a "segments" array containing objects with "title", "script" and "broll" fields.
        
        SCRIPT: ${idea}
        VIDEO STYLE: ${videoStyle}`;
      } else {
        prompt = `You are a script analyst. Divide the following script into logical segments for a video.
        
        CRITICAL: You MUST NOT skip or miss any part of the script. The segments MUST cover the entire script from the first word to the last word in exact sequence.
        CRITICAL: DO NOT REFORM OR REPHRASE DIALOGUES. You must use the exact lines, words, and sentences from the script. Never add or remove any words.
        
        NARRATOR ANALYSIS: Analyze if the script is first-person (the character telling their own story) or third-person (a narrator telling someone else's story).
        
        The first segment in "dialogueSegments" MUST be a "Hook".
        
        For "${videoStyle}", you MUST provide TWO separate lists:
        1. "dialogueSegments": 
           - For "Only B-roll": Leave this list COMPLETELY EMPTY [].
           - For "Storytelling": A list of segments where the character speaks to the camera (UGC style). 
             - If first-person, the main character is the speaker. 
             - If third-person, a separate narrator is the speaker.
             - Include basic activities for the speaker (e.g., walking, adjusting clothes, fixing hair) that fit the script.
           - For "Conversation": A list of segments where characters talk to EACH OTHER (NOT to the camera).
           - For "Movie": A list of segments formatted as cinematic movie scenes. Characters interact with each other or the environment, NOT the camera (unless specified). If one character speaks and another is present, explicitly note the other is "listening silently".
           - For "Authoritative Speaker": A list of segments formatted for an authoritative speaker at a fixed location talking to a listening party, changing only the camera angles around them.
           - CRITICAL: In the "script" field, you MUST include the character's name followed by their dialogue in Hindi (e.g., "Rajesh: नमस्ते, कैसे हो?").
           - CRITICAL: These segments MUST cover the entire script sequentially without skipping any lines. Every single sentence of the script MUST be included in the "script" field of these segments in the exact order they appear.
           - Each segment should have a "title" like "Prompt 1", "Prompt 2", etc.
        2. "brollSegments": A list of cinematic B-roll segments that visually narrate the story. These should be "small cuts" of activities or actions. Provide only a short "broll" description.
           - For "Only B-roll": Provide a COMPLETE start-to-end visual narrative using ONLY B-roll segments (at least 10-12 segments). These MUST cover the entire script sequentially without any skipping.
           - CRITICAL: These segments MUST visually narrate the entire script from start to finish in sequence. Every part of the story MUST have a corresponding B-roll segment.
           - CRITICAL: Never mention "animation" or "animated" in the B-roll descriptions.
           - CRITICAL: DO NOT include B-rolls showing "downloading master app" or "1 rs trial".
           - Each segment should have a "title" like "B-Roll Prompt 1", "B-Roll Prompt 2", etc.
        
        CRITICAL: For "${videoStyle}", if it is "Only B-roll", you MUST generate a high volume of ONLY B-roll segments (at least 10-12 segments). For any other style, you MUST generate both "dialogueSegments" and "brollSegments" (at least 7-8 B-roll segments) to ensure a rich visual narrative that covers EVERY SINGLE LINE of the script from start to finish in sequence. DO NOT skip any part of the story.
        
        CRITICAL: Never mention "animation" or "animated" in any part of the output.
        
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
    setEditableSegments([...editableSegments, { title: `Prompt ${editableSegments.length + 1}`, script: '', broll: '' }]);
  };

  const addDialogueSegment = () => {
    setEditableDialogueSegments([...editableDialogueSegments, { title: `Prompt ${editableDialogueSegments.length + 1}`, script: '', broll: '' }]);
  };

  const addBrollSegment = () => {
    setEditableBrollSegments([...editableBrollSegments, { title: `B-Roll Prompt ${editableBrollSegments.length + 1}`, script: '', broll: '' }]);
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
        { text: `USER SCRIPT PLAN: ${plan}\nVIDEO STYLE: ${videoStyle}${imageText ? `\nREQUIRED TEXT CONTENT (USE EXACTLY AS IS, DO NOT ALTER): "${imageText}"` : ''}\n\nBased on the provided USER SCRIPT PLAN, generate the final hyper-detailed structured prompts.\nCRITICAL MAPPING RULE: The "USER SCRIPT PLAN" is your ABSOLUTE structure. \n- You MUST map EVERY single item in "dialogueSegments" to a dialogue scene in the prompt sequentially, and EVERY single item in "brollSegments" to a B-roll scene sequentially. \n- DO NOT generate scenes from the raw script logic—you MUST use these exact edited segments 1-to-1. \n- DO NOT merge, skip, or create new segments. \n- REPHRASING IS STRICTLY FORBIDDEN: You must use the exact edited lines and words from the provided plan.` }
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
                      description: "The final multi-part architectural prompt. For all 'Veo 3.1 JSON' styles, this MUST be a VALID stringified JSON object following the EXACT template defined in the instructions. CRITICAL: You MUST include the full 'negative_prompt' key at the root of this JSON for EVERY segment (except Moodboards). Failure to include the full negative prompt list is a critical failure."
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

  const handleCopyPrompt = async (prompt: string, index: number) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleGenerateExtra = async () => {
    if (!extraPromptText.trim()) return;
    setIsGeneratingExtra(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const lastContext = segments.length > 0 
        ? `Last segment summary: ${segments[segments.length - 1].visualCue}` 
        : `Overall analysis: ${analysis}`;

      const prompt = `Based on the following request: "${extraPromptText}"
      Context: ${lastContext}
      Generate ONE (1) additional prompt segment following the exact video style: ${videoStyle}.
      Output MUST be a single segment object that can be added to the current segments array.
      Use the same format: { "timestamp": "...", "scriptText": "...", "visualCue": "...", "prompt": "..." }
      
      CRITICAL: If the style is 'Veo 3.1 JSON', the 'prompt' field MUST be a stringified JSON object following the same rules as the original prompts.`;

      const result = await ai.models.generateContent({
        model: selectedModel,
        contents: { parts: [{ text: prompt }] },
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json"
        }
      });

      const newSegment = JSON.parse(result.text || '{}');
      setSegments([...segments, newSegment]);
      setExtraPromptText('');
    } catch (err) {
      console.error("Failed to generate extra prompt:", err);
      setError("Failed to generate additional content.");
    } finally {
      setIsGeneratingExtra(false);
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
    <div className="min-h-screen text-white/90 selection:bg-accent/30 selection:text-highlight flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="w-full flex flex-col sm:flex-row justify-between items-center px-4 sm:px-12 py-8 font-mono-label z-50">
        <div className="flex items-center gap-3 text-white font-bold tracking-widest text-sm mb-4 sm:mb-0">
          <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          RECRAFT V4
        </div>
        <div className="tracking-[0.2em] text-accent font-semibold text-center mb-4 sm:mb-0">AI CREATIVE DIRECTOR</div>
        <div className="hidden lg:flex gap-6 opacity-60 text-[10px]">
          <span>VS.8.0</span>
          <span>ENGINE: GEMINI 3.0</span>
          <span>STATUS: AUTONOMOUS</span>
        </div>
      </nav>

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-8 pb-32 flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="text-center py-20 w-full relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[300px] bg-accent/10 blur-[130px] pointer-events-none rounded-full" />
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-[0.02em] text-white mb-6 relative z-10 leading-tight">
            Harness Advanced Visual<br />Synthesis for Recraft V4.
          </h1>
        </div>

        {/* Core Controls */}
        <div className="w-full space-y-12 max-w-[900px] relative z-10">
          
          {/* Script Input Panel */}
          <div className="cyber-panel cyber-glowing relative overflow-hidden transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />
            <div className="p-8 sm:p-10">
              <div className="flex items-center justify-between mb-8">
                <span className="font-mono-label text-white tracking-widest">VIDEO SCRIPT</span>
                <button 
                  onClick={handleClear} 
                  className="flex items-center gap-2 cyber-button px-5 py-2.5 text-[10px] font-mono hover:bg-white/10 uppercase transition-all tracking-widest text-white/70 hover:text-white"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg> 
                  CLEAR ALL
                </button>
              </div>
              <textarea 
                className="input-transparent w-full min-h-[160px] resize-none text-lg leading-relaxed placeholder:text-white/20 focus:text-white transition-colors"
                placeholder="Paste your video script here. I will segment it and generate visual prompts..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-16" />

          {/* AI Engine Selection */}
          <div className="space-y-6">
            <div className="font-mono-label pl-2">CHOOSE YOUR AI ENGINE</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MODELS.map(model => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className={`cyber-button py-6 px-6 text-[13px] font-medium tracking-wide flex items-center justify-center ${selectedModel === model ? 'active' : ''}`}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>

          {/* Video Style Selection */}
          <div className="space-y-6 pt-4">
            <div className="font-mono-label pl-2">DEFINE VIDEO STYLE & DIRECTION</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VIDEO_STYLES.map(style => (
                <button
                  key={style}
                  onClick={() => setVideoStyle(style)}
                  className={`cyber-button py-6 px-6 text-[13px] font-medium tracking-wide flex justify-center items-center ${videoStyle === style ? 'active flex flex-col' : ''}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Product Reference */}
          <div className="space-y-6 pt-4">
            <div className="font-mono-label pl-2">ADD PRODUCT REFERENCE (OPTIONAL)</div>
            <div className="relative group w-full">
              {!referenceImage ? (
                <label 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="flex flex-col items-center justify-center w-full h-36 cyber-button cursor-pointer hover:border-accent hover:bg-accent/5 transition-all group border-dashed border-white/20 hover:border-accent/50"
                >
                  <svg className="w-6 h-6 text-white/30 mb-4 group-hover:text-accent transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                  <span className="font-mono-label text-[10px] group-hover:text-white transition-colors tracking-widest text-white/40">PASTE, DRAG & DROP OR CLICK TO UPLOAD</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              ) : (
                <div className="relative w-full h-40 cyber-panel overflow-hidden flex justify-center items-center border border-accent/40 bg-black/50">
                  <img src={referenceImage} alt="Reference" className="h-full object-contain" />
                  <button 
                    onClick={() => setReferenceImage(null)}
                    className="absolute top-4 right-4 p-2 bg-black/80 rounded-full text-white hover:bg-red-500/80 transition-all border border-white/10"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Analyze or Structural Plan Edit */}
          {!isAnalyzing ? (
            <div className="pt-12 w-full flex justify-center">
              <button 
                onClick={analyzeScript}
                disabled={loading || !idea.trim()}
                className="cyber-button active w-full py-8 flex items-center justify-center gap-4 text-sm font-bold tracking-widest disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    INITIALIZE ARCHITECTURAL ANALYSIS
                  </>
                )}
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12 mt-20 pt-16 border-t border-white/5"
            >
              <div className="flex flex-col items-center gap-4 mb-16">
                <div className="font-mono-label text-highlight tracking-[0.2em] shadow-accent/20">ANALYSIS COMPLETE. STRUCTURAL PLAN.</div>
                <p className="text-[13px] font-mono text-muted text-center italic max-w-2xl leading-relaxed">
                  "{analysis}"
                </p>
              </div>
              
              {videoStyle === "Veo 3.1 JSON" ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-2">
                    <span className="font-mono-label text-white">SCENE SEQUENCES</span>
                    <button onClick={addEditableSegment} className="cyber-button px-4 py-2 text-xs flex items-center gap-2 hover:text-white">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg> 
                      ADD SCENE
                    </button>
                  </div>
                  <div className="space-y-6">
                    {editableSegments.map((seg, idx) => (
                      <div key={idx} className="cyber-panel p-8 space-y-8 relative group border-white/5 hover:border-accent/30 transition-colors bg-white/[0.01]">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <span className="font-mono-label text-accent">SEQUENCE {idx + 1}</span>
                          <button onClick={() => removeEditableSegment(idx)} className="p-2 text-red-500/40 hover:text-red-400 rounded transition-all">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <label className="font-mono-label block mb-4 opacity-50">DIALOGUE / NARRATIVE</label>
                            <textarea 
                              className="input-transparent w-full min-h-[140px] resize-none text-sm leading-relaxed border border-white/10 hover:border-white/20 focus:border-accent/50 rounded-lg p-5 cyber-button transition-all"
                              value={seg.script}
                              onChange={(e) => updateEditableSegment(idx, 'script', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="font-mono-label block mb-4 opacity-50">VISUAL ACTION (B-ROLL)</label>
                            <textarea 
                              className="input-transparent w-full min-h-[140px] resize-none text-sm leading-relaxed border border-white/10 hover:border-white/20 focus:border-accent/50 rounded-lg p-5 cyber-button transition-all"
                              value={seg.broll}
                              onChange={(e) => updateEditableSegment(idx, 'broll', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-16">
                  {videoStyle !== "Veo 3.1 JSON Only B-roll" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center px-2 border-b border-white/5 pb-4">
                        <span className="font-mono-label text-white">DIALOGUE SEQUENCES</span>
                        <button onClick={addDialogueSegment} className="cyber-button px-4 py-2 text-xs flex items-center gap-2 hover:text-white">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg> 
                          ADD DIALOGUE
                        </button>
                      </div>
                      <div className="space-y-4">
                        {editableDialogueSegments.map((seg, idx) => (
                          <div key={idx} className="cyber-panel p-6 relative group bg-white/[0.01]">
                            <button onClick={() => removeDialogueSegment(idx)} className="absolute top-6 right-6 p-1 text-red-500/40 hover:text-red-500 transition-all rounded">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                            <label className="font-mono-label block mb-4 opacity-50">DIALOGUE LINE {idx+1}</label>
                            <textarea 
                              className="input-transparent w-full min-h-[80px] resize-none text-sm leading-relaxed"
                              value={seg.script}
                              onChange={(e) => updateDialogueSegment(idx, e.target.value)}
                              placeholder="Enter dialogue line..."
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {videoStyle !== "Veo 3.1 JSON Storytelling" && videoStyle !== "Veo 3.1 JSON Authoritative Speaker" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center px-2 border-b border-white/5 pb-4">
                        <span className="font-mono-label text-white">VISUAL B-ROLL SEQUENCES</span>
                        <button onClick={addBrollSegment} className="cyber-button px-4 py-2 text-xs flex items-center gap-2 hover:text-white">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg> 
                          ADD B-ROLL
                        </button>
                      </div>
                      <div className="space-y-4">
                        {editableBrollSegments.map((seg, idx) => (
                          <div key={idx} className="cyber-panel p-6 relative group bg-white/[0.01]">
                            <button onClick={() => removeBrollSegment(idx)} className="absolute top-6 right-6 p-1 text-red-500/40 hover:text-red-500 transition-all rounded">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                            <label className="font-mono-label block mb-4 opacity-50">VISUAL SHOT {idx+1}</label>
                            <textarea 
                              className="input-transparent w-full min-h-[80px] resize-none text-sm leading-relaxed"
                              value={seg.broll}
                              onChange={(e) => updateBrollSegment(idx, e.target.value)}
                              placeholder="Enter visual action..."
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-6 pt-12">
                <button 
                  onClick={() => setIsAnalyzing(false)} 
                  className="cyber-button flex-1 py-6 font-mono-label hover:text-white tracking-[0.15em] text-[11px]"
                >
                  REVISE INITIAL INPUT
                </button>
                <button 
                  onClick={generatePrompt} 
                  disabled={loading} 
                  className="cyber-button active flex-[2] py-6 font-bold flex justify-center items-center gap-3 text-sm tracking-[0.15em] transition-all"
                >
                  {loading ? <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> : <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
                  SYNTHESIZE FINAL BLUEPRINTS
                </button>
              </div>
            </motion.div>
          )}

          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-20" />

          {/* Output Section */}
          <div className="w-full relative space-y-12">
            <div className="flex flex-col items-center">
              <div className="flex gap-4 mb-6 text-white/50">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </div>
              <div className="font-mono-label text-white tracking-[0.2em] mb-4">ARCHITECTURAL BLUEPRINTS (SEGMENTS)</div>
            </div>

            {segments.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-10 opacity-60">
                <div className="w-24 h-24 border border-accent/40 rounded-2xl shadow-[0_0_40px_rgba(72,168,154,0.15)] flex items-center justify-center bg-black/50">
                  <div className="w-10 h-10 border border-white/20 rounded animate-pulse" />
                </div>
                <div className="font-mono text-sm tracking-[0.1em] text-white/60">Awaiting architectural directives</div>
              </div>
            ) : loading && segments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-8">
                <div className="w-16 h-16 border-2 border-white/10 border-t-accent rounded-full animate-spin" />
                <div className="font-mono-label text-accent animate-pulse tracking-[0.2em]">SYNTHESIZING VISUAL MATRIX...</div>
              </div>
            ) : (
              <div className="space-y-12 shrink-0">
                {segments.map((segment, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className={`cyber-panel relative overflow-hidden group/card cursor-pointer transition-all duration-300 ${copiedIndex === idx ? 'border-accent shadow-[0_0_30px_rgba(72,168,154,0.25)]' : 'hover:border-accent/40'}`}
                    onClick={() => handleCopyPrompt(segment.prompt, idx)}
                  >
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover/card:opacity-100 transition-all flex items-center justify-center z-10 duration-300 delay-75">
                      <div className="cyber-button active px-8 py-4 font-mono-label text-[13px] flex items-center gap-3 shadow-[0_0_30px_rgba(72,168,154,0.2)]">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> 
                        CLICK ANYWHERE TO COPY PROMPT
                      </div>
                    </div>

                    {copiedIndex === idx && (
                      <div className="absolute top-6 right-6 z-20 bg-accent text-black px-4 py-1.5 rounded-full font-bold text-[9px] tracking-[0.2em] flex items-center gap-2 shadow-[0_0_15px_rgba(72,168,154,0.5)]">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> 
                        COPIED
                      </div>
                    )}

                    <div className="p-8 md:p-12 relative z-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10 border-b border-white/5 pb-8">
                        <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-accent font-mono-label text-xl shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <span className="font-mono-label text-white/40 block mb-2 tracking-[0.2em]">TIMECODE {segment.timestamp}</span>
                          <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide leading-tight">{segment.visualCue}</h3>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
                        <div className="md:col-span-4">
                          <div className="font-mono-label mb-5 opacity-60">NARRATIVE CONTEXT</div>
                          <p className="text-[13px] leading-relaxed italic text-white/50 border-l border-accent/30 pl-5 pr-2">{segment.scriptText}</p>
                        </div>
                        <div className="md:col-span-8 bg-black/40 p-6 rounded-xl border border-white/5">
                          <div className="font-mono-label mb-5 text-accent opacity-80">GENERATED PAYLOAD</div>
                          {renderPrompt(segment.prompt)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Extra Prompt Generation */}
                <div className="cyber-panel p-8 md:p-12 mt-16 border-dashed border-white/10 bg-black/20 hover:border-white/30 transition-all relative z-10">
                  <div className="font-mono-label text-white mb-6 tracking-widest flex items-center gap-3">
                    <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                    APPEND ADDITIONAL CONTEXT
                  </div>
                  <div className="space-y-6">
                    <textarea 
                      className="input-transparent w-full min-h-[140px] resize-none text-sm leading-relaxed cyber-button p-6 border-white/5 hover:border-white/20 focus:border-accent/40"
                      placeholder="e.g., Detail a complex hero shot pushing in from a wide angle, adjusting the lighting..."
                      value={extraPromptText}
                      onChange={(e) => setExtraPromptText(e.target.value)}
                    />
                    <button 
                      onClick={handleGenerateExtra}
                      disabled={isGeneratingExtra || !extraPromptText.trim()}
                      className="cyber-button w-full py-5 flex items-center justify-center gap-3 font-mono-label hover:border-accent hover:text-accent transition-all text-[11px] tracking-widest bg-white/[0.02]"
                    >
                      {isGeneratingExtra ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
                      SYNTHESIZE & APPEND
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* History Area */}
        {history.length > 0 && (
          <div className="w-full space-y-12 mt-24 relative z-10">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16" />
            <div className="font-mono-label text-center mb-12 tracking-[0.2em] text-white/50">ARCHITECTURAL HISTORY</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-[900px] mx-auto w-full">
              {history.slice(0, 6).map((item, idx) => (
                 <div 
                   key={idx} 
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
                        setSegments(Array.isArray(parsed) ? parsed : [{ timestamp: "0:00", scriptText: "", visualCue: "Legacy Prompt", prompt: item.prompt }]);
                      } catch {
                        setSegments([{ timestamp: "0:00", scriptText: "", visualCue: "Legacy Prompt", prompt: item.prompt }]);
                      }
                      setAnalysis(item.analysis || '');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                   }} 
                   className="cyber-panel p-6 cursor-pointer hover:border-accent border-white/5 text-left bg-black/40 transition-all hover:bg-black/80"
                 >
                    <div className="font-mono-label text-[9px] mb-4 text-accent/70">{new Date(item.timestamp).toLocaleDateString()}</div>
                    <div className="text-sm text-white/90 font-bold truncate mb-3">{item.idea}</div>
                    <div className="text-[10px] text-white/40 font-mono leading-relaxed line-clamp-2">
                       {(() => {
                        try {
                          const parsed = JSON.parse(item.prompt);
                          return Array.isArray(parsed) ? `${parsed.length} Generated Segments` : item.prompt;
                        } catch { return item.prompt; }
                       })()}
                    </div>
                 </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Minimalism Footer */}
      <footer className="w-full py-10 mt-auto text-center text-[9px] font-mono-label tracking-[0.3em] opacity-40">
        MINIMALIST FOOTER &copy; 2026
      </footer>

    </div>
  );
}
