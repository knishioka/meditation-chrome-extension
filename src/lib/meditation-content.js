import { MEDITATION_TYPES, LANGUAGES } from '@config/constants';

class MeditationContent {
  constructor() {
    this.scripts = {
      [LANGUAGES.EN]: {
        [MEDITATION_TYPES.BREATH_AWARENESS]: this.getBreathAwarenessScriptEN(),
        [MEDITATION_TYPES.BODY_SCAN]: this.getBodyScanScriptEN(),
        [MEDITATION_TYPES.LOVING_KINDNESS]: this.getLovingKindnessScriptEN(),
        [MEDITATION_TYPES.MINDFULNESS]: this.getMindfulnessScriptEN(),
      },
      [LANGUAGES.JA]: {
        [MEDITATION_TYPES.BREATH_AWARENESS]: this.getBreathAwarenessScriptJA(),
        [MEDITATION_TYPES.BODY_SCAN]: this.getBodyScanScriptJA(),
        [MEDITATION_TYPES.LOVING_KINDNESS]: this.getLovingKindnessScriptJA(),
        [MEDITATION_TYPES.MINDFULNESS]: this.getMindfulnessScriptJA(),
      },
    };
  }

  getScript(type, language, duration) {
    const baseScript = this.scripts[language]?.[type] || this.scripts[LANGUAGES.EN][MEDITATION_TYPES.BREATH_AWARENESS];
    return this.adjustScriptForDuration(baseScript, duration);
  }

  adjustScriptForDuration(script, durationMinutes) {
    const segments = script.segments;
    const totalSegments = segments.length;
    const durationMs = durationMinutes * 60 * 1000;
    
    // Calculate time per segment
    let timePerSegment = durationMs / totalSegments;
    
    // Adjust for intro and outro (they should be fixed duration)
    const introTime = 60000; // 1 minute for intro
    const outroTime = 60000; // 1 minute for outro
    const mainTime = durationMs - introTime - outroTime;
    
    const adjustedSegments = segments.map((segment, index) => {
      let timing;
      if (index === 0) {
        // Intro
        timing = introTime;
      } else if (index === segments.length - 1) {
        // Outro
        timing = outroTime;
      } else {
        // Main segments
        timing = mainTime / (totalSegments - 2);
      }
      
      return {
        ...segment,
        duration: timing,
      };
    });
    
    return {
      ...script,
      segments: adjustedSegments,
      totalDuration: durationMs,
    };
  }

  // English Scripts
  getBreathAwarenessScriptEN() {
    return {
      title: 'Breath Awareness Meditation',
      segments: [
        {
          type: 'intro',
          text: 'Welcome to your breath awareness meditation. Find a comfortable position, either sitting or lying down. Gently close your eyes, or soften your gaze downward.',
          pauseAfter: 5000,
        },
        {
          type: 'instruction',
          text: 'Begin by taking a deep breath in through your nose... and slowly release it through your mouth.',
          pauseAfter: 8000,
        },
        {
          type: 'instruction',
          text: 'Take another deep breath in... and let it go.',
          pauseAfter: 8000,
        },
        {
          type: 'instruction',
          text: 'Now allow your breathing to return to its natural rhythm. Simply observe each breath as it flows in and out.',
          pauseAfter: 15000,
        },
        {
          type: 'guidance',
          text: 'Notice the sensation of the breath entering your nostrils. Feel the cool air as you breathe in.',
          pauseAfter: 10000,
        },
        {
          type: 'guidance',
          text: 'Notice the warm air as you breathe out. Feel the gentle rise and fall of your chest or belly.',
          pauseAfter: 15000,
        },
        {
          type: 'reminder',
          text: 'If your mind wanders, that's okay. Gently bring your attention back to your breath. This is normal and part of the practice.',
          pauseAfter: 20000,
        },
        {
          type: 'silence',
          text: '',
          pauseAfter: 30000,
        },
        {
          type: 'guidance',
          text: 'Continue breathing naturally. Stay present with each breath.',
          pauseAfter: 20000,
        },
        {
          type: 'silence',
          text: '',
          pauseAfter: 20000,
        },
        {
          type: 'guidance',
          text: 'Notice how your body feels right now. Relaxed. Calm. At peace.',
          pauseAfter: 15000,
        },
        {
          type: 'outro',
          text: 'Begin to deepen your breath once again. Take a deep breath in... and out.',
          pauseAfter: 8000,
        },
        {
          type: 'outro',
          text: 'When you feel ready, gently open your eyes. Thank you for practicing breath awareness meditation.',
          pauseAfter: 5000,
        },
      ],
    };
  }

  getBodyScanScriptEN() {
    return {
      title: 'Body Scan Meditation',
      segments: [
        {
          type: 'intro',
          text: 'Welcome to your body scan meditation. Lie down comfortably on your back, arms at your sides, palms facing up. Close your eyes.',
          pauseAfter: 5000,
        },
        {
          type: 'instruction',
          text: 'Take three deep breaths, releasing any tension with each exhale.',
          pauseAfter: 10000,
        },
        {
          type: 'guidance',
          text: 'Bring your attention to your feet. Notice any sensations in your toes, the soles of your feet, your heels.',
          pauseAfter: 15000,
        },
        {
          type: 'guidance',
          text: 'Now move your awareness up to your ankles and calves. Simply observe without judgment.',
          pauseAfter: 15000,
        },
        {
          type: 'guidance',
          text: 'Continue scanning up through your knees, thighs, and hips. Notice any areas of tension or relaxation.',
          pauseAfter: 20000,
        },
        {
          type: 'guidance',
          text: 'Bring your attention to your abdomen and lower back. Feel the gentle rise and fall with each breath.',
          pauseAfter: 15000,
        },
        {
          type: 'guidance',
          text: 'Move your awareness to your chest, shoulders, and upper back. Allow these areas to soften and relax.',
          pauseAfter: 15000,
        },
        {
          type: 'guidance',
          text: 'Notice your arms, from shoulders to fingertips. Let them feel heavy and relaxed.',
          pauseAfter: 15000,
        },
        {
          type: 'guidance',
          text: 'Finally, bring attention to your neck, face, and head. Release any tension in your jaw, forehead, and scalp.',
          pauseAfter: 15000,
        },
        {
          type: 'outro',
          text: 'Take a moment to feel your whole body, relaxed and at ease. When you are ready, slowly open your eyes and gently move your fingers and toes.',
          pauseAfter: 5000,
        },
      ],
    };
  }

  getLovingKindnessScriptEN() {
    return {
      title: 'Loving-Kindness Meditation',
      segments: [
        {
          type: 'intro',
          text: 'Welcome to loving-kindness meditation. Sit comfortably with your back straight but relaxed. Close your eyes and take a few deep breaths.',
          pauseAfter: 5000,
        },
        {
          type: 'instruction',
          text: 'Begin by bringing to mind your own self. Picture yourself sitting here, present in this moment.',
          pauseAfter: 10000,
        },
        {
          type: 'guidance',
          text: 'Silently repeat these phrases: May I be happy. May I be healthy. May I be safe. May I live with ease.',
          pauseAfter: 20000,
        },
        {
          type: 'instruction',
          text: 'Now bring to mind someone you care about. Picture them clearly in your mind.',
          pauseAfter: 10000,
        },
        {
          type: 'guidance',
          text: 'Send them loving-kindness: May you be happy. May you be healthy. May you be safe. May you live with ease.',
          pauseAfter: 20000,
        },
        {
          type: 'instruction',
          text: 'Think of someone neutral in your life, perhaps someone you see but do not know well.',
          pauseAfter: 10000,
        },
        {
          type: 'guidance',
          text: 'Extend the same wishes to them: May you be happy. May you be healthy. May you be safe. May you live with ease.',
          pauseAfter: 20000,
        },
        {
          type: 'guidance',
          text: 'Finally, extend these wishes to all beings everywhere: May all beings be happy. May all beings be healthy. May all beings be safe. May all beings live with ease.',
          pauseAfter: 20000,
        },
        {
          type: 'outro',
          text: 'Rest in this feeling of universal loving-kindness for a moment. When you are ready, gently open your eyes.',
          pauseAfter: 5000,
        },
      ],
    };
  }

  getMindfulnessScriptEN() {
    return {
      title: 'Mindfulness Meditation',
      segments: [
        {
          type: 'intro',
          text: 'Welcome to mindfulness meditation. Sit comfortably with your spine upright. Let your eyes close gently.',
          pauseAfter: 5000,
        },
        {
          type: 'instruction',
          text: 'Begin by noticing your breath, without trying to change it. Simply observe its natural rhythm.',
          pauseAfter: 15000,
        },
        {
          type: 'guidance',
          text: 'Now expand your awareness to include sounds. Notice any sounds around you, near or far, without judging them.',
          pauseAfter: 20000,
        },
        {
          type: 'guidance',
          text: 'Bring your attention to physical sensations. Notice the feeling of your body against the chair or cushion, the temperature of the air on your skin.',
          pauseAfter: 20000,
        },
        {
          type: 'reminder',
          text: 'When thoughts arise, acknowledge them without judgment, and gently return your attention to the present moment.',
          pauseAfter: 25000,
        },
        {
          type: 'silence',
          text: '',
          pauseAfter: 30000,
        },
        {
          type: 'guidance',
          text: 'Continue to rest in open awareness, noticing whatever arises in your experience moment by moment.',
          pauseAfter: 20000,
        },
        {
          type: 'outro',
          text: 'Slowly bring your attention back to your breath. Take a deep breath in and out. When you feel ready, open your eyes.',
          pauseAfter: 5000,
        },
      ],
    };
  }

  // Japanese Scripts
  getBreathAwarenessScriptJA() {
    return {
      title: '呼吸瞑想',
      segments: [
        {
          type: 'intro',
          text: '呼吸瞑想へようこそ。楽な姿勢で座るか、横になってください。そっと目を閉じるか、視線を下に向けてください。',
          pauseAfter: 5000,
        },
        {
          type: 'instruction',
          text: '鼻から深く息を吸って... 口からゆっくりと吐き出します。',
          pauseAfter: 8000,
        },
        {
          type: 'instruction',
          text: 'もう一度、深く息を吸って... ゆっくりと吐き出します。',
          pauseAfter: 8000,
        },
        {
          type: 'instruction',
          text: '呼吸を自然なリズムに戻しましょう。息が入って、出ていくのをただ観察します。',
          pauseAfter: 15000,
        },
        {
          type: 'guidance',
          text: '鼻孔を通る息の感覚に気づいてください。吸う息の涼しさを感じます。',
          pauseAfter: 10000,
        },
        {
          type: 'guidance',
          text: '吐く息の温かさを感じます。胸やお腹の優しい上下の動きに気づいてください。',
          pauseAfter: 15000,
        },
        {
          type: 'reminder',
          text: '心がさまよったら、大丈夫です。優しく呼吸に注意を戻してください。これは普通のことで、練習の一部です。',
          pauseAfter: 20000,
        },
        {
          type: 'silence',
          text: '',
          pauseAfter: 30000,
        },
        {
          type: 'guidance',
          text: '自然に呼吸を続けます。一呼吸一呼吸と共に今ここにいます。',
          pauseAfter: 20000,
        },
        {
          type: 'silence',
          text: '',
          pauseAfter: 20000,
        },
        {
          type: 'guidance',
          text: '今の体の感覚に気づいてください。リラックスしています。穏やかです。平和です。',
          pauseAfter: 15000,
        },
        {
          type: 'outro',
          text: 'もう一度深く呼吸をしてください。深く息を吸って... ゆっくりと吐き出します。',
          pauseAfter: 8000,
        },
        {
          type: 'outro',
          text: '準備ができたら、ゆっくりと目を開けてください。呼吸瞑想の練習、ありがとうございました。',
          pauseAfter: 5000,
        },
      ],
    };
  }

  getBodyScanScriptJA() {
    return {
      title: 'ボディスキャン瞑想',
      segments: [
        {
          type: 'intro',
          text: 'ボディスキャン瞑想へようこそ。仰向けに楽に横たわり、腕は体の横に、手のひらを上に向けてください。目を閉じます。',
          pauseAfter: 5000,
        },
        {
          type: 'instruction',
          text: '深呼吸を3回して、吐く息と共に緊張を解放します。',
          pauseAfter: 10000,
        },
        {
          type: 'guidance',
          text: '足に注意を向けてください。つま先、足の裏、かかとの感覚に気づきます。',
          pauseAfter: 15000,
        },
        {
          type: 'guidance',
          text: '足首とふくらはぎに意識を移します。ただ判断せずに観察します。',
          pauseAfter: 15000,
        },
        {
          type: 'guidance',
          text: '膝、太もも、腰へとスキャンを続けます。緊張やリラックスしている部分に気づきます。',
          pauseAfter: 20000,
        },
        {
          type: 'guidance',
          text: 'お腹と腰に注意を向けます。呼吸と共に優しく上下する動きを感じます。',
          pauseAfter: 15000,
        },
        {
          type: 'guidance',
          text: '胸、肩、背中上部に意識を移します。これらの部分を柔らかくリラックスさせます。',
          pauseAfter: 15000,
        },
        {
          type: 'guidance',
          text: '肩から指先までの腕に気づきます。重く、リラックスしている感じを味わいます。',
          pauseAfter: 15000,
        },
        {
          type: 'guidance',
          text: '最後に、首、顔、頭に注意を向けます。顎、額、頭皮の緊張を解放します。',
          pauseAfter: 15000,
        },
        {
          type: 'outro',
          text: '全身がリラックスして楽になっているのを感じてください。準備ができたら、ゆっくりと目を開け、指や足の指を優しく動かしてください。',
          pauseAfter: 5000,
        },
      ],
    };
  }

  getLovingKindnessScriptJA() {
    return {
      title: '慈悲の瞑想',
      segments: [
        {
          type: 'intro',
          text: '慈悲の瞑想へようこそ。背筋を伸ばしてリラックスして座ります。目を閉じて、深呼吸を数回してください。',
          pauseAfter: 5000,
        },
        {
          type: 'instruction',
          text: 'まず自分自身を思い浮かべます。今ここに座っている自分の姿を心に描きます。',
          pauseAfter: 10000,
        },
        {
          type: 'guidance',
          text: '心の中で唱えます：私が幸せでありますように。私が健康でありますように。私が安全でありますように。私が安らかに生きられますように。',
          pauseAfter: 20000,
        },
        {
          type: 'instruction',
          text: '次に、大切な人を思い浮かべます。その人の姿を心にはっきりと描きます。',
          pauseAfter: 10000,
        },
        {
          type: 'guidance',
          text: 'その人に慈悲を送ります：あなたが幸せでありますように。あなたが健康でありますように。あなたが安全でありますように。あなたが安らかに生きられますように。',
          pauseAfter: 20000,
        },
        {
          type: 'instruction',
          text: '中立的な人、例えば見かけるけれどよく知らない人を思い浮かべます。',
          pauseAfter: 10000,
        },
        {
          type: 'guidance',
          text: '同じ願いをその人に送ります：あなたが幸せでありますように。あなたが健康でありますように。あなたが安全でありますように。あなたが安らかに生きられますように。',
          pauseAfter: 20000,
        },
        {
          type: 'guidance',
          text: '最後に、すべての生きとし生けるものに願いを広げます：すべての生命が幸せでありますように。すべての生命が健康でありますように。すべての生命が安全でありますように。すべての生命が安らかに生きられますように。',
          pauseAfter: 20000,
        },
        {
          type: 'outro',
          text: 'この普遍的な慈悲の感覚の中でしばらく休みます。準備ができたら、ゆっくりと目を開けてください。',
          pauseAfter: 5000,
        },
      ],
    };
  }

  getMindfulnessScriptJA() {
    return {
      title: 'マインドフルネス瞑想',
      segments: [
        {
          type: 'intro',
          text: 'マインドフルネス瞑想へようこそ。背筋を伸ばして楽に座ります。優しく目を閉じてください。',
          pauseAfter: 5000,
        },
        {
          type: 'instruction',
          text: '呼吸に気づくことから始めます。変えようとせず、自然なリズムをただ観察します。',
          pauseAfter: 15000,
        },
        {
          type: 'guidance',
          text: '意識を広げて音も含めます。近くや遠くの音に気づき、判断せずに聞きます。',
          pauseAfter: 20000,
        },
        {
          type: 'guidance',
          text: '体の感覚に注意を向けます。椅子やクッションに触れている感覚、肌に触れる空気の温度を感じます。',
          pauseAfter: 20000,
        },
        {
          type: 'reminder',
          text: '思考が浮かんだら、判断せずに認め、優しく今この瞬間に注意を戻します。',
          pauseAfter: 25000,
        },
        {
          type: 'silence',
          text: '',
          pauseAfter: 30000,
        },
        {
          type: 'guidance',
          text: '開かれた気づきの中で休み続け、瞬間瞬間の体験に何が起きても気づいています。',
          pauseAfter: 20000,
        },
        {
          type: 'outro',
          text: 'ゆっくりと呼吸に注意を戻します。深く息を吸って、吐いてください。準備ができたら、目を開けてください。',
          pauseAfter: 5000,
        },
      ],
    };
  }
}

export default new MeditationContent();