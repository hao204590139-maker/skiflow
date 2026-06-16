/**
 * Skiflow 雪迹 — Extras
 * Snowflakes animation + Global Resorts + Ski Certification Systems
 */
(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // SNOWFLAKES
  // ═══════════════════════════════════════════════════════════════════
  function initSnowflakes() {
    var container = document.getElementById('snowflakes');
    if (!container) return;
    var flakes = ['❄', '❅', '❆', '✦', '•', '❋', '✧'];
    for (var i = 0; i < 30; i++) {
      var flake = document.createElement('span');
      flake.className = 'snowflake';
      flake.textContent = flakes[i % flakes.length];
      flake.style.left = Math.random() * 100 + '%';
      flake.style.animationDelay = Math.random() * 15 + 's';
      flake.style.opacity = (0.3 + Math.random() * 0.5);
      container.appendChild(flake);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // GLOBAL SKI RESORT DATA
  // ═══════════════════════════════════════════════════════════════════
  var RESORTS = [
    // ── China ──
    { name:'万龙滑雪场',en:'Wanlong',country:'🇨🇳 中国',region:'河北崇礼',level:'all',price:'¥400-700/天',desc:'冬奥会举办地，国内设施最完善的雪场之一，32条雪道，最长5km。高铁北京1h直达。',url:'https://www.wlski.com',lat:'40.96',lng:'115.42',elev:'1560-2110m',season:'11月-3月'},
    { name:'云顶滑雪公园',en:'Genting Snow Park',country:'🇨🇳 中国',region:'河北崇礼',level:'all',price:'¥450-750/天',desc:'2022冬奥会比赛场地，U型池、障碍追逐赛道保留。奥运会标准设施。',url:'https://www.gentingresort.com',lat:'40.94',lng:'115.45',elev:'1500-2100m',season:'11月-3月'},
    { name:'太舞滑雪小镇',en:'Thaiwoo',country:'🇨🇳 中国',region:'河北崇礼',level:'all',price:'¥380-680/天',desc:'欧式小镇风格，适合家庭度假，有大型儿童滑雪乐园。31条雪道。',url:'https://www.thaiwoo.com',lat:'40.92',lng:'115.38',elev:'1600-2160m',season:'11月-3月'},
    { name:'北大壶滑雪场',en:'Beidahu',country:'🇨🇳 中国',region:'吉林',level:'intermediate',price:'¥350-600/天',desc:'东北粉雪代表，雪质极佳，落差870m，是东北地区最大的滑雪度假区。',url:'https://www.beidahuski.com',lat:'43.42',lng:'126.60',elev:'540-1410m',season:'11月-4月'},
    { name:'长白山万达国际度假区',en:'Wanda Changbaishan',country:'🇨🇳 中国',region:'吉林长白山',level:'beginner',price:'¥400-700/天',desc:'大型综合度假区，43条雪道，含温泉、水乐园。适合初中级和家庭。',url:'https://www.changbaishanresort.com',lat:'42.05',lng:'127.68',elev:'950-1350m',season:'11月-4月'},
    { name:'可可托海国际滑雪场',en:'Keketuohai',country:'🇨🇳 中国',region:'新疆阿勒泰',level:'advanced',price:'¥280-500/天',desc:'国内雪季最长（10月-5月），天然粉雪，最大落差1219m，野雪天堂。',url:'https://www.keketuohaiski.com',lat:'47.22',lng:'89.78',elev:'1820-3040m',season:'10月-5月'},
    { name:'阿勒泰将军山滑雪场',en:'Jiangjunshan Altay',country:'🇨🇳 中国',region:'新疆阿勒泰',level:'all',price:'¥200-380/天',desc:'人类滑雪起源地，天然粉雪，夜场开放，性价比极高。',url:'https://www.altayski.com',lat:'47.85',lng:'88.13',elev:'1100-1680m',season:'11月-4月'},
    { name:'亚布力滑雪场',en:'Yabuli',country:'🇨🇳 中国',region:'黑龙江',level:'all',price:'¥300-500/天',desc:'中国最早的滑雪场之一，17条雪道。举办过亚冬会，设施成熟。',url:'https://www.yabuliski.com',lat:'44.78',lng:'128.45',elev:'397-1374m',season:'11月-4月'},

    // ── Japan ──
    { name:'二世古比罗夫',en:'Niseko Grand Hirafu',country:'🇯🇵 日本',region:'北海道',level:'all',price:'¥5,800-8,500/天',desc:'世界级粉雪Japow，年均降雪15m。国际化度假区，4个联通雪场。',url:'https://www.niseko.ne.jp',lat:'42.80',lng:'140.68',elev:'260-1200m',season:'12月-4月'},
    { name:'白马八方尾根',en:'Hakuba Happo-One',country:'🇯🇵 日本',region:'长野',level:'advanced',price:'¥5,200-7,200/天',desc:'1998冬奥会场地，日本最大落差1071m，极佳野雪和陡坡。',url:'https://www.happo-one.jp',lat:'36.70',lng:'137.83',elev:'760-1831m',season:'12月-4月'},
    { name:'留寿都',en:'Rusutsu Resort',country:'🇯🇵 日本',region:'北海道',level:'all',price:'¥5,500-8,000/天',desc:'北海道最大单体雪场，37条雪道，粉雪不输二世古，人更少。',url:'https://rusutsu.com',lat:'42.73',lng:'140.90',elev:'400-994m',season:'12月-4月'},
    { name:'富良野',en:'Furano',country:'🇯🇵 日本',region:'北海道',level:'intermediate',price:'¥4,800-6,800/天',desc:'干粉雪代表，人少雪好，日剧取景地。23条雪道，适合初中级。',url:'https://www.furanoski.com',lat:'43.34',lng:'142.63',elev:'240-1074m',season:'12月-3月'},
    { name:'野泽温泉',en:'Nozawa Onsen',country:'🇯🇵 日本',region:'长野',level:'all',price:'¥4,800-6,500/天',desc:'滑雪+温泉完美结合，传统温泉小镇，50km雪道，最长滑行10km。',url:'https://www.nozawaski.com',lat:'36.92',lng:'138.45',elev:'565-1650m',season:'12月-4月'},

    // ── Europe ──
    { name:'三峡谷',en:'Les Trois Vallées',country:'🇫🇷 法国',region:'萨瓦省',level:'all',price:'€62-75/天',desc:'世界最大联滑雪区！600km+雪道，含高雪维尔、梅里贝尔、葱仁谷等8个雪场。',url:'https://www.les3vallees.com',lat:'45.37',lng:'6.57',elev:'1300-3230m',season:'12月-4月'},
    { name:'策尔马特',en:'Zermatt',country:'🇨🇭 瑞士',region:'瓦莱州',level:'all',price:'CHF 79-105/天',desc:'马特宏峰下四季雪场，360km雪道，可跨国滑到意大利Cervinia。',url:'https://www.zermatt.ch',lat:'46.02',lng:'7.75',elev:'1620-3883m',season:'全年(冰川)'},
    { name:'夏慕尼',en:'Chamonix',country:'🇫🇷 法国',region:'上萨瓦省',level:'advanced',price:'€55-68/天',desc:'登山滑雪圣地，20km传奇Vallée Blanche野雪路线，勃朗峰脚下。',url:'https://www.chamonix.com',lat:'45.92',lng:'6.87',elev:'1035-3842m',season:'12月-5月'},
    { name:'圣安东',en:'St. Anton am Arlberg',country:'🇦🇹 奥地利',region:'蒂罗尔',level:'advanced',price:'€62-76/天',desc:'奥地利最大联滑雪区305km，Après-ski文化发源地，野雪资源丰富。',url:'https://www.stantonamarlberg.com',lat:'47.13',lng:'10.27',elev:'1304-2811m',season:'12月-4月'},
    { name:'科尔蒂纳丹佩佐',en:'Cortina d\'Ampezzo',country:'🇮🇹 意大利',region:'多洛米蒂',level:'all',price:'€58-72/天',desc:'2026冬奥会举办地，多洛米蒂绝美山景，120km雪道+Sella Ronda环线。',url:'https://www.dolomiti.org',lat:'46.54',lng:'12.14',elev:'1224-2930m',season:'12月-4月'},
    { name:'韦尔比耶',en:'Verbier',country:'🇨🇭 瑞士',region:'瓦莱州',level:'advanced',price:'CHF 75-95/天',desc:'4大峡谷410km雪道，世界级野雪和陡坡，名人富豪滑雪胜地。',url:'https://www.verbier.ch',lat:'46.10',lng:'7.23',elev:'1500-3330m',season:'12月-4月'},

    // ── North America ──
    { name:'惠斯勒黑梳山',en:'Whistler Blackcomb',country:'🇨🇦 加拿大',region:'BC省',level:'all',price:'C$160-190/天',desc:'北美最大雪场！两座山200+雪道，8171英亩，peak2peak缆车连接。',url:'https://www.whistlerblackcomb.com',lat:'50.11',lng:'-122.95',elev:'653-2284m',season:'11月-5月'},
    { name:'杰克逊霍尔',en:'Jackson Hole',country:'🇺🇸 美国',region:'怀俄明',level:'advanced',price:'$180-225/天',desc:'极限陡坡Corbet\'s Couloir闻名于世，2500+英亩，50%黑道。',url:'https://www.jacksonhole.com',lat:'43.59',lng:'-110.88',elev:'1923-3185m',season:'11月-4月'},
    { name:'韦尔',en:'Vail',country:'🇺🇸 美国',region:'科罗拉多',level:'all',price:'$195-239/天',desc:'美国最大单体雪场5300+英亩，7个碗状地形Back Bowls世界闻名。',url:'https://www.vail.com',lat:'39.64',lng:'-106.37',elev:'2470-3527m',season:'11月-4月'},
    { name:'阿斯本',en:'Aspen Snowmass',country:'🇺🇸 美国',region:'科罗拉多',level:'all',price:'$179-229/天',desc:'4座山联滑，5557英亩，好莱坞明星滑雪首选。雪堆山超大面积。',url:'https://www.aspensnowmass.com',lat:'39.19',lng:'-106.82',elev:'2408-3813m',season:'11月-4月'},
    { name:'帕克城',en:'Park City',country:'🇺🇸 美国',region:'犹他',level:'all',price:'$175-215/天',desc:'美国最大单雪场7300+英亩，2002冬奥会场地，犹他干粉雪。',url:'https://www.parkcitymountain.com',lat:'40.65',lng:'-111.51',elev:'2100-3048m',season:'11月-4月'},
    { name:'斯阔谷',en:'Palisades Tahoe',country:'🇺🇸 美国',region:'加州',level:'advanced',price:'$169-219/天',desc:'1960冬奥会场地，年均降雪10m+，极佳陡坡和野雪，KT-22缆车传奇。',url:'https://www.palisadestahoe.com',lat:'39.19',lng:'-120.24',elev:'1890-2750m',season:'11月-5月'},
    { name:'班夫阳光村',en:'Banff Sunshine',country:'🇨🇦 加拿大',region:'艾伯塔',level:'all',price:'C$130-160/天',desc:'三座山联滑，3300+英亩，加拿大最长的非冰川雪季（11月-5月）。',url:'https://www.skibanff.com',lat:'51.11',lng:'-115.76',elev:'1660-2730m',season:'11月-5月'},

    // ── Korea ──
    { name:'龙平滑雪场',en:'Yongpyong Resort',country:'🇰🇷 韩国',region:'江原道',level:'all',price:'₩75,000-95,000/天',desc:'2018冬奥会举办地，韩国最大雪场28条雪道，韩剧冬季恋歌取景地。',url:'https://www.yongpyong.co.kr',lat:'37.64',lng:'128.68',elev:'700-1458m',season:'11月-3月'},
    { name:'High1雪场',en:'High1 Resort',country:'🇰🇷 韩国',region:'江原道',level:'all',price:'₩65,000-85,000/天',desc:'韩国第二大雪场，18条雪道，综合度假村含赌场。',url:'https://www.high1.com',lat:'37.14',lng:'128.93',elev:'645-1345m',season:'11月-3月'},

    // ── Oceania ──
    { name:'皇后镇卓越山',en:'The Remarkables',country:'🇳🇿 新西兰',region:'皇后镇',level:'all',price:'NZ$139-169/天',desc:'指环王取景地旁，南半球最佳雪场之一，绝美湖景+雪山。',url:'https://www.theremarkables.co.nz',lat:'-45.05',lng:'168.81',elev:'1475-1943m',season:'6月-10月'},
    { name:'卡德罗纳',en:'Cardrona Alpine Resort',country:'🇳🇿 新西兰',region:'瓦纳卡',level:'all',price:'NZ$145-175/天',desc:'新西兰最大滑雪区，极佳公园，奥运会选手训练基地。',url:'https://www.cardrona.com',lat:'-44.87',lng:'168.95',elev:'1670-1860m',season:'6月-10月'},

    // ── South America ──
    { name:'波蒂略',en:'Portillo',country:'🇨🇱 智利',region:'安第斯山脉',level:'all',price:'US$150-220/天(含食宿)',desc:'南美最传奇雪场，绝美安第斯高山湖景，夏季(北半球)7-10月滑雪。',url:'https://www.skiportillo.com',lat:'-32.84',lng:'-70.13',elev:'2800-3310m',season:'6月-10月'},
  ];

  // ═══════════════════════════════════════════════════════════════════
  // SKI CERTIFICATION DATA
  // ═══════════════════════════════════════════════════════════════════
  var CERTS = [
    { id:'cn', flag:'🇨🇳', country:'中国', org:'中国滑雪协会 (CSA)', title:'中国大众滑雪技术等级', en:'Chinese Ski Level System',
      levels:['1级·初级','2级·初级','3级·中级','4级·中级','5级·高级','6级·高级','7级·精英','8级·精英','9级·大师'],
      desc:'<p><strong>考试内容：</strong>犁式转弯→平行式→卡宾→小弯→蘑菇→综合考评。每级需通过理论和实操两项。</p><p><strong>报名方式：</strong>通过各地滑雪场学校或中国滑雪协会官网报名。全国各地滑雪场定期举办等级考核。</p><p><strong>费用：</strong>¥300-800/级（含考务费和场地费）</p>',
      url:'https://www.skiing.org.cn', learnUrl:'https://www.skiing.org.cn' },

    { id:'us', flag:'🇺🇸', country:'美国', org:'PSIA-AASI', title:'美国专业滑雪教练协会', en:'Professional Ski Instructors of America',
      levels:['Level 1·初级教练','Level 2·中级教练','Level 3·高级教练','National Team·国家队','Examiner·考官'],
      desc:'<p><strong>PSIA-AASI</strong>是美国最大的滑雪教学认证机构，分双板(Alpine)、单板(Snowboard)、越野、Telemark等方向。</p><p><strong>考试内容：</strong>滑行技术展示+教学能力+动作分析+安全知识。L1需5天课程+考试。</p><p><strong>报名方式：</strong>官网psia-aasi.org注册，选择所属区域(如PSIA-RM落基山区域)，参加认证课程和考试。</p><p><strong>费用：</strong>L1约$1,200-1,800（含培训+考试+年费）</p>',
      url:'https://www.psia-aasi.org', learnUrl:'https://www.psia-aasi.org/certification' },

    { id:'ca', flag:'🇨🇦', country:'加拿大', org:'CSIA', title:'加拿大滑雪教练联盟', en:'Canadian Ski Instructors\' Alliance',
      levels:['Level 1·初级教练','Level 2·中级教练','Level 3·高级教练','Level 4·专家级','Course Conductor·培训师'],
      desc:'<p><strong>CSIA</strong>是加拿大国家级滑雪教学认证，以技术精准著称。L4是世界顶级教练资质。</p><p><strong>考试内容：</strong>滑行能力(Carving, Short Turns, Moguls)+教学演示+技术分析。</p><p><strong>报名：</strong>官网snowpro.com注册，各省分会定期举办认证课程。</p><p><strong>费用：</strong>L1约CA$800-1,200，L4需多年积累。</p>',
      url:'https://www.snowpro.com', learnUrl:'https://www.snowpro.com/en/certification' },

    { id:'uk', flag:'🇬🇧', country:'英国', org:'BASI', title:'英国滑雪教练协会', en:'British Association of Snowsports Instructors',
      levels:['Level 1·初级教练','Level 2·中级教练','Level 3·ISIA国际认证','Level 4·ISTD最高级','Trainer·培训师'],
      desc:'<p><strong>BASI</strong>是全球认可度最高的滑雪教学认证之一，L3=ISIA国际教练资格，L4=ISTD可在全球任意雪场教学。</p><p><strong>考试：</strong>L1-2在室内或室外雪场完成，L3-4需高山环境。包含200+小时教学实践。</p><p><strong>报名：</strong>basi.org.uk在线注册课程。</p><p><strong>费用：</strong>L1约£600-900，L4约£5,000+（含全部培训）</p>',
      url:'https://www.basi.org.uk', learnUrl:'https://www.basi.org.uk/train-with-basi' },

    { id:'nz', flag:'🇳🇿', country:'新西兰', org:'NZSIA', title:'新西兰滑雪教练联盟', en:'New Zealand Snowsports Instructors Alliance',
      levels:['Level 1·初级教练','Level 2·中级教练','Level 3·ISIA国际认证','Trainer·培训师','Examiner·考官'],
      desc:'<p><strong>NZSIA</strong>以实用高效的培训体系闻名，北半球夏季(6-10月)可在新西兰考取。</p><p><strong>考试内容：</strong>与CSIA/PSIA类似，侧重功能性滑行和教学能力。</p><p><strong>报名：</strong>nzsia.org注册课程，南岛多家雪场提供培训。</p><p><strong>费用：</strong>L1约NZ$800-1,200</p>',
      url:'https://www.nzsia.org', learnUrl:'https://www.nzsia.org/training' },

    { id:'jp', flag:'🇯🇵', country:'日本', org:'SAJ', title:'全日本滑雪联盟 (SAJ)', en:'Ski Association of Japan',
      levels:['5级·入门','4级·初级','3级·中级','2级·上级','1级·高级','Crown·皇冠级','Technical Crown·技术皇冠'],
      desc:'<p><strong>SAJ</strong>是亚洲最大的滑雪认证体系。日本国内雪场广泛认可。</p><p><strong>考试：</strong>2级以下在指定雪场考试（定常滑行展示），1级以上参加SAJ举办的检定会。</p><p><strong>报名：</strong>通过加盟SAJ的滑雪学校或直接在SAJ检定会报名。</p><p><strong>费用：</strong>¥5,000-15,000/级</p>',
      url:'https://www.ski-japan.or.jp', learnUrl:'https://www.ski-japan.or.jp/badge_test' },

    { id:'at', flag:'🇦🇹', country:'奥地利', org:'ÖSSV', title:'奥地利滑雪学校联盟', en:'Österreichischer Skischulverband',
      levels:['Anwärter·见习教练','Landeslehrer·州级教练','Diplomskilehrer·国家级教练','Staatlicher·国家级专家'],
      desc:'<p>奥地利作为现代滑雪发源地，<strong>ÖSSV认证</strong>在欧洲含金量极高。</p><p><strong>考试内容：</strong>极高标准的滑行技术（深粉雪、陡坡、竞速）+ 教学理论 + 雪崩安全 + 急救。</p><p><strong>报名：</strong>通过奥地利当地滑雪学校（Skischule）报名。</p><p><strong>费用：</strong>Landeslehrer约€2,500-4,000</p>',
      url:'https://www.skilehrerverband.at', learnUrl:'https://www.skilehrerverband.at/ausbildung' },

    { id:'fr', flag:'🇫🇷', country:'法国', org:'ENSA', title:'法国国家滑雪登山学校', en:'École Nationale de Ski et d\'Alpinisme',
      levels:['Moniteur Fédéral·联邦指导员','Moniteur National·国家级教练'],
      desc:'<p><strong>ENSA</strong>培养的是世界最顶级的滑雪教练（法国滑雪学校的Moniteur）。通过率极低，含金量极高。</p><p><strong>考试：</strong>极端严苛的技术测试+欧洲高山环境综合能力+教学法。需在法国居住和完成长期培训。',url:'https://www.ensa-chamonix.fr', learnUrl:'https://www.ensa-chamonix.fr' },
  ];

  // ═══════════════════════════════════════════════════════════════════
  // RENDER RESORTS PAGE
  // ═══════════════════════════════════════════════════════════════════
  function renderResortsPage() {
    // Hide other pages
    var hp = document.getElementById('homePage'); if (hp) hp.style.display = 'none';
    var cp = document.getElementById('chapterPage'); if (cp) cp.style.display = 'block';
    var rp = document.getElementById('roadmapPage'); if (rp) rp.style.display = 'none';

    // Breadcrumb
    var bc = document.getElementById('breadcrumb'); if (bc) bc.innerHTML = '<a href="#/">🏠 首页</a> <span class="breadcrumb-sep">›</span> <span>🌍 全球雪场</span>';

    // Content
    var container = document.getElementById('chapterContent'); if (!container) return;
    var nav = document.getElementById('chapterNavBottom'); if (nav) nav.innerHTML = '';

    var html = '<div class="chapter-header"><h1 class="chapter-title">🌍 全球著名雪场指南</h1>';
    html += '<div class="chapter-meta"><span class="chapter-meta-item">🏔️ ' + RESORTS.length + ' 个雪场</span><span class="chapter-meta-item">📍 8个国家</span><span class="chapter-meta-item">💰 含参考雪票价格</span></div></div>';

    html += '<p style="margin-bottom:20px;color:var(--color-text-secondary);">以下是全球知名滑雪场信息汇总。点击雪场名称可直接访问官方网站。雪票价格为旺季单日参考价，实际价格请以官网为准。</p>';

    html += '<div class="resort-table-wrap"><table class="resort-table"><thead><tr>';
    var headers = ['雪场','国家/地区','适合水平','参考雪票','海拔','雪季','详情'];
    for (var h = 0; h < headers.length; h++) html += '<th>' + headers[h] + '</th>';
    html += '</tr></thead><tbody>';

    for (var i = 0; i < RESORTS.length; i++) {
      var r = RESORTS[i];
      var levelCls = r.level === 'beginner' ? 'level-beginner' : r.level === 'intermediate' ? 'level-intermediate' : r.level === 'advanced' ? 'level-advanced' : 'level-all';
      var levelLabel = r.level === 'beginner' ? '适合新手' : r.level === 'intermediate' ? '中级以上' : r.level === 'advanced' ? '高级/专家' : '全水平';
      html += '<tr>';
      html += '<td><strong>' + r.name + '</strong><br><small style="color:var(--color-text-muted);">' + r.en + '</small></td>';
      html += '<td>' + r.country + '<br><small style="color:var(--color-text-muted);">' + r.region + '</small></td>';
      html += '<td><span class="resort-level ' + levelCls + '">' + levelLabel + '</span></td>';
      html += '<td class="resort-price">' + r.price + '</td>';
      html += '<td style="font-size:12px;color:var(--color-text-muted);">' + r.elev + '</td>';
      html += '<td style="font-size:12px;color:var(--color-text-muted);">' + r.season + '</td>';
      html += '<td style="min-width:200px;font-size:12px;line-height:1.6;color:var(--color-text-secondary);">' + r.desc + '<br><a class="resort-link" href="' + r.url + '" target="_blank" rel="noopener">访问官网</a></td>';
      html += '</tr>';
    }
    html += '</tbody></table></div>';
    html += '<p style="margin-top:16px;font-size:12px;color:var(--color-text-muted);">⚠️ 雪票价格仅供参考（2025-2026雪季旺季单日成人票），实际价格请点击各雪场官网查看最新信息。</p>';

    container.innerHTML = html;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER CERTIFICATION PAGE
  // ═══════════════════════════════════════════════════════════════════
  function renderCertPage() {
    var hp = document.getElementById('homePage'); if (hp) hp.style.display = 'none';
    var cp = document.getElementById('chapterPage'); if (cp) cp.style.display = 'block';
    var rp = document.getElementById('roadmapPage'); if (rp) rp.style.display = 'none';

    var bc = document.getElementById('breadcrumb'); if (bc) bc.innerHTML = '<a href="#/">🏠 首页</a> <span class="breadcrumb-sep">›</span> <span>🎓 滑雪等级认证</span>';
    var container = document.getElementById('chapterContent'); if (!container) return;
    var nav = document.getElementById('chapterNavBottom'); if (nav) nav.innerHTML = '';

    var html = '<div class="chapter-header"><h1 class="chapter-title">🎓 全球滑雪等级认证体系</h1>';
    html += '<div class="chapter-meta"><span class="chapter-meta-item">🏆 ' + CERTS.length + ' 个认证体系</span><span class="chapter-meta-item">🌍 覆盖全球主要滑雪国家</span></div></div>';
    html += '<p style="margin-bottom:24px;color:var(--color-text-secondary);">以下是全球主要滑雪教练认证和大众等级考试体系。无论你想成为职业滑雪教练，还是想知道自己的滑雪水平，都能在这里找到适合自己的认证路径。</p>';

    html += '<div class="cert-grid">';
    for (var i = 0; i < CERTS.length; i++) {
      var c = CERTS[i];
      html += '<div class="cert-card">';
      html += '<div class="cert-card-flag">' + c.flag + '</div>';
      html += '<div class="cert-card-title">' + c.title + '</div>';
      html += '<div class="cert-card-org">' + c.org + ' · ' + c.en + '</div>';
      html += '<div class="cert-card-levels">';
      for (var j = 0; j < c.levels.length; j++) {
        html += '<span class="cert-level-tag">' + c.levels[j] + '</span>';
      }
      html += '</div>';
      html += '<div class="cert-card-info">' + c.desc + '</div>';
      html += '<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">';
      html += '<a class="resort-link" href="' + c.url + '" target="_blank" rel="noopener">🏛️ 官方网站</a>';
      if (c.learnUrl) html += '<a class="resort-link" href="' + c.learnUrl + '" target="_blank" rel="noopener">📝 报名考试</a>';
      html += '</div></div>';
    }
    html += '</div>';
    html += '<div class="content-section" style="margin-top:24px;"><h3 class="section-heading">📋 国内如何考取国际认证</h3><div class="section-body"><ul><li><strong>CSIA（加拿大）</strong>：每年在北京/崇礼/吉林等地举办L1-L2认证课程，关注"CSIA中国"公众号获取日程。</li><li><strong>PSIA-AASI（美国）</strong>：可在美国雪场参加培训+考试，部分大型雪场有中文考官。</li><li><strong>BASI（英国）</strong>：偶尔在中国室内雪场举办培训课程。</li><li><strong>NZSIA（新西兰）</strong>：每年6-10月在新西兰雪季期间可报名，需自行前往新西兰。</li><li><strong>SAJ（日本）</strong>：可在日本雪场参加检定，部分国内滑雪俱乐部组织日本检定旅行。</li><li><strong>CSA中国等级</strong>：最方便，全国各地滑雪场学校定期举办。</li></ul></div></div>';

    container.innerHTML = html;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ═══════════════════════════════════════════════════════════════════
  // HOOK INTO EXISTING ROUTER
  // ═══════════════════════════════════════════════════════════════════
  function setupRoutes() {
    // Poll for the hash to detect our custom routes
    window.addEventListener('hashchange', checkRoute);
    // Initial check after a short delay (let the main app initialize)
    setTimeout(checkRoute, 100);
  }

  function checkRoute() {
    var hash = window.location.hash.slice(1);
    if (hash === '/resorts') {
      renderResortsPage();
    } else if (hash === '/certs') {
      renderCertPage();
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // INJECT NAVIGATION LINKS
  // ═══════════════════════════════════════════════════════════════════
  function injectNavLinks() {
    // Wait for sidebar to render
    var attempts = 0;
    var interval = setInterval(function () {
      attempts++;
      var sidebar = document.getElementById('sidebarNav');
      if (!sidebar || !sidebar.children.length) {
        if (attempts > 30) clearInterval(interval);
        return;
      }
      clearInterval(interval);

      // Check if already injected
      if (document.getElementById('extras-nav')) return;

      // Create extras nav section
      var div = document.createElement('div');
      div.id = 'extras-nav';
      div.className = 'nav-appendix';
      div.style.borderTop = '1px solid rgba(255,255,255,0.12)';
      div.style.marginTop = '4px';

      var label = document.createElement('div');
      label.className = 'nav-appendix-label';
      label.textContent = '🌍 实用工具';
      div.appendChild(label);

      var resortsLink = document.createElement('div');
      resortsLink.className = 'nav-appendix-item';
      resortsLink.innerHTML = '<span>🏔️</span><span>全球雪场指南</span>';
      resortsLink.addEventListener('click', function () { window.location.hash = '/resorts'; });
      div.appendChild(resortsLink);

      var certLink = document.createElement('div');
      certLink.className = 'nav-appendix-item';
      certLink.innerHTML = '<span>🎓</span><span>滑雪等级认证</span>';
      certLink.addEventListener('click', function () { window.location.hash = '/certs'; });
      div.appendChild(certLink);

      sidebar.appendChild(div);
    }, 200);
  }

  // ═══════════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════════
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initSnowflakes();
      setupRoutes();
      injectNavLinks();
    });
  } else {
    initSnowflakes();
    setupRoutes();
    injectNavLinks();
  }
})();
