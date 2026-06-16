/**
 * Ski Academy — Bundled JavaScript (no ES modules, works with file://)
 * All modules combined into a single IIFE-wrapped bundle.
 */
(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // utils/storage.js — localStorage wrapper
  // ═══════════════════════════════════════════════════════════════════
  const STORAGE_PREFIX = 'ski-academy-';
  function storageGet(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch { return defaultValue; }
  }
  function storageSet(key, value) {
    try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value)); } catch {}
  }

  // ═══════════════════════════════════════════════════════════════════
  // utils/dom.js — DOM helpers
  // ═══════════════════════════════════════════════════════════════════
  function $(selector, parent = document) { return parent.querySelector(selector); }
  function $$(selector, parent = document) { return Array.from(parent.querySelectorAll(selector)); }
  function createElement(tag, attrs = {}, children = null) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'className') el.className = value;
      else if (key === 'dataset') Object.assign(el.dataset, value);
      else if (key === 'style') el.style.cssText = value;
      else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
      else if (value !== undefined && value !== null) el.setAttribute(key, value);
    }
    if (children !== null && children !== undefined) {
      const items = Array.isArray(children) ? children : [children];
      for (const child of items) {
        if (typeof child === 'string' || typeof child === 'number') el.appendChild(document.createTextNode(String(child)));
        else if (child instanceof Node) el.appendChild(child);
      }
    }
    return el;
  }
  function escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
  function highlightText(text, query) {
    if (!query.trim()) return escapeHtml(text);
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safe = escapeHtml(text);
    try {
      return safe.replace(new RegExp(`(${escaped.replace(/\\\\/g, '\\\\\\\\')})`, 'gi'), '<mark>$1</mark>');
    } catch { return safe; }
  }

  // ═══════════════════════════════════════════════════════════════════
  // store.js — State management
  // ═══════════════════════════════════════════════════════════════════
  const state = {
    currentView: 'home',
    currentChapterId: null,
    track: storageGet('track', 'ski'),
    completedChapters: storageGet('completed-chapters', []),
    theme: storageGet('theme', 'light'),
    sidebarOpen: false,
  };
  const listeners = new Map();

  function getState() { return state; }
  function setState(updates) {
    const changedKeys = [];
    for (const [key, value] of Object.entries(updates)) {
      if (state[key] !== value) { state[key] = value; changedKeys.push(key); }
    }
    if ('completedChapters' in updates) storageSet('completed-chapters', state.completedChapters);
    if ('track' in updates) storageSet('track', state.track);
    if ('theme' in updates) storageSet('theme', state.theme);
    for (const key of changedKeys) {
      const cbs = listeners.get(key);
      if (cbs) cbs.forEach(fn => fn(state[key], state));
    }
  }
  function subscribe(key, callback) {
    if (!listeners.has(key)) listeners.set(key, []);
    listeners.get(key).push(callback);
    return () => { const cbs = listeners.get(key); if (cbs) { const i = cbs.indexOf(callback); if (i > -1) cbs.splice(i, 1); } };
  }
  function toggleChapterCompletion(chapterId) {
    const completed = [...state.completedChapters];
    const idx = completed.indexOf(chapterId);
    if (idx > -1) completed.splice(idx, 1); else completed.push(chapterId);
    setState({ completedChapters: completed });
    return idx === -1;
  }
  function isChapterCompleted(chapterId) { return state.completedChapters.includes(chapterId); }
  function getProgressPercent(total = 24) {
    if (total === 0) return 0;
    return Math.round((state.completedChapters.length / total) * 100);
  }

  // ═══════════════════════════════════════════════════════════════════
  // router.js — Hash router
  // ═══════════════════════════════════════════════════════════════════
  let routeHandler = null;
  function parseRoute() {
    const hash = window.location.hash.slice(1) || '/';
    if (hash === '/' || hash === '') return { view: 'home' };
    const parts = hash.split('/').filter(Boolean);
    if ((parts[0] === 'ski' || parts[0] === 'snowboard') && parts[1]) {
      return { view: 'chapter', track: parts[0], chapterId: parts[0] + '-' + parts[1] };
    }
    if (parts[0] === 'chapter' && parts[1]) {
      const id = parts[1]; const track = id.startsWith('sb-') ? 'snowboard' : 'ski';
      return { view: 'chapter', track, chapterId: id };
    }
    if (parts[0] === 'roadmap') return { view: 'roadmap' };
    if (parts[0] === 'appendix' && parts[1]) return { view: 'appendix', appendixId: parts[1] };
    return { view: 'home' };
  }
  function navigate(path) { window.location.hash = path; }
  function navigateToChapter(chapterId) {
    const track = chapterId.startsWith('sb-') ? 'snowboard' : 'ski';
    const num = chapterId.replace(/^(ski|sb)-/, '');
    navigate('/' + track + '/' + num);
  }
  function onRoute(handler) { routeHandler = handler; }
  function initRouter() {
    window.addEventListener('hashchange', () => {
      const route = parseRoute();
      if (routeHandler) routeHandler(route);
    });
    const route = parseRoute();
    if (routeHandler) setTimeout(() => routeHandler(route), 0);
  }

  // ═══════════════════════════════════════════════════════════════════
  // chapters.js — All chapter data
  // ═══════════════════════════════════════════════════════════════════
  const VID = {
    bili_equip: { videoId: 'BV1M34y1Z7Qb', platform: 'bilibili', channel: '雪研社', title: '穿脱雪鞋与装备详解', language: 'zh' },
    bili_stance: { videoId: 'BV1M34y1Z7Qb', platform: 'bilibili', channel: '雪研社', title: '基本站姿教学', language: 'zh' },
    bili_snowplow: { videoId: 'BV1pwmgBUEs5', platform: 'bilibili', channel: '滑雪入门', title: '6分钟入门犁式', language: 'zh' },
    bili_parallel: { videoId: 'BV1DQ4y1L78N', platform: 'bilibili', channel: '极速滑雪', title: '极速版平行式教学', language: 'zh' },
    bili_intermediate: { videoId: 'BV1pZ421278Z', platform: 'bilibili', channel: 'Ski School', title: '中级基础平行转弯', language: 'zh' },
    bili_safety: { videoId: 'BV15A41167rv', platform: 'bilibili', channel: '滑雪吧少年', title: '滑雪安全知识', language: 'zh' },
    bili_shorpin: { videoId: 'BV1g86VYwEyj', platform: 'bilibili', channel: '练刹车学转弯', title: '犁式刹车与转弯', language: 'zh' },
    yt_beginner: { videoId: '_yfFGDuJ2g0', platform: 'youtube', channel: 'Stomp It Tutorials', title: '10 Beginner Skills for Day 1', language: 'en' },
    yt_7steps: { videoId: 'tyB7Wu_aCq8', platform: 'youtube', channel: 'Stomp It Tutorials', title: '7 Steps to Parallel Skiing', language: 'en' },
    yt_carve: { videoId: 'l5m6l0Pt0kE', platform: 'youtube', channel: 'Stomp It Tutorials', title: 'How to Carve - 5 Tips', language: 'en' },
    yt_short: { videoId: 'fKd4ESjRWLU', platform: 'youtube', channel: 'Stomp It Tutorials', title: 'Short Turns - 5 Drills', language: 'en' },
    yt_powder: { videoId: 'rC0f0HGFzFI', platform: 'youtube', channel: 'Stomp It Tutorials', title: 'How to Ski Powder - 5 Tips', language: 'en' },
    yt_mogul: { videoId: 'Z0lXkLQoWkU', platform: 'youtube', channel: 'Big Picture Skiing', title: 'Mogul Skiing Fundamentals', language: 'en' },
    yt_steep: { videoId: 'gZFcDQJzWfY', platform: 'youtube', channel: 'Stomp It Tutorials', title: 'How to Ski Steep Slopes', language: 'en' },
    yt_jump: { videoId: 'z3imDw76vwY', platform: 'youtube', channel: 'Stomp It Tutorials', title: 'How to Jump - Beginner to Advanced', language: 'en' },
    yt_360: { videoId: 'gqP3FPE1kAU', platform: 'youtube', channel: 'Stomp It Tutorials', title: '17 Ways to 360', language: 'en' },
    yt_race: { videoId: 'ZXsQN4IbpZM', platform: 'youtube', channel: 'CARV', title: 'Ski Racing Fundamentals', language: 'en' },
    yt_avalanche: { videoId: 'UNjwz3h9Jx4', platform: 'youtube', channel: 'REI', title: 'Avalanche Safety Basics', language: 'en' },
    yt_beacon: { videoId: 'D1MmuW06f_o', platform: 'youtube', channel: 'Ortovox', title: 'Beacon Search Practice', language: 'en' },
    yt_offpiste: { videoId: 'I7fFHqP3XHc', platform: 'youtube', channel: 'Stomp It Tutorials', title: 'Off-Piste Skiing Tips', language: 'en' },
    sb_beginner: { videoId: 'vBL4iE2fM5Q', platform: 'youtube', channel: 'SnowboardProCamp', title: 'How to Snowboard - Beginner Guide', language: 'en' },
    sb_turns: { videoId: 'nGX5FjVLPVY', platform: 'youtube', channel: 'SnowboardProCamp', title: 'How to Turn on a Snowboard', language: 'en' },
    sb_carve: { videoId: 'PcJfWGF4lKo', platform: 'youtube', channel: 'Snowboard Addiction', title: 'How to Carve on a Snowboard', language: 'en' },
    sb_powder: { videoId: 'pPlD5CPBjKQ', platform: 'youtube', channel: 'SnowboardProCamp', title: 'How to Ride Powder', language: 'en' },
    sb_jump: { videoId: 'J3XkfvVt4Hw', platform: 'youtube', channel: 'Snowboard Addiction', title: 'How to Jump - Beginner to Advanced', language: 'en' },
    sb_park: { videoId: 'm4aNslQxibY', platform: 'youtube', channel: 'SnowboardProCamp', title: 'Park Riding for Beginners', language: 'en' },
    sb_bili_beginner: { videoId: 'BV1Ht421b7YD', platform: 'bilibili', channel: '单板入门', title: '单板滑雪零基础入门', language: 'zh' },
    sb_bili_turns: { videoId: 'BV1Hc41127vS', platform: 'bilibili', channel: '雪酷', title: '单板换刃教学', language: 'zh' },
    sb_bili_carve: { videoId: 'BV17A411T7JF', platform: 'bilibili', channel: '滑遍天下', title: '单板刻滑入门', language: 'zh' },
  };

  function ch(id, track, phase, phaseNum, num, title, icon, readTime, sections, videos, keyPoints) {
    return { id, track, phase, phaseNum, chapterNumber: num, title, icon, readingTime: readTime, sections, videos, keyPoints };
  }
  function sec(type, title, icon, content) { return { type, title, icon, content }; }

  const skiChapters = [
    // Phase 1: 零基础入门
    ch('ski-1-1','ski','零基础入门',1,1,'认识双板滑雪','🎿',8,[
      sec('overview','概述','📖','<p>欢迎来到双板滑雪的世界！在学习如何滑行之前，首先要了解滑雪运动的装备和基本概念。双板滑雪（Alpine Skiing）是最常见的滑雪形式，两只脚各穿一只滑雪板，通过雪杖辅助平衡和转向。</p><p>滑雪运动可分为以下几类：</p><ul><li><strong>高山滑雪（Alpine Skiing）</strong>：在机压雪道上滑行，是最常见的形式，也是本教程的核心内容。</li><li><strong>自由式滑雪（Freestyle）</strong>：包括公园（Park）、跳台（Jump）、道具（Rail）等花样技巧。</li><li><strong>野雪/道外滑雪（Off-Piste/Backcountry）</strong>：在非机压的天然雪域滑行，需要专业装备和雪崩安全知识。</li><li><strong>越野滑雪（Cross-Country/Nordic）</strong>：在平缓地形长距离滑行，更偏向耐力运动。</li></ul>'),
      sec('technique','装备认知','🔧','<p>了解每一件装备的功能至关重要：</p><ul><li><strong>滑雪板（Skis）</strong>：入门者选择比自己身高短10-15cm的全地域板（All-Mountain）。板有头尾宽度和侧切半径的区别，侧切越大转弯越灵活。</li><li><strong>滑雪鞋（Boots）</strong>：最重要的装备！必须合脚、不松不紧。硬度（Flex）入门选60-80，高手选100-130。</li><li><strong>固定器（Bindings）</strong>：连接雪鞋和雪板，设定合适的DIN值（脱离力度），保护你在摔倒时自动脱板。</li><li><strong>雪杖（Poles）</strong>：倒握时小臂与地面平行即为合适长度。用于点杖、推进和平衡。</li><li><strong>头盔（Helmet）</strong>：必须佩戴！选有MIPS技术的最好。</li><li><strong>雪镜（Goggles）</strong>：防紫外线、防风、防雾，不同透光率适用不同天气。</li></ul>'),
      sec('tips','雪道分级','🗺️','<p>国际通用雪道难度标识：</p><ul><li>🟢 <strong>绿道（Green）</strong>：坡度6%-25%，适合零基础新手。</li><li>🔵 <strong>蓝道（Blue）</strong>：坡度25%-40%，适合掌握基础转弯的滑雪者。</li><li>⚫ <strong>黑道（Black）</strong>：坡度40%以上，适合有经验的中高级滑雪者。</li><li>⬛ <strong>双黑道（Double Black）</strong>：极陡坡、狭窄、有障碍物，仅限专家。</li><li>🟠 <strong>野雪区（Off-Piste）</strong>：未压雪的自然区域，需专业知识和装备。</li></ul>'),
    ],[VID.bili_equip,VID.yt_beginner],['装备认知','滑雪类型','雪道分级','安全装备']),

    ch('ski-1-2','ski','零基础入门',1,2,'安全第一','🛡️',7,[
      sec('overview','概述','📖','<p>滑雪是一项具有风险的运动，安全意识和知识是学习滑雪的第一步。国际滑雪联合会（FIS）制定了10条安全行为准则，是每一位滑雪者都必须遵守的"雪场交规"。</p>'),
      sec('technique','FIS 10条安全准则','📋','<ol><li><strong>尊重他人</strong>：不以危及或伤害他人的方式滑行。</li><li><strong>控制速度和滑行方式</strong>：根据自身能力、地形、雪况和天气调整速度和方式。</li><li><strong>选择路线</strong>：后方滑雪者应选择不危及前方滑雪者的路线。</li><li><strong>超越</strong>：可从任意方向超越，但须给被超越者留出足够空间。</li><li><strong>进入雪道和启动</strong>：进入雪道或重新启动前，务必上下张望确认安全。</li><li><strong>在雪道上停留</strong>：避免在狭窄或视野盲区停留；摔倒后尽快离开雪道中央。</li><li><strong>步行上下</strong>：必须沿雪道边缘步行。</li><li><strong>遵守标志</strong>：注意标志和警示牌。</li><li><strong>协助</strong>：发生事故时，每个人都有义务提供协助。</li><li><strong>身份标识</strong>：事故相关人员须出示身份信息。</li></ol>'),
      sec('technique','如何安全摔倒','🤕','<p>学会正确摔倒是防止受伤的关键技能：</p><ul><li><strong>主动摔倒</strong>：当感觉失控时，主动压低重心侧倒，不要硬扛。</li><li><strong>扔掉雪杖</strong>：摔倒时立即松开雪杖，避免戳伤自己。</li><li><strong>侧身着地</strong>：尽量用臀部和大腿外侧着地，不要用手腕撑地。</li><li><strong>放松身体</strong>：僵硬的身体更容易受伤，放松反而更安全。</li></ul>'),
      sec('tips','安全装备与常识','⚠️','<p>必备安全装备：头盔（强制）、护腕、护膝（初学者推荐）、防晒霜和高SPF唇膏。高原反应预防：多喝水、避免饮酒、给身体1-2天适应。</p>'),
    ],[VID.bili_safety,VID.yt_beginner],['FIS安全准则','正确摔倒','安全装备','高原适应']),

    ch('ski-1-3','ski','零基础入门',1,3,'基本站姿与平衡','🧍',8,[
      sec('overview','概述','📖','<p>基本站姿是滑雪所有技术的基础。一个良好的运动站姿能让你保持平衡、灵活转向、应对各种雪况。好消息是，你不需要在雪道上才能练习——在家就可以开始！</p>'),
      sec('technique','标准运动站姿','🏋️','<ul><li><strong>脚踝弯曲</strong>：小腿前侧应始终轻贴雪鞋鞋舌。这是站姿的"第一动力链"。</li><li><strong>膝盖微曲</strong>：膝盖弯曲约30°，位于脚尖上方。</li><li><strong>髋部前倾</strong>：上半身微微前倾，重心落在脚掌中央，不要后坐。</li><li><strong>双手在前</strong>：双手放松置于身体前方，肘部微曲，像"端托盘"的姿势。</li><li><strong>视线向前</strong>：眼睛看向你要去的方向，不要看脚下。</li><li><strong>两脚与肩同宽</strong>：保持自然宽度，不要夹太紧。</li></ul>'),
      sec('mistakes','常见错误','❌','<ul><li><strong>后坐（Backseat）</strong>：重心太靠后，小腿离开鞋舌→失去前向控制力。</li><li><strong>僵直站立</strong>：膝盖锁死、身体僵硬→无法吸收地形变化。</li><li><strong>低头看脚下</strong>：导致身体前倾、平衡被破坏。</li><li><strong>手臂乱摆</strong>：手放在身后或高高举起→破坏重心。</li></ul>'),
      sec('drills','练习方法','🎯','<ul><li><strong>平地练习</strong>：穿好雪鞋站在平地上（不穿雪板），闭眼感受重心在脚掌的分布。</li><li><strong>镜子自检</strong>：对着镜子侧面检查脚踝-膝盖-髋-肩是否成一条直线。</li><li><strong>跳跃练习</strong>：原地轻轻跳起，自然落地时的姿势就是你的最佳站姿。</li></ul>'),
    ],[VID.bili_stance,VID.yt_beginner],['运动站姿','重心控制','脚踝弯曲','视线方向']),

    ch('ski-1-4','ski','零基础入门',1,4,'平地基础与直滑降','🏔️',9,[
      sec('overview','概述','📖','<p>在正式滑行之前，需要在平地和极缓坡上熟悉雪板的感觉。这些基础动作虽然简单，却是建立雪感和信心的关键第一步。</p>'),
      sec('technique','平地基础动作','👣','<ul><li><strong>穿脱雪板</strong>：先将脚尖插入固定器前部，脚跟用力下踩至听到"咔嗒"声。脱板时用雪杖按压固定器后方的脱板杆。</li><li><strong>平地行走</strong>：像走路一样交替迈步，雪杖辅助支撑。</li><li><strong>侧向登坡（Sidestep）</strong>：雪板垂直于坡面，靠山上侧板刃卡雪，横向一步步上移。</li><li><strong>八字登坡（Herringbone）</strong>：雪板呈八字形分开，用内侧刃卡雪向上走，适合稍陡的坡。</li></ul>'),
      sec('technique','直滑降（Straight Run）','⛷️','<p>在非常平缓的坡上（几乎感觉不到坡度），让雪板自然向前滑动。保持基本站姿，雪板平行对齐，身体放松。眼睛看向前方远处，不要看脚下。</p>'),
      sec('technique','犁式制动（Snowplow Braking）','🛑','<p>也叫"披萨刹车"，是最基础的减速和停止方法：将板尾向外推开，板头靠拢但不交叉，形成倒V字形。用两脚内侧刃（内刃）推雪产生阻力。板尾推得越开、刃立得越高、制动力越强。<strong>核心要领</strong>：用腿和脚掌施力，不是用手臂乱挥。</p>'),
    ],[VID.bili_snowplow,VID.bili_shorpin],['穿脱雪板','平地行走','直滑降','犁式制动']),

    ch('ski-1-5','ski','零基础入门',1,5,'犁式转弯','🔽',10,[
      sec('overview','概述','📖','<p>犁式转弯（Snowplow Turn/Wedge Turn）是滑雪的第一个真正意义的转弯技术。它使用犁式站姿（板头近、板尾远的倒V形），通过重心左右转移来引导转弯方向，是迈向平行式滑雪的必经之路。</p>'),
      sec('technique','犁式转弯技术要领','🎯','<ul><li><strong>起始姿势</strong>：犁式站姿，板头间距约一拳，板尾向两侧推开。</li><li><strong>重心转移</strong>：想向左转时，将身体重心移向右脚（山下脚），右脚内刃立刃发力；左脚自然跟随。</li><li><strong>腿部发力</strong>：转弯的力量来自腿部旋转和立刃，而非上半身扭转。</li><li><strong>视线引领</strong>：眼睛看向转弯方向，头转向目标，身体自然跟随。</li><li><strong>连续转弯</strong>：完成一个弯后，重心逐渐转移到另一只脚，开始下一个弯。</li><li><strong>控速技巧</strong>：弯形越圆、弯末越横穿坡面、速度越慢。</li></ul>'),
      sec('mistakes','常见错误','❌','<ul><li><strong>上身旋转</strong>：用肩膀带动转弯→应该用腿和脚发力，上半身保持稳定。</li><li><strong>板头交叉</strong>：板头靠太近互相碰撞→保持板头间距。</li><li><strong>重心后坐</strong>：速度一快就往后躲→始终保持小腿贴鞋舌。</li><li><strong>内侧板卡雪</strong>：内侧板刃挂雪导致摔倒→转弯时内侧板要放平。</li></ul>'),
      sec('drills','练习方法','🎯','<ul><li><strong>单侧练习</strong>：在极缓坡只练左转（重心放在右脚），直到熟练再换边。</li><li><strong>数节奏</strong>：口中数"1-2-3转弯"，建立转弯节奏感。</li><li><strong>追踪练习</strong>：跟随前方滑雪者的轨迹，模仿对方转弯时机和路线。</li></ul>'),
    ],[VID.bili_shorpin,VID.yt_7steps],['犁式站姿','重心转移','腿部发力','连续转弯','控速']),
  ];

  // Add remaining ski chapters (Phase 2-5) and all snowboard chapters
  // Due to bundle size, we build the rest programmatically from the ESM data
  // For the complete version, see the individual module files

  // Phase 2: 初级技巧 (4 chapters)
  const skiPhase2 = [
    ch('ski-2-1','ski','初级技巧',2,1,'从犁式到半犁式','🔄',9,[
      sec('overview','概述','📖','<p>半犁式（Stem Christie）是连接犁式和平行式的桥梁。在转弯过程中，外侧板在转弯末端收拢与内侧板平行，实现"犁式出发→平行结束"的过渡。</p>'),
      sec('technique','技术要领','🎯','<ul><li><strong>转弯起始</strong>：以犁式姿势开始转弯，重心放在外侧板。</li><li><strong>收板时机</strong>：转弯后半段，当雪板指向滚落线方向时，内侧板主动抬起收拢，与外侧板平行。</li><li><strong>关键感觉</strong>：外侧板承重约70%，内侧板逐渐放平减轻压力，自然向内侧靠拢。</li><li><strong>循序渐进</strong>：从弯末收板→弯中收板→弯初收板，逐步提前收板时机。</li></ul>'),
      sec('drills','练习方法','🎯','<ul><li><strong>斜滑降提板</strong>：斜滑降时尝试抬起内侧板（山上板），只用外侧板滑行一段。</li><li><strong>扇子练习</strong>：连续做半犁式转弯，每次弯末把内侧板收拢到平行位置。</li></ul>'),
    ],[VID.yt_7steps],['半犁式','收板时机','平行过渡','重心分配']),

    ch('ski-2-2','ski','初级技巧',2,2,'基础平行转弯','⛷️',10,[
      sec('overview','概述','📖','<p>平行式转弯是滑雪的重大里程碑——两只雪板在整个转弯过程中始终保持平行！这意味着你真正掌握了用刃和重心转换。</p>'),
      sec('technique','技术要领','🎯','<ul><li><strong>站姿收窄</strong>：双脚间距与髋同宽，雪板平行。</li><li><strong>启动转弯</strong>：从下半身开始——脚踝和膝盖向转弯方向倾斜→雪板立刃→转弯。</li><li><strong>上下身分离</strong>：下半身（腿部）随转弯转动，上半身保持面向山下稳定。</li><li><strong>点杖入门</strong>：转弯前轻轻用雪杖点一下雪面，作为转弯的"发令枪"。</li><li><strong>弯形控制</strong>：完整C形弯，而不是急促的Z形弯。</li></ul>'),
      sec('mistakes','常见错误','❌','<ul><li><strong>Z形弯</strong>：快速甩尾换来换去，没有完整的转弯弧线。</li><li><strong>上半身领先</strong>：用肩膀带动转弯，导致旋转过度。</li><li><strong>内倾过度</strong>：身体向弯内倾倒而不是立刃。</li></ul>'),
    ],[VID.bili_parallel,VID.yt_7steps],['平行转弯','上下身分离','点杖','C形弯','立刃']),

    ch('ski-2-3','ski','初级技巧',2,3,'缆车与雪场礼仪','🚡',6,[
      sec('overview','概述','📖','<p>在雪场，除了滑行技术，使用缆车和遵守雪场规则同样重要。不会坐缆车，你可能连雪道都上不去！</p>'),
      sec('technique','如何乘坐缆车','🚡','<ul><li><strong>排队候车</strong>：按顺序排队，通常2-4人一组。</li><li><strong>上缆车</strong>：站到指定位置，回头看缆车到来，手扶椅子坐下，立即放下安全杆。</li><li><strong>途中</strong>：保持雪板朝前，不要摇晃。</li><li><strong>下缆车</strong>：快到站时抬起安全杆，雪板前端微微翘起，脚着地后立即向前滑出离开下站区域。</li></ul>'),
      sec('technique','雪场礼仪要点','🤝','<ul><li><strong>让路原则</strong>：前方滑雪者有优先权，后方滑雪者须避让。</li><li><strong>安全停留</strong>：不要在狭窄雪道中央、转弯盲区或跳台落地处停留。</li><li><strong>安全超越</strong>：超越时保持足够距离，可以喊一声"左边！"或"右边！"。</li></ul>'),
    ],[VID.bili_safety],['缆车乘坐','拖牵使用','雪场礼仪','让路规则']),

    ch('ski-2-4','ski','初级技巧',2,4,'初级道实战','🏂',8,[
      sec('overview','概述','📖','<p>掌握了基础技术后，是时候在真正的绿道和简单蓝道上实践了。这一章帮你把学到的技术应用到真实的雪道环境中。</p>'),
      sec('technique','实战要点','🎯','<ul><li><strong>选道策略</strong>：先滑最平缓的绿道，找到节奏后再挑战稍陡的蓝道。</li><li><strong>地形阅读</strong>：观察前方雪道宽窄、坡度变化、人流情况，提前规划路线。</li><li><strong>速度管理</strong>：利用转弯控制速度，而不是用犁式刹车硬刹。</li><li><strong>节奏建立</strong>：找到自己的转弯节奏，不要被别人的速度影响。</li></ul>'),
      sec('mistakes','常见错误与纠正','❌','<ul><li><strong>越滑越快不会刹车</strong>：每个弯的弯末尽量横穿坡面，利用弯形自然减速。</li><li><strong>只看眼前2米</strong>：视线放远，提前3-5个弯规划路线。</li><li><strong>紧张导致僵硬</strong>：深呼吸，边滑边默念"放松-转弯-放松"。</li></ul>'),
    ],[VID.yt_7steps,VID.bili_parallel],['实践应用','地形阅读','路线规划','速度管理']),
  ];

  // Phase 3: 中级进阶 (5 chapters)
  const skiPhase3 = [
    ch('ski-3-1','ski','中级进阶',3,1,'动态平行转弯','🔄',10,[
      sec('overview','概述','📖','<p>从"能平行转弯"到"滑得漂亮"，核心在于掌握上下身分离和反弓（Angulation）这两个关键概念。</p>'),
      sec('technique','上下身分离','🧘','<p>想象你的身体分为两部分：</p><ul><li><strong>下半身（腿部）</strong>：随转弯方向左右摆动，灵活转动。</li><li><strong>上半身（躯干）</strong>：始终保持面向山下，稳定不动，像灯塔一样。</li><li>这种分离创造了"反弓"——髋部向弯内倾斜而肩部保持水平的形态。</li></ul>'),
      sec('technique','反弓（Angulation）','📐','<p>反弓是高级滑雪的标志性动作：</p><ul><li><strong>怎么做</strong>：在转弯时，髋部向弯内侧倾斜，同时上半身微微向弯外侧反方向倾斜，形成身体侧面的"<"形。</li><li><strong>为什么重要</strong>：反弓让雪板立刃角度更大，抓雪更牢固，转弯更精准。</li></ul>'),
    ],[VID.bili_intermediate,VID.yt_carve],['上下身分离','反弓','立刃角度','精准转向']),

    ch('ski-3-2','ski','中级进阶',3,2,'立刃与刃的控制','🔪',9,[
      sec('overview','概述','📖','<p>滑雪板的侧切（Sidecut）设计让雪板自动转弯——前提是你懂得立刃。立刃角度越大，雪板弯曲越多，转弯半径越小。</p>'),
      sec('technique','立刃的原理','📐','<ul><li><strong>什么是立刃</strong>：将雪板倾斜，使板刃切入雪面而非板底平贴在雪上。</li><li><strong>内倾vs反弓</strong>：内倾（Inclination）是整个身体向弯内倾斜；反弓（Angulation）是身体各部位的折角。好的滑行两者结合使用。</li></ul>'),
      sec('drills','经典练习','🎯','<ul><li><strong>火车轨练习（Railroad Track）</strong>：在缓坡直线滑行，只用立刃让雪板自然走弧线，不主动扭转。留下的雪痕应该是两条清晰的细线。</li><li><strong>J弯练习</strong>：从一个弯开始，滑到底后沿弯的弧度自然转回到山上方向停止，形成J形轨迹。</li></ul>'),
    ],[VID.yt_carve,VID.bili_intermediate],['立刃原理','刃角控制','火车轨练习','J弯练习']),

    ch('ski-3-3','ski','中级进阶',3,3,'卡宾入门','🎿',10,[
      sec('overview','概述','📖','<p>卡宾（Carving）是滑雪技术的一次飞跃——雪板在雪面上切出干净的两条弧线，板尾完美跟随板头的轨迹，几乎没有搓雪。卡宾的感觉就像"雪板在替你转弯"。</p>'),
      sec('technique','搓雪vs卡宾','🔄','<ul><li><strong>搓雪转弯（Skidded Turn）</strong>：雪板在雪面上侧向滑动，横向推雪。适合控速，但效率较低。</li><li><strong>卡宾转弯（Carved Turn）</strong>：板刃切进雪面，雪板沿自身弧度弯曲行走。板尾严格跟随板头轨迹，效率极高。</li></ul>'),
      sec('technique','卡宾的要领','🎯','<ul><li><strong>提前入刃</strong>：在转弯开始前就建立刃角，而不是转弯过程中才立刃。</li><li><strong>耐心等待</strong>：相信雪板的侧切，让板子自己走弧线，不要用力扭转。</li><li><strong>外侧板承重</strong>：卡宾时外侧板（山下板）承担80%以上的重量。</li></ul>'),
    ],[VID.yt_carve],['搓雪vs卡宾','提前入刃','侧切原理','雪痕判断']),

    ch('ski-3-4','ski','中级进阶',3,4,'不同雪况应对','❄️',9,[
      sec('overview','概述','📖','<p>大自然不会总是给你完美的机压雪道。冰面、春雪湿雪、粉雪、烂雪——每种雪况都需要不同的技术调整。</p>'),
      sec('technique','硬雪/冰面','🧊','<ul><li>刃必须锋利！钝刃在冰面上等于自杀。</li><li>动作要柔和渐进，不要突然发力。</li><li>增加立刃角度，用刃切冰而非搓冰。</li><li>保持冷静放松，紧张会导致过度反应。</li></ul>'),
      sec('technique','春雪/湿雪','💧','<ul><li>重心稍后移（不要太多），防止板头陷入湿雪。</li><li>两只脚受力均匀（不像硬雪时外侧板为主）。</li><li>动作幅度加大，转弯节奏放慢。</li></ul>'),
      sec('technique','平光/白茫茫','🌫️','<ul><li>使用低透光率的雪镜（增加对比度）。</li><li>降低速度，减小转弯幅度。</li><li>用身体感受代替视觉判断，信任脚下的感觉。</li></ul>'),
    ],[VID.yt_offpiste],['硬雪技巧','冰面滑行','湿雪应对','平光策略']),

    ch('ski-3-5','ski','中级进阶',3,5,'蓝道到黑道过渡','⬆️',8,[
      sec('overview','概述','📖','<p>第一次站上黑道时的紧张感，每个滑雪者都经历过。从蓝道到黑道的过渡，技术上差距不大，心理上的差距才是关键。</p>'),
      sec('technique','技术准备','🎯','<ul><li><strong>短弯能力</strong>：在黑道上做大弯会越滑越快。短弯（Short Radius Turn）是控速的必备技能。</li><li><strong>侧滑（Sideslip）</strong>：在陡坡上可以随时用侧滑的方式滑下一段距离。</li><li><strong>落叶飘（Falling Leaf）</strong>：在陡坡上来回横滑，像落叶飘落，是最安全的陡坡下行方式。</li></ul>'),
      sec('tips','心理准备','🧠','<ul><li>第一次上黑道，找个有经验的朋友带领。</li><li>分段完成：不要想着一口气滑到底，分成3-4段，一段一段来。</li><li>相信自己：你的技术在蓝道上已经成熟，黑道需要的只是更紧凑的节奏。</li></ul>'),
    ],[VID.yt_steep,VID.yt_short],['短弯控速','侧滑','落叶飘','心理准备']),
  ];

  // Phase 4: 高级技巧 (5 chapters)
  const skiPhase4 = [
    ch('ski-4-1','ski','高级技巧',4,1,'动态卡宾','🔥',10,[
      sec('overview','概述','📖','<p>动态卡宾是竞技级别的高性能滑行技术。高立刃角度、精准的压力控制、以及收放自如的能量管理——你的目标是让雪板像在轨道上飞驰。</p>'),
      sec('technique','高立刃技术','📐','<ul><li><strong>髋部贴雪</strong>：在弯中达到极限立刃时，髋部几乎擦到雪面。</li><li><strong>Crossover（上方换刃）</strong>：在两个弯之间，身体向上伸展→重心升高→雪板变轻→快速切换到新刃→身体下沉进入新弯。适合大弯和高速。</li><li><strong>Crossunder（下方换刃）</strong>：身体保持低位，通过快速收腿让雪板从身体下方穿过换刃。适合短弯和蘑菇。</li></ul>'),
      sec('technique','能量管理','⚡','<p>高级卡宾利用雪板的反弹力（Rebound）：在弯末雪板蓄满弹性势能，换刃瞬间释放这股能量，获得向前的加速。</p>'),
    ],[VID.yt_carve,VID.yt_race],['高立刃','Crossover','Crossunder','反弹利用']),

    ch('ski-4-2','ski','高级技巧',4,2,'短弯（小回转）','⚡',10,[
      sec('overview','概述','📖','<p>短弯（Short Turns/小回转）是最实用的高级技术之一。在陡坡、窄道、蘑菇和拥挤的雪道上，短弯让你游刃有余。</p>'),
      sec('technique','技术要领','🎯','<ul><li><strong>快速换刃</strong>：左右切换要快，从一条刃换到另一条刃的过渡时间缩到最短。</li><li><strong>活跃的点杖</strong>：短弯中的点杖不再是"轻轻一点"，而是精准有力的节奏标记。</li><li><strong>上半身绝对稳定</strong>：不管下半身转得多快，上半身始终面向山下纹丝不动。</li><li><strong>节奏感</strong>：在脑中打节拍——"1-2-3-4"，找到自己的频率。</li></ul>'),
      sec('drills','练习方法','🎯','<ul><li><strong>走廊练习</strong>：选一条窄的雪道（大约2-3米宽），在这个"走廊"里做短弯，不能超出边界。</li><li><strong>变速练习</strong>：同一坡度上，尝试5个大弯→10个中弯→20个短弯，感受不同节奏。</li></ul>'),
    ],[VID.yt_short],['快速换刃','节奏点杖','上身稳定','走廊练习']),

    ch('ski-4-3','ski','高级技巧',4,3,'蘑菇（Mogul）技巧','🟤',10,[
      sec('overview','概述','📖','<p>蘑菇（Mogul/猫跳）是雪道上由滑雪者反复转弯形成的雪包。滑蘑菇是一门艺术——它考验你的吸收能力、节奏感和创造力。</p>'),
      sec('technique','吸收与伸展','🎯','<ul><li><strong>遇到雪包时</strong>：主动收腿（膝盖向胸口靠近），让雪板顺着包的正面滑上。</li><li><strong>越过包顶时</strong>：伸展腿部，将雪板推向包的背面。</li><li><strong>核心原则</strong>：上半身保持在同一水平高度，像汽车悬挂一样，只有下半身在起伏。</li></ul>'),
      sec('technique','走线选择','🗺️','<ul><li><strong>槽底走线（Trough Line）</strong>：在包与包之间的沟槽里滑，是最容易的入门路线。</li><li><strong>拉链线（Zipper Line）</strong>：竞技级别！直直往下，双腿高速吸收每一个包。</li></ul>'),
    ],[VID.yt_mogul],['吸收伸展','走线选择','拉链线','身体悬挂']),

    ch('ski-4-4','ski','高级技巧',4,4,'粉雪技巧','❄️',9,[
      sec('overview','概述','📖','<p>粉雪（Powder）是滑雪者的终极追求——那种漂浮在云端的失重感无法用语言形容。但粉雪的技术与机压雪道截然不同。</p>'),
      sec('technique','粉雪技术要领','🎯','<ul><li><strong>站姿收窄</strong>：两脚并拢，雪板几乎贴在一起——这样两只板子相当于一块大板，提供更大的浮力。</li><li><strong>速度是朋友</strong>：有一定速度才能在粉雪中漂浮起来。</li><li><strong>两脚均匀受力</strong>：不像硬雪时外侧板为主，粉雪中双脚受力约50/50。</li><li><strong>海豚转弯（Dolphin Turn）</strong>：利用浮力让雪板向上冲出雪面再入雪，像海豚跳跃一样。</li></ul>'),
    ],[VID.yt_powder],['粉雪站姿','漂浮原理','海豚转弯','双板并拢']),

    ch('ski-4-5','ski','高级技巧',4,5,'道外（Off-Piste）入门','🏔️',9,[
      sec('overview','概述','📖','<p>道外滑行（Off-Piste）是进入天然未压雪区域的滑行。很多雪场的道外区域就在雪道旁边，通过一道门或一根绳子与机压道隔开。</p>'),
      sec('technique','道外技术要点','🎯','<ul><li><strong>地形阅读升级</strong>：识别雪面下的石头、树根、暗沟等障碍物。</li><li><strong>灵活应变</strong>：道外雪况多变——可能一脚硬雪一脚粉雪。</li><li><strong>树林滑行</strong>：眼睛看树之间的空隙（你去的方向），不要看树（你会撞上去的）。</li></ul>'),
      sec('tips','安全警示','⚠️','<p>道外滑行绝非儿戏！务必：结伴而行、携带收发信标/探杆/雪铲三件套、告知他人你的路线、在能力范围内滑行。</p>'),
    ],[VID.yt_offpiste],['地形阅读','树林滑行','安全意识','结伴原则']),
  ];

  // Phase 5: 顶级技巧 (5 chapters)
  const skiPhase5 = [
    ch('ski-5-1','ski','顶级技巧',5,1,'竞技滑雪基础','🏆',10,[
      sec('overview','概述','📖','<p>竞技滑雪追求极致的速度和精准度。大回转（Giant Slalom/GS）是最接近"普通滑雪"的比赛项目，但快了3倍。</p>'),
      sec('technique','大回转技术','🎯','<ul><li><strong>走线策略</strong>：在两个旗门之间走最直、最短的路线。</li><li><strong>提前入刃</strong>：在到达旗门之前就建立好刃角，让雪板带着你绕过旗门。</li><li><strong>Crossblock</strong>：用小腿外侧或手臂推挡旗门杆，需要戴护腿板。</li><li><strong>高压管理</strong>：竞技转弯中离心力极大，需要极强的核心力量和腿部力量对抗。</li></ul>'),
    ],[VID.yt_race],['大回转','走线策略','提前入刃','高压对抗']),

    ch('ski-5-2','ski','顶级技巧',5,2,'极限陡坡技术','⛰️',8,[
      sec('overview','概述','📖','<p>40°以上的陡坡，摔一跤可能滑出去几十米。这就是"No-Fall Zone"的由来——在这种地形上，你没有摔倒的余地。</p>'),
      sec('technique','核心技术','🎯','<ul><li><strong>跳转（Jump Turn）</strong>：在极陡坡上，同时跳起并旋转180°来换方向。</li><li><strong>冰镐制动（Self-Arrest）</strong>：如果摔倒滑落，立即翻身俯卧，双手握雪杖尖端插入雪中，用全身重量紧急制动。</li><li><strong>绝不逞能</strong>：感觉不对就侧滑下来，或者脱板走下去。命比面子重要。</li></ul>'),
    ],[VID.yt_steep],['跳转','冰镐制动','No-Fall Zone','风险评估']),

    ch('ski-5-3','ski','顶级技巧',5,3,'自由式基础','🤸',10,[
      sec('overview','概述','📖','<p>自由式（Freestyle）为滑雪增添了无限乐趣。跳台、道具、空中动作——你不需要成为奥运选手也能享受公园的乐趣。</p>'),
      sec('technique','跳台技巧','🛫','<ul><li><strong>POP起跳</strong>：在跳台边缘主动向上蹬腿发力弹跳，获得更高的腾空。</li><li><strong>空中姿态</strong>：身体收紧，手抓板（Grab）可以增加稳定性。</li><li><strong>落地吸收</strong>：着陆时主动屈膝吸收冲击，像汽车减震一样。</li></ul>'),
      sec('technique','旋转入门','🔄','<ul><li><strong>180°</strong>：在空中旋转半圈，倒滑落地。这是学习所有旋转的第一步。</li><li><strong>360°</strong>：全身旋转一整圈。关键在于起跳时肩膀已经开始旋转，带动身体。</li><li><strong>视线引领</strong>：旋转时头先转，看你要去的方向，身体会自然跟随。</li></ul>'),
    ],[VID.yt_jump,VID.yt_360],['POP起跳','空中姿态','落地吸收','旋转入门']),

    ch('ski-5-4','ski','顶级技巧',5,4,'登山滑雪（Backcountry）','🎒',8,[
      sec('overview','概述','📖','<p>登山滑雪（Alpine Touring/AT）是用特殊装备自己爬上雪山然后滑下来。它打开了通往无人之境的大门——但也带来了更大的风险和责任。</p>'),
      sec('technique','AT装备介绍','🔧','<ul><li><strong>AT固定器</strong>：后跟可以解锁，走路模式脚后跟自由抬起，滑行模式锁定。</li><li><strong>止滑带（Skins）</strong>：贴在板底的合成纤维条，顺毛方向可向前滑动，逆毛方向产生阻力。</li><li><strong>止滑带爬升技巧</strong>：步幅小而稳定，重心垂直向上不左右晃，善用雪杖支撑。</li></ul>'),
      sec('tips','路线规划','🗺️','<p>出发前务必：查看天气预报、雪崩预报、告知他人你的行程和预计返回时间。携带充足的水、食物、备用衣物、充电宝。</p>'),
    ],[VID.yt_avalanche],['AT装备','止滑带','爬升技巧','路线规划']),

    ch('ski-5-5','ski','顶级技巧',5,5,'雪崩安全','🚨',7,[
      sec('overview','概述','📖','<p>雪崩是野雪滑雪中的头号杀手。无论你的滑行技术多好，不懂雪崩安全就是拿生命在赌博。这不是可选项，是必修课。</p>'),
      sec('technique','雪崩三件套','🎒','<ul><li><strong>收发信标（Beacon）</strong>：发射和接收无线电信号。出发前确认所有人的信标在发射模式。</li><li><strong>探杆（Probe）</strong>：折叠长杆，用于精确定位被埋者的位置和深度。</li><li><strong>雪铲（Shovel）</strong>：金属铲头的专业雪铲。</li></ul>'),
      sec('technique','雪崩地形识别','🔍','<ul><li><strong>坡度</strong>：30°-45°是雪崩最高发的坡度。</li><li><strong>坡向</strong>：背风坡（风积雪）和不稳定日照面更危险。</li><li><strong>地形陷阱</strong>：沟槽、悬崖下方、狭窄山谷都是致命陷阱。</li></ul>'),
    ],[VID.yt_avalanche,VID.yt_beacon],['雪崩三件套','信标搜索','地形识别','雪崩预报']),
  ];

  // ── Snowboard Chapters (condensed for bundle size, key chapters) ──
  const sbPhase1 = [
    ch('sb-1-1','snowboard','零基础入门',1,1,'认识单板滑雪','🏂',8,[
      sec('overview','概述','📖','<p>欢迎来到单板滑雪的世界！单板滑雪（Snowboarding）将两只脚固定在同一块板上，侧身滑行，有着与双板完全不同的体验和乐趣。</p><p>单板滑雪主要分为：全山地（All-Mountain）、自由式（Freestyle）、野雪/粉雪（Freeride/Powder）、高山刻滑（Alpine/Carving）。</p>'),
      sec('technique','装备认知','🔧','<ul><li><strong>单板（Snowboard）</strong>：选择长度在下巴到鼻子之间的全能板。软板（Flex 1-4）适合新手和公园，硬板（Flex 5-10）适合高速卡宾。</li><li><strong>固定器（Bindings）</strong>：新手建议前脚+15°、后脚0°（鸭子站姿）。</li><li><strong>单板鞋（Boots）</strong>：比双板鞋舒服太多！选合脚的，系紧后脚后跟不能有太多移动。</li><li><strong>护具</strong>：护臀（防尾骨受伤）、护膝、护腕三件套强烈推荐给新手。</li><li><strong>如何判断前脚</strong>：让别人从背后轻轻推你一下，你哪只脚先迈出去，那只脚就是前脚。左脚在前=Regular，右脚在前=Goofy。</li></ul>'),
    ],[VID.sb_beginner,VID.sb_bili_beginner],['装备认知','板型选择','固定器角度','Regular vs Goofy']),

    ch('sb-1-2','snowboard','零基础入门',1,2,'安全与防护','🛡️',7,[
      sec('overview','概述','📖','<p>单板滑雪的受伤模式与双板不同——单板更多伤及上肢（手腕、肩膀）和尾骨。正确的护具和摔倒技巧至关重要！</p>'),
      sec('technique','单板安全摔倒','🤕','<ul><li><strong>向前摔</strong>：用前臂（不是手掌！）和膝盖同时着地缓冲。拳头握紧，手臂弯曲成90°，像做俯卧撑的姿势落地。</li><li><strong>向后摔</strong>：下巴收紧贴胸口，用臀部+背部滚动着地，不要用手腕撑地！护臀在这里是你的救命恩人。</li><li><strong>最忌讳</strong>：手臂伸直用手掌撑地→手腕骨折的最常见原因。</li></ul>'),
      sec('technique','必需护具','🛡️','<ul><li><strong>护臀（Impact Shorts）</strong>：穿在雪裤里面，保护尾骨和髋部。</li><li><strong>护膝</strong>：单板经常要跪在雪上（穿脱固定器时），护膝是必需品。</li><li><strong>护腕</strong>：新手强烈推荐，至少在前5-10天的滑行中佩戴。</li></ul>'),
    ],[VID.sb_beginner],['安全摔倒','护具选择','手腕保护','尾骨保护']),

    ch('sb-1-3','snowboard','零基础入门',1,3,'基本站姿与平衡','🧍',8,[
      sec('overview','概述','📖','<p>单板的站姿是侧身的——这在一开始会感觉很奇怪。但正确的站姿是以后所有技术的基础。</p>'),
      sec('technique','标准站姿','🏋️','<ul><li><strong>膝盖弯曲</strong>：膝盖自然弯曲约20-30°，不要锁死。</li><li><strong>背部挺直</strong>：不要弯腰驼背，核心收紧。</li><li><strong>手臂自然</strong>：双手放在身体两侧前方，帮助平衡。</li><li><strong>视线方向</strong>：头转向滑行方向（侧脸朝前），眼睛看你前进的方向。</li><li><strong>重心居中</strong>：重心均匀分布在两脚之间。</li></ul>'),
      sec('mistakes','常见错误','❌','<ul><li><strong>身体僵直</strong>：站得笔直→任何小颠簸都会把你弹飞。</li><li><strong>弯腰低头</strong>：一直盯着自己的脚看。</li><li><strong>重心太靠后</strong>：后脚承重过多→板头会翘起，失去转向能力。</li></ul>'),
    ],[VID.sb_bili_beginner,VID.sb_beginner],['侧身站姿','重心居中','视线方向','核心收紧']),

    ch('sb-1-4','snowboard','零基础入门',1,4,'单脚滑行与基础移动','🦶',9,[
      sec('overview','概述','📖','<p>在学会转弯之前，你需要先学会如何在平地和缓坡上移动。单板在平地上只有前脚穿着板——这是最容易被忽略但其实很重要的基本功。</p>'),
      sec('technique','单脚平地移动','👣','<ul><li><strong>滑板式推滑（Skating）</strong>：前脚穿板固定，后脚自由。像滑板一样用后脚蹬地前进，然后把后脚放在板上的防滑垫上滑行。</li><li><strong>上坡</strong>：面对坡上方，用前刃卡住雪，后脚小步向上挪。</li></ul>'),
      sec('technique','直滑降','⛷️','<p>在极缓坡上，双脚都穿上固定器，板头朝下自然滑下。感受侧身滑行的感觉——这是你第一次真正的单板滑行体验！</p>'),
    ],[VID.sb_beginner],['单脚推滑','上坡移动','直滑降','防滑垫']),

    ch('sb-1-5','snowboard','零基础入门',1,5,'推坡与落叶飘','🍂',10,[
      sec('overview','概述','📖','<p>推坡（Sideslip）和落叶飘（Falling Leaf）是单板滑雪最重要的基础技能。掌握这两个动作，你就能在几乎任何坡度的雪道上安全下行。很多教练说："学会落叶飘，你就能下任何一条道。"</p>'),
      sec('technique','后刃推坡（Heel Side Slipping）','👣','<ul><li><strong>姿势</strong>：面朝山下，脚尖勾起让后刃（脚跟侧刃）切入雪中。膝盖弯曲，背部微微后靠。</li><li><strong>控速</strong>：脚趾下压→前刃放平→板底贴雪→加速下滑。脚尖勾起→前刃抬高→后刃切雪→制动减速。</li></ul>'),
      sec('technique','前刃推坡（Toe Side Slipping）','👣','<ul><li><strong>姿势</strong>：面朝山上，膝盖跪向雪面让前刃（脚尖侧刃）切入雪中。视线从肩膀上方看向山下。</li><li><strong>前刃推坡比后刃更难</strong>，因为看不到山下。多练习！</li></ul>'),
      sec('technique','落叶飘（Falling Leaf）','🍂','<p>在推坡的基础上加入横向移动——像秋天落叶一样左右飘落：在后刃（或前刃）推坡中，轻微向一侧施加更多压力，板就会向那个方向横向滑行。想换方向时，重心移到另一侧。</p>'),
    ],[VID.sb_bili_beginner,VID.sb_beginner],['后刃推坡','前刃推坡','落叶飘','刃的微调']),
  ];

  const sbPhase2 = [
    ch('sb-2-1','snowboard','初级技巧',2,1,'横滑降与J弯','↗️',9,[
      sec('overview','概述','📖','<p>推坡和落叶飘让你能下来，但真正的滑行需要学会横切坡面和转弯。J弯是单板第一个"真正的转弯"——从一个方向横穿雪道再到完全转向。</p>'),
      sec('technique','横滑降（Traverse）','➡️','<ul><li>在推坡基础上，有意识地向一侧滑行，形成一个斜向下的轨迹。</li><li>保持刃的角度一致，不要频繁调整——稳定性比速度更重要。</li></ul>'),
      sec('technique','J弯（J-Turn）','🎯','<p>从一个横滑降开始，逐渐将板头转向坡下→继续转向→最终板头指向山上方向停止。整个轨迹形似字母"J"。<strong>关键</strong>：转板头朝向滚落线时需要勇气——这是你第一次真正面对坡度。</p>'),
    ],[VID.sb_turns,VID.sb_bili_turns],['横滑降','J弯','板头转向','滚落线']),

    ch('sb-2-2','snowboard','初级技巧',2,2,'换刃入门（C弯→S弯）','🔄',10,[
      sec('overview','概述','📖','<p>换刃（Linking Turns）是单板滑雪最激动人心的突破！从此你再也不用推坡下山——你会真正地"滑"起来。</p>'),
      sec('technique','技术要领','🎯','<ul><li><strong>起始</strong>：从一个后刃横滑降开始，让板头逐渐转向滚落线方向。</li><li><strong>换刃瞬间</strong>：当板头正对滚落线时，板底放平→快速切换重心→进入前刃→完成转弯。</li><li><strong>节奏</strong>：后刃→放平板底→前刃→放平板底→后刃...形成流畅的S形轨迹。</li><li><strong>视线关键</strong>：看你要去的方向，而不是你的脚下。头转向哪里，身体就会跟向哪里。</li></ul>'),
      sec('mistakes','常见错误','❌','<ul><li><strong>换刃时卡刃（Catching an Edge）</strong>：板底放平后，下山刃意外切雪→瞬间急停摔倒。解决：换刃时果断放平板底、不要犹豫。</li><li><strong>用上半身甩转</strong>：靠肩膀和手臂硬甩来转弯→用前脚的膝盖和前肩来引导方向。</li></ul>'),
    ],[VID.sb_turns,VID.sb_bili_turns],['换刃','C弯','S弯','卡刃','重心转移']),

    ch('sb-2-3','snowboard','初级技巧',2,3,'缆车使用与雪场礼仪','🚡',6,[
      sec('overview','概述','📖','<p>单板坐缆车比双板更有挑战——因为你只有前脚穿着板！掌握缆车上下技巧，是每个单板人的必修课。</p>'),
      sec('technique','单板坐缆车技巧','🚡','<ul><li><strong>上缆车前</strong>：后脚脱出固定器，只用前脚穿板。</li><li><strong>途中小技巧</strong>：把后脚搭在前脚固定器旁边的板面上休息。</li><li><strong>下缆车</strong>：后脚放在防滑垫上，板头对齐前进方向，站起来→前脚滑行→滑出下站区。</li><li><strong>摔倒立即离开</strong>：下站区是最危险的地方，摔倒后立刻爬开。</li></ul>'),
    ],[VID.sb_beginner],['单脚上下缆车','防滑垫使用','下站安全']),

    ch('sb-2-4','snowboard','初级技巧',2,4,'初级道实战','🏔️',8,[
      sec('overview','概述','📖','<p>当你能连续换刃、顺利上下缆车后，就是时候在真正的绿道和蓝道上积累里程了。</p>'),
      sec('technique','实战要点','🎯','<ul><li><strong>选道策略</strong>：绿道练节奏→宽蓝道练速度控制→窄蓝道练精准度。</li><li><strong>速度管理</strong>：用转弯的形状来控制速度——想慢就多横穿，想快就多朝下。</li><li><strong>里程积累</strong>：滑得越多，肌肉记忆越强。前20天的进步是最快的！</li></ul>'),
    ],[VID.sb_turns],['选道策略','速度管理','地形阅读','里程积累']),
  ];

  const sbPhase3 = [
    ch('sb-3-1','snowboard','中级进阶',3,1,'动态连续换刃','🔄',9,[
      sec('overview','概述','📖','<p>从"能换刃"到"滑得流畅"，关键在于节奏、压力控制和上下半身的协调。</p>'),
      sec('technique','技术要领','🎯','<ul><li><strong>上下身协调</strong>：前肩始终指向滑行方向，下半身（膝盖和脚踝）做转弯动作。</li><li><strong>压力管理</strong>：转弯开始时压力集中在前脚，转弯中间压力均匀分布。</li><li><strong>换刃流畅度</strong>：换刃时不要有"停顿"，板底放平的时间越短越好。</li></ul>'),
    ],[VID.sb_turns,VID.sb_bili_turns],['上下身协调','压力管理','换刃流畅','节奏变化']),

    ch('sb-3-2','snowboard','中级进阶',3,2,'立刃与刃的控制','🔪',9,[
      sec('overview','概述','📖','<p>单板的刃控制与双板有相似之处但感觉完全不同。掌握刃的微妙调整，让你在各种雪况下都能游刃有余。</p>'),
      sec('technique','刃的控制','🎯','<ul><li><strong>低立刃（搓雪）</strong>：板底接近平贴雪面，刃角小→适合控速和初学。</li><li><strong>中高立刃</strong>：板子倾斜角度加大，刃切雪更深→抓雪力增强→适合高速和硬雪。</li><li><strong>刃角微调</strong>：用脚踝的微小动作调整刃角大小。高手用脚踝，新手用全身。</li></ul>'),
    ],[VID.sb_carve],['刃角控制','脚踝微调','搓雪vs切雪']),

    ch('sb-3-3','snowboard','中级进阶',3,3,'刻滑（Carving）入门','🏂',10,[
      sec('overview','概述','📖','<p>单板刻滑（Carving/走刃）就像是被板子带着转弯——板刃切进雪里，沿着侧切弧度自主行走。雪痕应该是一条纤细的线条。</p>'),
      sec('technique','刻滑要领','🎯','<ul><li><strong>提前入刃</strong>：在转弯点之前就已经立刃。</li><li><strong>信任侧切</strong>：让板子的侧切半径决定转弯弧度，不要主动扭转板子。</li><li><strong>身体倾斜</strong>：刻滑时身体需要向弯内倾斜（像骑摩托车压弯）。</li></ul>'),
    ],[VID.sb_carve,VID.sb_bili_carve],['刻滑','提前入刃','侧切信任','身体倾斜']),

    ch('sb-3-4','snowboard','中级进阶',3,4,'不同雪况应对','❄️',8,[
      sec('overview','概述','📖','<p>完美的机压雪道可遇不可求。冰面、春雪泥浆、深粉雪——每种雪况都有自己的脾气。</p>'),
      sec('technique','各雪况策略','🎯','<ul><li><strong>冰面（Icy）</strong>：保持刃的锋利度（定期修刃！）；动作更渐进；立刃角度加大。</li><li><strong>春雪/烂雪（Slush）</strong>：重心稍微后移；保持一定的速度，太慢反而难滑。</li><li><strong>硬包/不规则雪（Crud）</strong>：膝盖要像减震器一样柔软吸收冲击。</li></ul>'),
    ],[VID.sb_powder],['冰面策略','春雪应对','烂雪滑行','平光技巧']),

    ch('sb-3-5','snowboard','中级进阶',3,5,'蓝道到黑道过渡','⬆️',7,[
      sec('overview','概述','📖','<p>你的第一次黑道体验会非常紧张——这完全正常。关键不是技术，而是心态。</p>'),
      sec('technique','技术准备','🎯','<ul><li><strong>短弯能力必须过关</strong>：在黑道上做大弯会越滑越快直至失控。</li><li><strong>随时回到推坡</strong>：如果慌了，就切回后刃推坡或落叶飘模式喘口气。</li><li><strong>分段完成</strong>：把陡坡分成3-4段，一段一段来，中间推坡休息。</li></ul>'),
    ],[VID.sb_turns],['短弯控速','分段下滑','心态管理']),
  ];

  const sbPhase4 = [
    ch('sb-4-1','snowboard','高级技巧',4,1,'高速刻滑与动态滑行','🔥',9,[
      sec('overview','概述','📖','<p>高速刻滑是单板最帅的一面——身体几乎贴着雪面，板子切出完美的弧线。这需要极佳的平衡、胆量和精准的时机把控。</p>'),
      sec('technique','技术要点','🎯','<ul><li><strong>全刃切入</strong>：在高速下，刃必须完全切入雪面，任何一丝搓雪都会被放大为失控。</li><li><strong>Euro Carving</strong>：极致的刻滑风格，身体完全贴到雪面上，用手（甚至整个前臂）划过雪面。</li></ul>'),
    ],[VID.sb_carve,VID.sb_bili_carve],['高速刻滑','Euro Carving','回转半径']),

    ch('sb-4-2','snowboard','高级技巧',4,2,'小弯技巧','⚡',8,[
      sec('overview','概述','📖','<p>在狭窄的林间道、陡坡或拥挤的雪道上，小弯（Short Turns）让你能够精准控速、灵活穿梭。</p>'),
      sec('technique','技术要领','🎯','<ul><li><strong>快速换刃</strong>：缩短板底放平的时间，几乎是"刃→刃→刃"的直接切换。</li><li><strong>后脚踢转</strong>：在小弯中，后脚可以主动向外踢出，加速板子的旋转。</li><li><strong>核心收紧</strong>：快速换刃需要强大的核心力量来保持上半身稳定。</li></ul>'),
    ],[VID.sb_turns],['快速换刃','后脚踢转','核心稳定']),

    ch('sb-4-3','snowboard','高级技巧',4,3,'蘑菇与不平地形','🟤',8,[
      sec('overview','概述','📖','<p>单板滑蘑菇比双板更难（横向站位在窄沟槽中很受限），但掌握后绝对帅爆。</p>'),
      sec('technique','蘑菇技巧','🎯','<ul><li><strong>走包顶路线</strong>：单板更适合走雪包顶部（而不是沟槽），在包顶上完成换刃。</li><li><strong>膝盖吸收</strong>：遇到雪包主动收腿，过包后伸展——像人体悬挂系统。</li></ul>'),
    ],[VID.sb_powder],['包顶路线','吸收伸展','节奏感']),

    ch('sb-4-4','snowboard','高级技巧',4,4,'粉雪技巧','❄️',9,[
      sec('overview','概述','📖','<p>单板天生适合粉雪！宽大的板面在粉雪中的漂浮感是单板最棒的体验之一。</p>'),
      sec('technique','粉雪技术','🎯','<ul><li><strong>重心后移</strong>：比硬雪时稍微后坐，让板头自然翘起浮在雪面上。</li><li><strong>速度维持</strong>：粉雪阻力大，保持一定速度才不会陷进去。</li><li><strong>选板</strong>：粉雪板通常更长、更宽、板头更长（方向性板型），浮力更大。</li></ul>'),
    ],[VID.sb_powder],['重心后移','浮力原理','粉雪板选择']),

    ch('sb-4-5','snowboard','高级技巧',4,5,'道外与树林滑行','🌲',8,[
      sec('overview','概述','📖','<p>树林滑行（Glade/Tree Runs）是单板的高级享受——静音、软雪、避开人群。但树木不会躲你，你得躲树。</p>'),
      sec('technique','树林技巧','🌲','<ul><li><strong>看空隙别看树</strong>：这是铁律！眼睛看两棵树之间的空间。</li><li><strong>提前规划3步</strong>：在脑海中提前规划好接下来2-3个转弯的路线。</li><li><strong>绝不在树林停留</strong>：休息只能在空旷区域。</li></ul>'),
    ],[VID.sb_powder],['视线看空隙','提前规划','安全守则']),
  ];

  const sbPhase5 = [
    ch('sb-5-1','snowboard','顶级技巧',5,1,'公园入门：跳台','🛫',9,[
      sec('overview','概述','📖','<p>自由式是单板文化的重要组成。从第一个直飞（Straight Air）开始，你会爱上在空中飞翔的感觉。</p>'),
      sec('technique','跳台技巧','🛫','<ul><li><strong>接近跳台</strong>：保持稳定站姿，板底平贴在雪面上，不要立刃接近。</li><li><strong>POP起跳</strong>：到达台唇时双腿主动蹬伸弹跳。</li><li><strong>空中姿态</strong>：身体收紧，视线看向落地坡。手抓板（Grab）可以增加稳定性。</li><li><strong>落地</strong>：让落地坡的坡度自然吸收冲击，主动屈膝，尽量用板底平着落地。</li></ul>'),
    ],[VID.sb_jump],['直飞','POP起跳','空中姿态','落地吸收']),

    ch('sb-5-2','snowboard','顶级技巧',5,2,'公园进阶：道具与旋转','🔄',10,[
      sec('overview','概述','📖','<p>盒子（Box）、铁杆（Rail）和旋转让公园玩法更加丰富。</p>'),
      sec('technique','盒子与铁杆','🛤️','<ul><li><strong>50-50</strong>：板子与盒子平行，直直滑上→直直滑过→直直滑下。板底平贴，不要立刃！</li><li><strong>Boardslide</strong>：板子垂直于盒子，横着蹭过去。</li><li><strong>核心原则</strong>：眼睛看道具的末端出口处——你会自动朝那里滑去。</li></ul>'),
      sec('technique','旋转进阶','🔄','<ul><li><strong>180°</strong>：在跳台上旋转半圈，倒滑落地。视线先行——肩膀转动→身体跟随。</li><li><strong>360°</strong>：一整圈的旋转。关键是起跳时旋转已经开始。</li></ul>'),
    ],[VID.sb_jump,VID.sb_park],['50-50','Boardslide','180/360','视线引领']),

    ch('sb-5-3','snowboard','顶级技巧',5,3,'极限陡坡','⛰️',7,[
      sec('overview','概述','📖','<p>40°以上陡坡，摔一跤后果严重。单板在陡坡上的王牌是——推坡和落叶飘在任意坡度都有效。</p>'),
      sec('technique','陡坡技巧','🎯','<ul><li><strong>跳转（Jump Turn）</strong>：同时起跳并旋转方向，在空中完成180°变向。</li><li><strong>保持冷静</strong>：紧张会让身体僵硬，僵硬会导致卡刃摔倒。</li><li><strong>安全网</strong>：随时可以切回后刃推坡模式——这是单板在陡坡上的最大优势。</li></ul>'),
    ],[VID.sb_turns],['跳转','推坡安全网','心理控制']),

    ch('sb-5-4','snowboard','顶级技巧',5,4,'分离板（Splitboard）登山','🎒',7,[
      sec('overview','概述','📖','<p>Splitboard（分离板）让你用自己的力量爬上雪山再滑下来。板子分成两半用作雪鞋，到山顶再拼回单板滑下。</p>'),
      sec('technique','Splitboard使用','🔧','<ul><li><strong>分离/拼合</strong>：通过特殊的连接件，板子可以从中间分开或拼合。</li><li><strong>爬升模式</strong>：安装止滑带，使用分离模式像越野滑雪一样爬升。</li></ul>'),
    ],[VID.sb_powder],['Splitboard','分离拼合','爬升转换']),

    ch('sb-5-5','snowboard','顶级技巧',5,5,'雪崩安全','🚨',7,[
      sec('overview','概述','📖','<p>无论双板还是单板，进入野雪区域就必须具备雪崩安全知识和装备。这与你的滑行水平无关——与你的安全意识有关。</p>'),
      sec('technique','核心知识','🎯','<ul><li><strong>雪崩三件套</strong>：收发信标（Beacon）、探杆（Probe）、雪铲（Shovel）。缺一不可！</li><li><strong>搜索流程</strong>：信标粗搜→信标细搜→探杆确定深度→雪铲挖掘。</li><li><strong>黄金15分钟</strong>：被埋15分钟内存活率最高，超过30分钟存活率急剧下降。</li></ul>'),
      sec('tips','预防胜于救援','🧠','<p>出发前看雪崩预报、了解地形风险、带齐装备、结伴而行、告知行程。绝大多数雪崩遇难者都是触发了自己脚下的雪崩。</p>'),
    ],[VID.yt_avalanche,VID.yt_beacon],['雪崩三件套','信标搜索','黄金15分钟','预防为主']),
  ];

  // Combine all chapters
  const ALL_SKI = [...skiChapters, ...skiPhase2, ...skiPhase3, ...skiPhase4, ...skiPhase5];
  const ALL_SB = [...sbPhase1, ...sbPhase2, ...sbPhase3, ...sbPhase4, ...sbPhase5];
  const ALL_CHAPTERS = [...ALL_SKI, ...ALL_SB];

  // Appendices
  const appendices = [
    {
      id:'appendix-a', title:'滑雪术语表（中英对照）', icon:'📖',
      content: '<h2>滑雪术语表</h2><table style="width:100%;border-collapse:collapse;margin-top:16px;"><tr style="background:var(--color-bg-tertiary);"><th style="padding:10px;text-align:left;border:1px solid var(--color-border);">中文</th><th style="padding:10px;text-align:left;border:1px solid var(--color-border);">English</th><th style="padding:10px;text-align:left;border:1px solid var(--color-border);">说明</th></tr><tr><td style="padding:8px;border:1px solid var(--color-border);">犁式</td><td style="padding:8px;border:1px solid var(--color-border);">Snowplow/Wedge</td><td style="padding:8px;border:1px solid var(--color-border);">板头靠拢、板尾分开的倒V形站姿</td></tr><tr><td style="padding:8px;border:1px solid var(--color-border);">平行式</td><td style="padding:8px;border:1px solid var(--color-border);">Parallel Turn</td><td style="padding:8px;border:1px solid var(--color-border);">两只雪板平行同步转弯</td></tr><tr><td style="padding:8px;border:1px solid var(--color-border);">卡宾</td><td style="padding:8px;border:1px solid var(--color-border);">Carving</td><td style="padding:8px;border:1px solid var(--color-border);">板刃切雪行走，板尾精确跟随板头轨迹</td></tr><tr><td style="padding:8px;border:1px solid var(--color-border);">立刃</td><td style="padding:8px;border:1px solid var(--color-border);">Edging</td><td style="padding:8px;border:1px solid var(--color-border);">将雪板倾斜使刃切入雪面</td></tr><tr><td style="padding:8px;border:1px solid var(--color-border);">点杖</td><td style="padding:8px;border:1px solid var(--color-border);">Pole Plant</td><td style="padding:8px;border:1px solid var(--color-border);">用雪杖轻触雪面作为转弯时机标记</td></tr><tr><td style="padding:8px;border:1px solid var(--color-border);">滚落线</td><td style="padding:8px;border:1px solid var(--color-border);">Fall Line</td><td style="padding:8px;border:1px solid var(--color-border);">坡上最陡的直线方向</td></tr><tr><td style="padding:8px;border:1px solid var(--color-border);">蘑菇/猫跳</td><td style="padding:8px;border:1px solid var(--color-border);">Mogul</td><td style="padding:8px;border:1px solid var(--color-border);">雪道上反复转弯形成的雪包</td></tr><tr><td style="padding:8px;border:1px solid var(--color-border);">粉雪</td><td style="padding:8px;border:1px solid var(--color-border);">Powder</td><td style="padding:8px;border:1px solid var(--color-border);">刚下不久、未被压实的松软新雪</td></tr><tr><td style="padding:8px;border:1px solid var(--color-border);">机压雪道</td><td style="padding:8px;border:1px solid var(--color-border);">Groomed Run/Piste</td><td style="padding:8px;border:1px solid var(--color-border);">经压雪机处理过的平整雪道</td></tr><tr><td style="padding:8px;border:1px solid var(--color-border);">道外</td><td style="padding:8px;border:1px solid var(--color-border);">Off-Piste</td><td style="padding:8px;border:1px solid var(--color-border);">非机压雪道的天然雪区域</td></tr><tr><td style="padding:8px;border:1px solid var(--color-border);">登山滑雪</td><td style="padding:8px;border:1px solid var(--color-border);">Alpine Touring(AT)</td><td style="padding:8px;border:1px solid var(--color-border);">用特殊装备自行爬升后滑下</td></tr><tr><td style="padding:8px;border:1px solid var(--color-border);">侧切</td><td style="padding:8px;border:1px solid var(--color-border);">Sidecut</td><td style="padding:8px;border:1px solid var(--color-border);">雪板侧面的弧形曲线</td></tr><tr><td style="padding:8px;border:1px solid var(--color-border);">反弓</td><td style="padding:8px;border:1px solid var(--color-border);">Angulation</td><td style="padding:8px;border:1px solid var(--color-border);">身体各部位形成折角以增加立刃</td></tr><tr><td style="padding:8px;border:1px solid var(--color-border);">换刃</td><td style="padding:8px;border:1px solid var(--color-border);">Edge Change</td><td style="padding:8px;border:1px solid var(--color-border);">从一条刃切换到另一条刃</td></tr><tr><td style="padding:8px;border:1px solid var(--color-border);">推坡</td><td style="padding:8px;border:1px solid var(--color-border);">Sideslip</td><td style="padding:8px;border:1px solid var(--color-border);">单板横着板子向山下侧滑</td></tr><tr><td style="padding:8px;border:1px solid var(--color-border);">落叶飘</td><td style="padding:8px;border:1px solid var(--color-border);">Falling Leaf</td><td style="padding:8px;border:1px solid var(--color-border);">左右横向滑降交替的控速方式</td></tr></table>'
    },
    {
      id:'appendix-b', title:'推荐学习资源', icon:'📚',
      content: '<h2>推荐学习资源</h2><h3>🎥 YouTube频道（英文）</h3><ul><li><strong>Stomp It Tutorials</strong> — 最全面、最有趣的滑雪教学频道。</li><li><strong>CARV</strong> — 结合数字滑雪教练的教学。</li><li><strong>SnowboardProCamp</strong> — 最好的单板教学频道之一。</li><li><strong>Snowboard Addiction</strong> — 高质量的单板教学，尤其是公园和跳台。</li><li><strong>Deb Armstrong</strong> — 前奥运冠军的教学。</li></ul><h3>🎥 B站频道（中文）</h3><ul><li><strong>雪研社</strong> — 中文滑雪教学标杆。</li><li><strong>滑雪吧少年</strong> — 新手友好的中文滑雪教程。</li><li><strong>滑遍天下</strong> — 单板刻滑教学。</li><li><strong>雪酷</strong> — 单板教学全套课程。</li></ul><h3>📱 推荐App</h3><ul><li><strong>CARV</strong> — 装在鞋垫里的数字滑雪教练，实时语音反馈。</li><li><strong>Slopes</strong> — 最好的滑雪轨迹记录App。</li></ul><h3>📖 推荐书籍</h3><ul><li>《Ultimate Skiing》— Ron LeMaster，滑雪技术圣经。</li><li>《Allen & Mike\'s Really Cool Backcountry Ski Book》— 野雪入门必备。</li><li>《Staying Alive in Avalanche Terrain》— Bruce Tremper，雪崩安全经典。</li></ul>'
    },
    {
      id:'appendix-c', title:'雪下体能训练', icon:'💪',
      content: '<h2>滑雪专项体能训练</h2><p>滑雪前的体能储备直接决定你在雪道上的表现和耐受力。</p><h3>🦵 下肢力量</h3><ul><li><strong>靠墙静蹲（Wall Sit）</strong>：目标3分钟×3组。</li><li><strong>弓步蹲（Lunges）</strong>：每腿15次×3组。</li><li><strong>深蹲（Squats）</strong>：20次×3组。</li></ul><h3>💪 核心力量</h3><ul><li><strong>平板支撑（Plank）</strong>：目标3分钟。</li><li><strong>侧平板（Side Plank）</strong>：每侧1分钟×3组。</li><li><strong>俄罗斯转体（Russian Twist）</strong>：模拟上下身分离。</li></ul><h3>⚖️ 平衡与敏捷</h3><ul><li><strong>单腿站立（闭眼）</strong>：每次30秒，逐步增加到1分钟+。</li><li><strong>Bosu球深蹲</strong>：在不稳定平面上训练。</li><li><strong>跳绳</strong>：极佳的小腿爆发力+协调性+心肺训练。</li></ul><h3>🏃 心肺耐力</h3><ul><li><strong>高强度间歇跑（HIIT）</strong>：模拟滑雪中的高强度需求。</li><li><strong>爬楼梯/登山机</strong>：模拟登山的肌肉群和心肺负荷。</li></ul><h3>📅 赛前8周训练计划框架</h3><p>前4周：以力量和基础耐力为主（每周3次力量+2次有氧）。后4周：增加爆发力和敏捷训练。</p>'
    },
    {
      id:'appendix-d', title:'滑雪目的地指南', icon:'🌍',
      content: '<h2>滑雪目的地推荐</h2><h3>🇨🇳 中国</h3><ul><li><strong>崇礼（河北张家口）</strong>：2022冬奥会举办地。万龙、云顶、太舞、富龙等多个雪场，高铁1小时北京→崇礼。</li><li><strong>北大壶（吉林）</strong>：东北粉雪代表，雪质优秀，落差大。</li><li><strong>长白山（吉林）</strong>：万达和鲁能两个大型度假区，适合家庭和初中级滑雪者。</li><li><strong>可可托海（新疆）</strong>：国内雪季最长（可达5月），天然粉雪，落差大。</li><li><strong>阿勒泰（新疆）</strong>：人类滑雪起源地，野雪天堂。</li></ul><h3>🇯🇵 日本</h3><ul><li><strong>北海道二世古（Niseko）</strong>：世界级粉雪，极轻极干（Japow）。</li><li><strong>白马（Hakuba）</strong>：1998冬奥会场地，多个雪场可选。</li></ul><h3>🇪🇺 欧洲</h3><ul><li><strong>三峡谷/Les Trois Vallées（法国）</strong>：世界最大联滑雪区，600km+雪道。</li><li><strong>策尔马特（瑞士）</strong>：马特宏峰脚下，四季可滑。</li></ul><h3>🇺🇸🇨🇦 北美</h3><ul><li><strong>惠斯勒黑梳山（加拿大）</strong>：北美最大雪场。</li><li><strong>Jackson Hole（美国怀俄明）</strong>：极限陡坡和野雪圣地。</li></ul>'
    },
  ];

  // Helper functions
  function getChaptersByTrack(track) {
    if (track === 'ski') return ALL_SKI;
    if (track === 'snowboard') return ALL_SB;
    return [];
  }
  function getChapterById(id) { return ALL_CHAPTERS.find(ch => ch.id === id) || null; }
  function getPhasesByTrack(track) {
    const chapters = getChaptersByTrack(track);
    const phasesMap = new Map();
    for (const ch of chapters) {
      if (!phasesMap.has(ch.phaseNum)) {
        phasesMap.set(ch.phaseNum, { num: ch.phaseNum, title: ch.phase, icon: ch.icon, chapters: [] });
      }
      phasesMap.get(ch.phaseNum).chapters.push(ch);
    }
    return Array.from(phasesMap.values());
  }
  function getTotalChapters(track) { return getChaptersByTrack(track).length; }

  // ═══════════════════════════════════════════════════════════════════
  // components/theme.js
  // ═══════════════════════════════════════════════════════════════════
  function initTheme() {
    const { theme } = getState();
    applyTheme(theme);
    subscribe('theme', (newTheme) => applyTheme(newTheme));
    const stored = getState().theme;
    if (!stored) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setState({ theme: prefersDark ? 'dark' : 'light' });
    }
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const current = getState().theme;
        setState({ theme: current === 'light' ? 'dark' : 'light' });
      });
    }
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  // ═══════════════════════════════════════════════════════════════════
  // components/progress.js
  // ═══════════════════════════════════════════════════════════════════
  function initProgress() {
    subscribe('completedChapters', () => updateProgressUI());
    subscribe('track', () => updateProgressUI());
    updateProgressUI();
  }
  function updateProgressUI() {
    const { track, completedChapters } = getState();
    const total = getTotalChapters(track);
    const trackCompleted = completedChapters.filter(id => {
      if (track === 'ski') return id.startsWith('ski-');
      return id.startsWith('sb-');
    });
    const trackPercent = total > 0 ? Math.round((trackCompleted.length / total) * 100) : 0;
    const circle = document.getElementById('progressCircle');
    const text = document.getElementById('progressText');
    if (circle) {
      const circumference = 2 * Math.PI * 15.5;
      const dashLen = (trackPercent / 100) * circumference;
      circle.setAttribute('stroke-dasharray', dashLen + ' ' + circumference);
    }
    if (text) text.textContent = trackPercent + '%';
    const btn = document.getElementById('markCompleteBtn');
    if (btn) {
      const chId = getState().currentChapterId;
      if (chId && isChapterCompleted(chId)) {
        btn.textContent = '✅ 已完成 — 点击取消'; btn.classList.add('completed');
      } else {
        btn.textContent = '✅ 标记完成'; btn.classList.remove('completed');
      }
    }
  }
  function handleMarkComplete() {
    const { currentChapterId } = getState();
    if (!currentChapterId) return;
    toggleChapterCompletion(currentChapterId);
  }

  // ═══════════════════════════════════════════════════════════════════
  // components/video.js
  // ═══════════════════════════════════════════════════════════════════
  function createVideoSection(videos) {
    if (!videos || videos.length === 0) return createElement('div');
    const section = createElement('div', { className: 'video-section' });
    section.appendChild(createElement('h2', { className: 'video-section-title' }, '🎥 视频教学'));
    const grid = createElement('div', { className: 'video-grid' });
    for (const video of videos) {
      grid.appendChild(createVideoItem(video));
    }
    section.appendChild(grid);
    return section;
  }
  function createVideoItem(video) {
    const item = createElement('div', { className: 'video-item' });
    const container = createElement('div', { className: 'video-container' });
    const placeholder = createElement('div', {
      className: 'video-placeholder',
      onClick: function(e) { e.preventDefault(); loadVideo(container, video); },
    });
    placeholder.appendChild(createElement('span', { className: 'video-placeholder-icon' }, '▶️'));
    placeholder.appendChild(createElement('span', { className: 'video-placeholder-text' }, '点击加载视频'));
    container.appendChild(placeholder);
    item.appendChild(container);
    const info = createElement('div', { className: 'video-info' });
    info.appendChild(createElement('span', { className: 'video-title' }, video.title || '教学视频'));
    info.appendChild(createElement('span', { className: 'video-channel' }, video.channel || ''));
    const platformLabel = video.platform === 'bilibili' ? 'B站' : 'YouTube';
    info.appendChild(createElement('span', { className: 'video-platform' }, platformLabel));
    item.appendChild(info);
    return item;
  }
  function loadVideo(container, video) {
    container.innerHTML = '';
    if (video.platform === 'bilibili') {
      const iframe = createElement('iframe', {
        src: 'https://player.bilibili.com/player.html?bvid=' + video.videoId + '&page=1&high_quality=1&autoplay=0',
        allow: 'autoplay; encrypted-media; fullscreen; picture-in-picture',
        allowfullscreen: 'true',
        loading: 'lazy',
      });
      container.appendChild(iframe);
    } else {
      const iframe = createElement('iframe', {
        src: 'https://www.youtube.com/embed/' + video.videoId + '?rel=0&modestbranding=1&cc_load_policy=1&hl=zh-Hans',
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
        allowfullscreen: 'true',
        loading: 'lazy',
        referrerpolicy: 'strict-origin-when-cross-origin',
      });
      container.appendChild(iframe);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // components/content.js
  // ═══════════════════════════════════════════════════════════════════
  function renderHome(track) {
    const homePage = $('#homePage');
    const chapterPage = $('#chapterPage');
    const roadmapPage = $('#roadmapPage');
    if (homePage) homePage.style.display = 'block';
    if (chapterPage) chapterPage.style.display = 'none';
    if (roadmapPage) roadmapPage.style.display = 'none';

    const phasesContainer = $('#phasesOverview');
    if (!phasesContainer) return;
    phasesContainer.innerHTML = '';

    const title = createElement('h2', { className: 'phases-title' },
      track === 'ski' ? '🎿 双板滑雪 — 学习阶段' : '🏂 单板滑雪 — 学习阶段'
    );
    const subtitle = createElement('p', { style: 'text-align:center;color:var(--color-text-muted);font-size:14px;margin-top:-8px;margin-bottom:24px;' },
      'Skiflow 雪迹 · 系统化滑雪学习平台'
    );
    phasesContainer.appendChild(subtitle);
    phasesContainer.appendChild(title);

    // Track switcher
    const switcher = createElement('div', { className: 'track-switcher' });
    const skiBtn = createElement('button', {
      className: 'track-switch-btn' + (track === 'ski' ? ' active' : ''),
      onClick: function() { navigate('/'); setTimeout(function() { document.body.dispatchEvent(new CustomEvent('track-change', { detail: 'ski' })); }, 50); },
    }, '🎿 双板');
    const sbBtn = createElement('button', {
      className: 'track-switch-btn' + (track === 'snowboard' ? ' active' : ''),
      onClick: function() { navigate('/'); setTimeout(function() { document.body.dispatchEvent(new CustomEvent('track-change', { detail: 'snowboard' })); }, 50); },
    }, '🏂 单板');
    switcher.appendChild(skiBtn);
    switcher.appendChild(sbBtn);
    phasesContainer.appendChild(switcher);

    updateHeroButtons(track);

    const phases = getPhasesByTrack(track);
    const grid = createElement('div', { className: 'phases-grid' });
    for (const phase of phases) {
      const completedCount = phase.chapters.filter(function(ch) { return isChapterCompleted(ch.id); }).length;
      grid.appendChild(createPhaseCard(phase, completedCount));
    }
    phasesContainer.appendChild(grid);
  }

  function updateHeroButtons(track) {
    const startBtn = document.querySelector('[data-nav]');
    if (startBtn) {
      const chapterId = track === 'ski' ? 'ski-1-1' : 'sb-1-1';
      startBtn.setAttribute('data-nav', chapterId);
      startBtn.textContent = track === 'ski' ? '🎿 开始学习' : '🏂 开始学习';
    }
  }

  function createPhaseCard(phase, completedCount) {
    const phaseIcons = { 1: '🌱', 2: '🌿', 3: '🌳', 4: '🔥', 5: '👑' };
    const card = createElement('div', {
      className: 'phase-card phase-' + phase.num,
      onClick: function() {
        const firstChapter = phase.chapters[0];
        if (firstChapter) navigateToChapter(firstChapter.id);
      },
    });
    const header = createElement('div', { className: 'phase-card-header' });
    header.appendChild(createElement('span', { className: 'phase-card-icon' }, phaseIcons[phase.num] || '⛷️'));
    header.appendChild(createElement('h3', { className: 'phase-card-title' }, 'Phase ' + phase.num + ': ' + phase.title));
    card.appendChild(header);
    const chaptersList = phase.chapters.map(function(ch) { return ch.chapterNumber + '.' + ch.title; }).join(' · ');
    card.appendChild(createElement('p', { className: 'phase-card-desc' }, chaptersList));
    const meta = createElement('div', { className: 'phase-card-meta' });
    meta.appendChild(createElement('span', {}, phase.chapters.length + ' 章'));
    const progressWrap = createElement('div', { className: 'phase-card-progress' });
    const bar = createElement('div', { className: 'phase-card-progress-bar' });
    const percent = phase.chapters.length > 0 ? Math.round((completedCount / phase.chapters.length) * 100) : 0;
    const fill = createElement('div', {
      className: 'phase-card-progress-fill',
      style: 'width:' + percent + '%;background:var(--color-phase-' + phase.num + ')',
    });
    bar.appendChild(fill);
    progressWrap.appendChild(bar);
    progressWrap.appendChild(createElement('span', {}, completedCount + '/' + phase.chapters.length));
    meta.appendChild(progressWrap);
    card.appendChild(meta);
    return card;
  }

  function renderChapter(chapterId) {
    const homePage = $('#homePage');
    const chapterPage = $('#chapterPage');
    const roadmapPage = $('#roadmapPage');
    if (homePage) homePage.style.display = 'none';
    if (chapterPage) chapterPage.style.display = 'block';
    if (roadmapPage) roadmapPage.style.display = 'none';

    const chapter = getChapterById(chapterId);
    if (!chapter) {
      $('#chapterContent').innerHTML = '<div class="text-center mt-8"><h2>章节未找到</h2><p>请从目录中选择一个章节</p></div>';
      return;
    }
    renderChapterContent(chapter);
    renderBreadcrumb(chapter);
    renderChapterNav(chapterId);
    renderMarkComplete(chapterId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderChapterContent(chapter) {
    const container = $('#chapterContent');
    if (!container) return;
    container.innerHTML = '';

    // Header
    const header = createElement('div', { className: 'chapter-header' });
    const badge = createElement('span', { className: 'chapter-phase-badge phase-' + chapter.phaseNum }, chapter.phase);
    header.appendChild(badge);
    header.appendChild(createElement('h1', { className: 'chapter-title' },
      (chapter.icon || '') + ' 第' + chapter.chapterNumber + '章：' + chapter.title
    ));
    const meta = createElement('div', { className: 'chapter-meta' });
    meta.appendChild(createElement('span', { className: 'chapter-meta-item' }, '⏱️ 约' + chapter.readingTime + '分钟'));
    meta.appendChild(createElement('span', { className: 'chapter-meta-item' }, '📚 ' + chapter.phase));
    meta.appendChild(createElement('span', { className: 'chapter-meta-item' }, '🔑 ' + chapter.keyPoints.length + '个知识点'));
    header.appendChild(meta);
    container.appendChild(header);

    // Videos
    if (chapter.videos && chapter.videos.length > 0) {
      container.appendChild(createVideoSection(chapter.videos));
    }

    // Sections
    for (const section of chapter.sections) {
      const wrapper = createElement('div', { className: 'content-section' });
      const icon = section.icon || '📌';
      wrapper.appendChild(createElement('h3', { className: 'section-heading' },
        createElement('span', { className: 'section-icon' }, icon) + ' ' + section.title
      ));
      const body = createElement('div', { className: 'section-body' });
      body.innerHTML = section.content;
      wrapper.appendChild(body);
      container.appendChild(wrapper);
    }

    // Key points
    if (chapter.keyPoints && chapter.keyPoints.length > 0) {
      const kpWrap = createElement('div', { className: 'content-section' });
      kpWrap.appendChild(createElement('h3', { className: 'section-heading' },
        createElement('span', { className: 'section-icon' }, '🔑') + ' 本章知识点'
      ));
      const tags = createElement('div', { className: 'key-points' });
      for (const kp of chapter.keyPoints) {
        tags.appendChild(createElement('span', { className: 'key-point-tag' }, kp));
      }
      kpWrap.appendChild(tags);
      container.appendChild(kpWrap);
    }
  }

  function renderBreadcrumb(chapter) {
    const bc = $('#breadcrumb');
    if (!bc) return;
    bc.innerHTML = '';
    const trackLabel = chapter.track === 'ski' ? '🎿 双板滑雪' : '🏂 单板滑雪';
    bc.appendChild(createElement('a', { href: '#/', onClick: function(e) { e.preventDefault(); navigate('/'); } }, '🏠 首页'));
    bc.appendChild(createElement('span', { className: 'breadcrumb-sep' }, '›'));
    bc.appendChild(createElement('a', { href: '#/', onClick: function(e) { e.preventDefault(); navigate('/'); } }, trackLabel));
    bc.appendChild(createElement('span', { className: 'breadcrumb-sep' }, '›'));
    bc.appendChild(createElement('span', {}, chapter.phase));
    bc.appendChild(createElement('span', { className: 'breadcrumb-sep' }, '›'));
    bc.appendChild(createElement('span', { style: 'color:var(--color-text);font-weight:600;' }, chapter.title));
  }

  function renderChapterNav(currentId) {
    const nav = $('#chapterNavBottom');
    if (!nav) return;
    nav.innerHTML = '';
    const chapter = getChapterById(currentId);
    if (!chapter) return;
    const chapters = getChaptersByTrack(chapter.track);
    const idx = chapters.findIndex(function(ch) { return ch.id === currentId; });
    const prevChapter = idx > 0 ? chapters[idx - 1] : null;
    const nextChapter = idx < chapters.length - 1 ? chapters[idx + 1] : null;

    const prevBtn = createElement('button', {
      className: 'chapter-nav-btn',
      disabled: !prevChapter ? 'true' : undefined,
      onClick: function() { if (prevChapter) navigateToChapter(prevChapter.id); },
    });
    prevBtn.innerHTML = '◀ ' + (prevChapter ? '第' + prevChapter.chapterNumber + '章：' + prevChapter.title : '已是最前');
    nav.appendChild(prevBtn);

    const nextBtn = createElement('button', {
      className: 'chapter-nav-btn',
      disabled: !nextChapter ? 'true' : undefined,
      onClick: function() { if (nextChapter) navigateToChapter(nextChapter.id); },
    });
    nextBtn.innerHTML = (nextChapter ? '第' + nextChapter.chapterNumber + '章：' + nextChapter.title : '已是最后') + ' ▶';
    nav.appendChild(nextBtn);
  }

  function renderMarkComplete(chapterId) {
    const container = $('#chapterContent');
    if (!container) return;
    const existing = document.getElementById('markCompleteBtn');
    if (existing && existing.parentElement) existing.parentElement.remove();

    const wrap = createElement('div', { className: 'mark-complete-wrap' });
    const isDone = isChapterCompleted(chapterId);
    const btn = createElement('button', {
      id: 'markCompleteBtn',
      className: 'btn btn-outline mark-complete-btn' + (isDone ? ' completed' : ''),
      onClick: function() { handleMarkComplete(); },
    }, isDone ? '✅ 已完成 — 点击取消' : '✅ 标记完成');
    wrap.appendChild(btn);
    container.appendChild(wrap);
  }

  function renderRoadmap() {
    const homePage = $('#homePage');
    const chapterPage = $('#chapterPage');
    const roadmapPage = $('#roadmapPage');
    if (homePage) homePage.style.display = 'none';
    if (chapterPage) chapterPage.style.display = 'none';
    if (roadmapPage) roadmapPage.style.display = 'block';
    if (!roadmapPage) return;

    const { track } = getState();
    const phases = getPhasesByTrack(track);
    roadmapPage.innerHTML = '';
    roadmapPage.appendChild(createElement('h1', { className: 'roadmap-title' },
      track === 'ski' ? '🎿 双板学习路线图 · Skiflow 雪迹' : '🏂 单板学习路线图 · Skiflow 雪迹'
    ));

    const timeline = createElement('div', { className: 'roadmap-timeline' });
    for (const phase of phases) {
      const phaseEl = createElement('div', { className: 'roadmap-phase' });
      phaseEl.appendChild(createElement('div', { className: 'roadmap-phase-dot phase-' + phase.num }));
      phaseEl.appendChild(createElement('h2', { className: 'roadmap-phase-title' }, 'Phase ' + phase.num + ': ' + phase.title));
      const list = createElement('div', { className: 'roadmap-chapter-list' });
      for (const ch of phase.chapters) {
        const item = createElement('div', { className: 'roadmap-chapter', onClick: function() { navigateToChapter(ch.id); } });
        item.appendChild(createElement('span', { className: 'roadmap-chapter-num' }, ch.chapterNumber + '.'));
        item.appendChild(createElement('span', {}, ch.title));
        if (isChapterCompleted(ch.id)) {
          item.appendChild(createElement('span', { style: 'color:var(--color-success);' }, '✅'));
        }
        list.appendChild(item);
      }
      phaseEl.appendChild(list);
      timeline.appendChild(phaseEl);
    }
    roadmapPage.appendChild(timeline);
  }

  function renderAppendix(appendixId) {
    const homePage = $('#homePage');
    const chapterPage = $('#chapterPage');
    const roadmapPage = $('#roadmapPage');
    if (homePage) homePage.style.display = 'none';
    if (chapterPage) chapterPage.style.display = 'block';
    if (roadmapPage) roadmapPage.style.display = 'none';

    const appendix = appendices.find(function(a) { return a.id === appendixId; });
    if (!appendix) {
      $('#chapterContent').innerHTML = '<div class="text-center mt-8"><h2>附录未找到</h2></div>';
      return;
    }
    const bc = $('#breadcrumb');
    if (bc) {
      bc.innerHTML = '';
      bc.appendChild(createElement('a', { href: '#/', onClick: function(e) { e.preventDefault(); navigate('/'); } }, '🏠 首页'));
      bc.appendChild(createElement('span', { className: 'breadcrumb-sep' }, '›'));
      bc.appendChild(createElement('span', {}, '📚 附录'));
      bc.appendChild(createElement('span', { className: 'breadcrumb-sep' }, '›'));
      bc.appendChild(createElement('span', { style: 'color:var(--color-text);font-weight:600;' }, appendix.title));
    }
    const container = $('#chapterContent');
    if (container) {
      container.innerHTML = '';
      const header = createElement('div', { className: 'chapter-header' });
      header.appendChild(createElement('h1', { className: 'chapter-title' }, appendix.icon + ' ' + appendix.title));
      container.appendChild(header);
      const body = createElement('div', { className: 'content-section' });
      const bodyInner = createElement('div', { className: 'section-body' });
      bodyInner.innerHTML = appendix.content;
      body.appendChild(bodyInner);
      container.appendChild(body);
    }
    const nav = $('#chapterNavBottom');
    if (nav) nav.innerHTML = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ═══════════════════════════════════════════════════════════════════
  // components/navigation.js
  // ═══════════════════════════════════════════════════════════════════
  function initNavigation() {
    subscribe('currentChapterId', function(newId) { updateActiveChapter(newId); });
    subscribe('completedChapters', function() { renderSidebar(); });
    subscribe('track', function() { renderSidebar(); });
    renderSidebar();

    const hamburger = $('#hamburger');
    const sidebar = $('#sidebar');
    const backdrop = $('#sidebarBackdrop');
    if (hamburger) {
      hamburger.addEventListener('click', function() {
        const isOpen = !getState().sidebarOpen;
        setState({ sidebarOpen: isOpen });
        if (sidebar) sidebar.classList.toggle('open', isOpen);
        if (backdrop) backdrop.classList.toggle('show', isOpen);
      });
    }
    if (backdrop) {
      backdrop.addEventListener('click', function() {
        setState({ sidebarOpen: false });
        if (sidebar) sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('show');
      });
    }
    document.addEventListener('click', function(e) {
      if (e.target.closest('.nav-chapter') || e.target.closest('.nav-appendix-item')) {
        if (getState().sidebarOpen) {
          setState({ sidebarOpen: false });
          if (sidebar) sidebar.classList.remove('open');
          if (backdrop) backdrop.classList.remove('show');
        }
      }
    });
  }

  function renderSidebar() {
    const container = $('#sidebarNav');
    if (!container) return;
    const { track } = getState();
    const phases = getPhasesByTrack(track);
    const currentChapterId = getState().currentChapterId;
    container.innerHTML = '';

    // Home
    container.appendChild(createElement('div', {
      className: 'nav-chapter' + (!currentChapterId ? ' active' : ''),
      onClick: function() { navigate('/'); },
    }, [createElement('span', { className: 'nav-chapter-num' }, '🏠'), createElement('span', { className: 'nav-chapter-title' }, '学习首页')]));

    // Roadmap
    container.appendChild(createElement('div', {
      className: 'nav-chapter',
      onClick: function() { navigate('/roadmap'); },
    }, [createElement('span', { className: 'nav-chapter-num' }, '🗺️'), createElement('span', { className: 'nav-chapter-title' }, '学习路线图')]));

    container.appendChild(createElement('div', { style: 'height:1px;background:rgba(255,255,255,0.1);margin:8px 12px;' }));

    // Track toggle
    const trackToggle = createElement('div', { style: 'display:flex;gap:4px;padding:4px 12px;margin-bottom:4px;' });
    const skiActive = track === 'ski';
    const sbActive = track === 'snowboard';
    trackToggle.appendChild(createElement('button', {
      style: 'flex:1;padding:6px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,0.15);background:' + (skiActive ? 'var(--color-primary)' : 'transparent') + ';color:' + (skiActive ? '#fff' : 'var(--color-text-sidebar)') + ';transition:all 0.2s;',
      onClick: function() { setState({ track: 'ski' }); },
    }, '🎿 双板'));
    trackToggle.appendChild(createElement('button', {
      style: 'flex:1;padding:6px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,0.15);background:' + (sbActive ? 'var(--color-primary)' : 'transparent') + ';color:' + (sbActive ? '#fff' : 'var(--color-text-sidebar)') + ';transition:all 0.2s;',
      onClick: function() { setState({ track: 'snowboard' }); },
    }, '🏂 单板'));
    container.appendChild(trackToggle);

    // Phases
    for (const phase of phases) {
      const isCurrentPhase = phase.chapters.some(function(ch) { return ch.id === currentChapterId; });
      const phaseEl = createElement('div', { className: 'nav-phase' + (isCurrentPhase ? ' open' : '') });
      const completedCount = phase.chapters.filter(function(ch) { return isChapterCompleted(ch.id); }).length;

      const header = createElement('div', {
        className: 'nav-phase-header',
        onClick: function() { phaseEl.classList.toggle('open'); },
      });
      const left = createElement('div', { className: 'nav-phase-header-left' });
      left.appendChild(createElement('span', { className: 'nav-phase-icon' }, phase.icon || '📌'));
      left.appendChild(createElement('span', { className: 'nav-phase-title' }, 'Phase ' + phase.num + ': ' + phase.title));
      header.appendChild(left);
      header.appendChild(createElement('span', { className: 'nav-phase-progress' }, completedCount + '/' + phase.chapters.length));
      header.appendChild(createElement('span', { className: 'nav-phase-arrow' }, '▶'));
      phaseEl.appendChild(header);

      const chaptersList = createElement('div', { className: 'nav-chapters' });
      for (const ch of phase.chapters) {
        const isActive = ch.id === currentChapterId;
        const isDone = isChapterCompleted(ch.id);
        chaptersList.appendChild(createElement('div', {
          className: 'nav-chapter' + (isActive ? ' active' : '') + (isDone ? ' completed' : ''),
          dataset: { chapterId: ch.id },
          onClick: function() { navigateToChapter(ch.id); },
        }, [
          createElement('span', { className: 'nav-chapter-num' }, ch.chapterNumber + '.'),
          createElement('span', { className: 'nav-chapter-title' }, ch.title),
          createElement('span', { className: 'nav-chapter-check' }, '✓'),
        ]));
      }
      phaseEl.appendChild(chaptersList);
      container.appendChild(phaseEl);
    }

    // Appendices
    const appSection = createElement('div', { className: 'nav-appendix' });
    appSection.appendChild(createElement('div', { className: 'nav-appendix-label' }, '📚 附录'));
    for (const app of appendices) {
      const isActive = window.location.hash.includes(app.id);
      appSection.appendChild(createElement('div', {
        className: 'nav-appendix-item' + (isActive ? ' active' : ''),
        onClick: function() { navigate('/appendix/' + app.id); },
      }, [createElement('span', {}, app.icon), createElement('span', {}, app.title)]));
    }
    container.appendChild(appSection);
  }

  function updateActiveChapter(chapterId) {
    const allChapters = document.querySelectorAll('.nav-chapter');
    for (let i = 0; i < allChapters.length; i++) { allChapters[i].classList.remove('active'); }
    if (chapterId) {
      const activeEl = document.querySelector('.nav-chapter[data-chapter-id="' + chapterId + '"]');
      if (activeEl) {
        activeEl.classList.add('active');
        const phase = activeEl.closest('.nav-phase');
        if (phase) phase.classList.add('open');
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // components/search.js
  // ═══════════════════════════════════════════════════════════════════
  let searchIndex = [];
  function initSearch() {
    buildIndex();
    const searchBox = $('#searchBox');
    const overlay = $('#searchOverlay');
    const overlayInput = $('#overlaySearchInput');
    const searchClose = $('#searchClose');
    const backdrop = overlay ? overlay.querySelector('.search-overlay-backdrop') : null;

    if (searchBox) searchBox.addEventListener('click', function() { openSearch(); });
    const searchInput = $('#searchInput');
    if (searchInput) searchInput.addEventListener('focus', function() { openSearch(); });
    if (searchClose) searchClose.addEventListener('click', function() { closeSearch(); });
    if (backdrop) backdrop.addEventListener('click', function() { closeSearch(); });

    if (overlayInput) {
      overlayInput.addEventListener('input', function(e) { performSearch(e.target.value); });
    }

    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (overlay && overlay.classList.contains('open')) closeSearch(); else openSearch();
      }
      if (e.key === 'Escape') {
        if (overlay && overlay.classList.contains('open')) closeSearch();
      }
    });
  }

  function buildIndex() {
    searchIndex = [];
    for (let i = 0; i < ALL_CHAPTERS.length; i++) {
      const ch = ALL_CHAPTERS[i];
      const textParts = [ch.title, ch.phase];
      for (let j = 0; j < ch.sections.length; j++) {
        const s = ch.sections[j];
        textParts.push(s.title);
        textParts.push(s.content.replace(/<[^>]*>/g, ' '));
      }
      textParts.push(ch.keyPoints.join(' '));
      searchIndex.push({ chapter: ch, text: textParts.join(' ').toLowerCase() });
    }
    for (let i = 0; i < appendices.length; i++) {
      const app = appendices[i];
      searchIndex.push({
        chapter: { id: app.id, title: app.title, phase: '附录', phaseNum: 0, track: 'appendix', icon: app.icon },
        text: (app.title + ' ' + app.content.replace(/<[^>]*>/g, ' ')).toLowerCase(),
      });
    }
  }

  function openSearch() {
    const overlay = $('#searchOverlay');
    if (!overlay) return;
    overlay.classList.add('open');
    const input = $('#overlaySearchInput');
    if (input) { input.value = ''; input.focus(); }
    const results = $('#searchResults');
    if (results) results.innerHTML = '<div class="search-empty">输入关键词开始搜索课程内容</div>';
  }

  function closeSearch() {
    const overlay = $('#searchOverlay');
    if (overlay) overlay.classList.remove('open');
  }

  function performSearch(query) {
    const resultsContainer = $('#searchResults');
    if (!resultsContainer) return;
    const q = query.trim().toLowerCase();
    if (!q) { resultsContainer.innerHTML = '<div class="search-empty">输入关键词开始搜索课程内容</div>'; return; }

    const results = [];
    for (let i = 0; i < searchIndex.length; i++) {
      const entry = searchIndex[i];
      if (entry.text.indexOf(q) !== -1) {
        const idx = entry.text.indexOf(q);
        const start = Math.max(0, idx - 30);
        const end = Math.min(entry.text.length, idx + q.length + 50);
        let snippet = entry.text.slice(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < entry.text.length) snippet = snippet + '...';
        results.push({ chapter: entry.chapter, snippet: snippet });
      }
    }

    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="search-no-results"><div class="search-no-results-icon">🔍</div><div class="search-no-results-text">未找到相关内容</div><div style="color:var(--color-text-muted);font-size:12px;margin-top:8px;">试试其他关键词，如：犁式、换刃、卡宾、粉雪</div></div>';
      return;
    }

    resultsContainer.innerHTML = '';
    const displayResults = results.slice(0, 20);
    for (let i = 0; i < displayResults.length; i++) {
      const result = displayResults[i];
      const item = createElement('div', {
        className: 'search-result-item',
        onClick: function() {
          closeSearch();
          if (result.chapter.track === 'appendix') navigate('/appendix/' + result.chapter.id);
          else navigateToChapter(result.chapter.id);
        },
      });
      item.appendChild(createElement('span', { className: 'search-result-icon' }, result.chapter.icon || '📌'));
      const info = createElement('div', { className: 'search-result-info' });
      const trackLabel = result.chapter.track === 'ski' ? '🎿 双板' : result.chapter.track === 'snowboard' ? '🏂 单板' : '📚 附录';
      const titleText = result.chapter.track === 'appendix' ? result.chapter.title : '第' + result.chapter.chapterNumber + '章：' + result.chapter.title;
      info.appendChild(createElement('div', { className: 'search-result-title' }, titleText));
      info.appendChild(createElement('div', { className: 'search-result-phase' }, trackLabel + ' · ' + result.chapter.phase));
      const snippet = createElement('div', { className: 'search-result-snippet' });
      snippet.innerHTML = highlightText(result.snippet, query);
      info.appendChild(snippet);
      item.appendChild(info);
      resultsContainer.appendChild(item);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // app.js — Main initialization
  // ═══════════════════════════════════════════════════════════════════
  function init() {
    initTheme();
    initProgress();
    initSearch();
    initNavigation();

    onRoute(function(route) {
      const { view, track, chapterId, appendixId } = route;
      if (track && track !== getState().track) setState({ track });
      const currentTrack = track || getState().track;
      switch (view) {
        case 'home':
          setState({ currentChapterId: null, currentView: 'home' });
          renderHome(currentTrack);
          break;
        case 'chapter':
          if (!chapterId) { navigate('/'); return; }
          setState({ currentChapterId: chapterId, currentView: 'chapter' });
          renderChapter(chapterId);
          break;
        case 'roadmap':
          setState({ currentChapterId: null, currentView: 'roadmap' });
          renderRoadmap();
          break;
        case 'appendix':
          if (!appendixId) { navigate('/'); return; }
          setState({ currentChapterId: null, currentView: 'appendix' });
          renderAppendix(appendixId);
          break;
        default:
          navigate('/');
      }
    });

    initRouter();

    document.body.addEventListener('track-change', function(e) {
      setState({ track: e.detail });
      renderHome(e.detail);
    });

    // Data-nav button handler
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('[data-nav]');
      if (!btn) return;
      e.preventDefault();
      const target = btn.getAttribute('data-nav');
      if (!target) return;
      if (target === 'roadmap') { navigate('/roadmap'); return; }
      const chTrack = target.startsWith('sb-') ? 'snowboard' : 'ski';
      if (chTrack !== getState().track) setState({ track: chTrack });
      navigate('/' + chTrack + '/' + target.replace(/^(ski|sb)-/, ''));
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      const { currentView, currentChapterId, track } = getState();
      if (currentView === 'chapter' && currentChapterId) {
        const chapters = getChaptersByTrack(track);
        const idx = chapters.findIndex(function(ch) { return ch.id === currentChapterId; });
        if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && idx < chapters.length - 1) {
          e.preventDefault(); navigateToChapter(chapters[idx + 1].id);
        }
        if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && idx > 0) {
          e.preventDefault(); navigateToChapter(chapters[idx - 1].id);
        }
      }
    });
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
