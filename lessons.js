/*
  DỮ LIỆU BÀI HỌC - HSK 3.0
  Mỗi buổi học mới chỉ cần thêm 1 object vào mảng HSK_DATA.lessons.

  Cấu trúc 1 từ vựng:
    hz  : chữ Hán
    py  : pinyin hiển thị (có dấu thanh)
    syl : các âm tiết tách bằng dấu cách (dùng để vẽ khẩu hình và đường thanh điệu)
    hv  : âm Hán Việt
    vi  : nghĩa tiếng Việt
    pos : từ loại
    ex  : câu ví dụ { hz, py, vi }
*/
window.HSK_DATA = {
  levels: [
    { id: 1, band: "Sơ cấp", bandZh: "初等", syllables: 269, chars: 300, words: 500,
      goal: "Chào hỏi, giới thiệu bản thân, số đếm, thời gian, mua bán đơn giản." },
    { id: 2, band: "Sơ cấp", bandZh: "初等", syllables: 468, chars: 600, words: 1272,
      goal: "Giao tiếp hằng ngày quen thuộc: gia đình, ăn uống, đi lại, sở thích." },
    { id: 3, band: "Sơ cấp", bandZh: "初等", syllables: 608, chars: 900, words: 2245,
      goal: "Xử lý tình huống sinh hoạt, học tập, công việc cơ bản; đọc đoạn văn ngắn." },
    { id: 4, band: "Trung cấp", bandZh: "中等", syllables: 724, chars: 1200, words: 3245,
      goal: "Trao đổi về chủ đề xã hội quen thuộc, kể lại sự việc có trình tự." },
    { id: 5, band: "Trung cấp", bandZh: "中等", syllables: 822, chars: 1500, words: 4316,
      goal: "Đọc hiểu bài viết dài hơn, trình bày ý kiến, so sánh và lập luận." },
    { id: 6, band: "Trung cấp", bandZh: "中等", syllables: 908, chars: 1800, words: 5456,
      goal: "Giao tiếp trôi chảy trong công việc, viết đoạn văn mạch lạc." }
  ],

  /*
    BÀI GIẢNG TRÊN LỚP: mỗi buổi học thêm 1 object vào mảng lectures.
    { id: "buoi-01", no: 1, date: "2026-10-14", title: "...", lesson: "hsk1-01" (bài liên quan, có thể bỏ trống),
      summary: "...",
      blocks: [
        { type: "text", title: "...", body: "..." },                       // ghi chú, chữ Hán trong body bấm nghe được
        { type: "examples", title: "...", items: [{ hz, py, vi }] },        // câu ví dụ thầy cô đưa ra
        { type: "table", title: "...", head: ["..."], rows: [["..."]] },   // bảng tổng hợp
        { type: "tip", body: "..." },                                       // lưu ý, mẹo nhớ
        { type: "image", src: "images/buoi-01-1.jpg", caption: "..." }      // ảnh chụp bảng
      ],
      homework: ["..."] }
  */
  lectures: [
    {
      id: "buoi-01", no: 1, date: "2026-10-14",
      title: "Nhập môn phát âm: thanh mẫu, vận mẫu, thanh điệu",
      lesson: "",
      summary: "Cách đọc các thanh mẫu khi ghép với vần đi kèm, các vận mẫu cơ bản, quy tắc viết y/w, 4 thanh điệu và biến điệu thanh 3.",
      blocks: [
        { type: "text", title: "1. Thanh mẫu (phụ âm đầu)",
          body: "Khi đọc riêng một thanh mẫu, luôn ghép thêm một vần đi kèm cho dễ phát âm: b p m f đi với o, d t n l và g k h đi với e, j q x đi với i. Cột “Ghi trên lớp” là cách đọc gần đúng bằng chữ Việt." },
        { type: "sounds", title: "Bảng thanh mẫu", head: ["Thanh mẫu", "Đọc kèm", "Ghi trên lớp"],
          rows: [
            { cells: ["b", "bo (o → uo)", "pua"], py: "bō", hz: "波" },
            { cells: ["p", "po", "p'uo, bật hơi"], py: "pō", hz: "坡" },
            { cells: ["m", "mo", "muo"], py: "mō", hz: "摸" },
            { cells: ["f", "fo", "phua"], py: "fó", hz: "佛" },
            { cells: ["d", "de (e → ưa)", "tưa"], py: "dé", hz: "得" },
            { cells: ["t", "te", "thưa, bật hơi"], py: "tè", hz: "特" },
            { cells: ["n", "ne", "nưa"], py: "nè", hz: "讷" },
            { cells: ["l", "le", "lưa"], py: "lè", hz: "乐" },
            { cells: ["g", "ge (e → ưa)", "cưa"], py: "gē", hz: "哥" },
            { cells: ["k", "ke", "khưa, bật hơi"], py: "kē", hz: "科" },
            { cells: ["h", "he", "hưa (gần khưa)"], py: "hē", hz: "喝" },
            { cells: ["j", "ji (i → i)", "chi"], py: "jī", hz: "鸡" },
            { cells: ["q", "qi", "ch'i, bật hơi"], py: "qī", hz: "七" },
            { cells: ["x", "xi", "xi"], py: "xī", hz: "西" }
          ] },
        { type: "tip", body: "p, t, k, q là âm bật hơi: đặt tờ giấy trước miệng, đọc đúng thì giấy rung. b, d, g, j là cặp không bật hơi tương ứng." },
        { type: "text", title: "2. Vận mẫu (vần)", body: "Cách đọc gần đúng ghi trên lớp. Bấm Nghe để nghe chuẩn và xem khẩu hình." },
        { type: "sounds", title: "Bảng vận mẫu", head: ["Vận mẫu", "Ghi trên lớp", "Viết khi đứng đầu"],
          rows: [
            { cells: ["i", "i", "yi"], py: "yī", hz: "衣" },
            { cells: ["u", "u", "wu"], py: "wū", hz: "屋" },
            { cells: ["ü", "uy", "yu"], py: "yú", hz: "鱼" },
            { cells: ["er", "ơ + uốn lưỡi", "er"], py: "èr", hz: "二" },
            { cells: ["a", "a", "a"], py: "ā", hz: "啊" },
            { cells: ["ia", "da", "ya"], py: "yā", hz: "呀" },
            { cells: ["ua", "oa", "wa"], py: "wā", hz: "哇" },
            { cells: ["o", "ô", "o"], py: "ō", hz: "喔" },
            { cells: ["uo", "ua", "wo"], py: "wǒ", hz: "我" },
            { cells: ["e", "ưa", "e"], py: "è", hz: "饿" },
            { cells: ["ie", "dê", "ye"], py: "yě", hz: "也" },
            { cells: ["üe", "duê", "yue"], py: "yuè", hz: "月" },
            { cells: ["ai", "ai", "ai"], py: "ài", hz: "爱" },
            { cells: ["uai", "oai", "wai"], py: "wài", hz: "外" },
            { cells: ["ei", "ây", "ei"], py: "fēi", hz: "飞" },
            { cells: ["uei (viết tắt ui)", "uây", "wei"], py: "wèi", hz: "为" },
            { cells: ["ao", "ao", "ao"], py: "ào", hz: "奥" },
            { cells: ["iao", "dao", "yao"], py: "yào", hz: "要" }
          ] },
        { type: "table", title: "3. Quy tắc viết y, w (dòng họ i, u, ü)",
          head: ["Dòng họ", "Vần", "Khi không có thanh mẫu đứng trước thì viết"],
          rows: [
            ["i", "i, ia, ie, iao", "yi, ya, ye, yao"],
            ["u", "u, ua, uo, uai, uei", "wu, wa, wo, wai, wei"],
            ["ü", "ü, üe", "yu, yue"]
          ] },
        { type: "tip", body: "Vần o chỉ ghép với b, p, m, f.\nü khi đi với j, q, x thì mất hai chấm: ju, qu, xu, jue, que, xue. Vẫn đọc là ü, không đọc thành u." },
        { type: "text", title: "4. Thanh điệu", body: "Tiếng Trung có 4 thanh chính và 1 thanh nhẹ. Bấm từng chữ để nghe: 妈 mā (thanh 1), 麻 má (thanh 2), 马 mǎ (thanh 3), 骂 mà (thanh 4), 吗 ma (thanh nhẹ)." },
        { type: "examples", title: "Biến điệu thanh 3: ˇ + ˇ → ˊ + ˇ",
          items: [
            { hz: "你好", py: "nǐ hǎo  →  đọc ní hǎo", vi: "Xin chào" },
            { hz: "很好", py: "hěn hǎo  →  đọc hén hǎo", vi: "Rất tốt" },
            { hz: "老虎", py: "lǎohǔ  →  đọc láohǔ", vi: "Con hổ" }
          ] }
      ],
      homework: []
    }
  ],

  lessons: [
    {
      id: "hsk1-01",
      level: 1,
      no: 1,
      title: "你好",
      titlePy: "Nǐ hǎo",
      titleVi: "Xin chào",
      sample: true,
      goals: [
        "Chào hỏi người bằng tuổi, người lớn tuổi và chào cả nhóm",
        "Nói cảm ơn, xin lỗi, tạm biệt và cách đáp lại",
        "Nắm quy tắc biến điệu thanh 3 + thanh 3 và biến điệu của 不"
      ],
      vocab: [
        { hz: "你", py: "nǐ", syl: "nǐ", hv: "nhĩ", vi: "bạn, anh, chị (ngôi thứ hai)", pos: "Đại từ",
          ex: { hz: "你好！", py: "Nǐ hǎo!", vi: "Chào bạn!" } },
        { hz: "好", py: "hǎo", syl: "hǎo", hv: "hảo", vi: "tốt, khỏe, hay", pos: "Tính từ",
          ex: { hz: "你好吗？", py: "Nǐ hǎo ma?", vi: "Bạn khỏe không?" } },
        { hz: "您", py: "nín", syl: "nín", hv: "nâm", vi: "ông, bà, ngài (kính trọng)", pos: "Đại từ",
          ex: { hz: "您好！", py: "Nín hǎo!", vi: "Cháu chào ông/bà ạ!" } },
        { hz: "你们", py: "nǐmen", syl: "nǐ men", hv: "nhĩ môn", vi: "các bạn", pos: "Đại từ",
          ex: { hz: "你们好！", py: "Nǐmen hǎo!", vi: "Chào các bạn!" } },
        { hz: "我", py: "wǒ", syl: "wǒ", hv: "ngã", vi: "tôi, mình", pos: "Đại từ",
          ex: { hz: "我很好。", py: "Wǒ hěn hǎo.", vi: "Mình rất khỏe." } },
        { hz: "很", py: "hěn", syl: "hěn", hv: "ngận", vi: "rất", pos: "Phó từ",
          ex: { hz: "很好。", py: "Hěn hǎo.", vi: "Rất tốt." } },
        { hz: "老师", py: "lǎoshī", syl: "lǎo shī", hv: "lão sư", vi: "thầy giáo, cô giáo", pos: "Danh từ",
          ex: { hz: "老师好！", py: "Lǎoshī hǎo!", vi: "Em chào thầy/cô ạ!" } },
        { hz: "谢谢", py: "xièxie", syl: "xiè xie", hv: "tạ tạ", vi: "cảm ơn", pos: "Động từ",
          ex: { hz: "谢谢你！", py: "Xièxie nǐ!", vi: "Cảm ơn bạn!" } },
        { hz: "不客气", py: "bú kèqi", syl: "bú kè qi", hv: "bất khách khí", vi: "đừng khách sáo, không có gì", pos: "Cụm từ",
          ex: { hz: "不客气。", py: "Bú kèqi.", vi: "Không có gì đâu." } },
        { hz: "对不起", py: "duìbuqǐ", syl: "duì bu qǐ", hv: "đối bất khởi", vi: "xin lỗi", pos: "Động từ",
          ex: { hz: "对不起，老师！", py: "Duìbuqǐ, lǎoshī!", vi: "Em xin lỗi thầy/cô!" } },
        { hz: "没关系", py: "méi guānxi", syl: "méi guān xi", hv: "một quan hệ", vi: "không sao, không có gì", pos: "Cụm từ",
          ex: { hz: "没关系。", py: "Méi guānxi.", vi: "Không sao đâu." } },
        { hz: "再见", py: "zàijiàn", syl: "zài jiàn", hv: "tái kiến", vi: "tạm biệt", pos: "Động từ",
          ex: { hz: "老师再见！", py: "Lǎoshī zàijiàn!", vi: "Em chào thầy/cô, em về ạ!" } }
      ],
      dialogues: [
        { title: "Chào bạn", lines: [
          { who: "A", hz: "你好！", py: "Nǐ hǎo!", vi: "Chào bạn!" },
          { who: "B", hz: "你好！", py: "Nǐ hǎo!", vi: "Chào bạn!" }
        ]},
        { title: "Chào thầy cô", lines: [
          { who: "Học sinh", hz: "老师好！", py: "Lǎoshī hǎo!", vi: "Em chào thầy/cô ạ!" },
          { who: "Thầy/cô", hz: "你们好！", py: "Nǐmen hǎo!", vi: "Chào các em!" }
        ]},
        { title: "Cảm ơn và xin lỗi", lines: [
          { who: "A", hz: "谢谢你！", py: "Xièxie nǐ!", vi: "Cảm ơn bạn!" },
          { who: "B", hz: "不客气。", py: "Bú kèqi.", vi: "Không có gì." },
          { who: "A", hz: "对不起！", py: "Duìbuqǐ!", vi: "Xin lỗi!" },
          { who: "B", hz: "没关系。", py: "Méi guānxi.", vi: "Không sao." }
        ]},
        { title: "Tạm biệt", lines: [
          { who: "A", hz: "再见！", py: "Zàijiàn!", vi: "Tạm biệt!" },
          { who: "B", hz: "再见！", py: "Zàijiàn!", vi: "Tạm biệt!" }
        ]}
      ],
      grammar: [
        { title: "Câu chào: Đại từ / Danh từ + 好",
          body: "Đặt người được chào phía trước, thêm 好 phía sau. Dùng 您 khi chào người lớn tuổi hoặc cấp trên.",
          examples: [
            { hz: "你好！", py: "Nǐ hǎo!", vi: "Chào bạn!" },
            { hz: "老师好！", py: "Lǎoshī hǎo!", vi: "Em chào thầy/cô!" }
          ] },
        { title: "Biến điệu: thanh 3 + thanh 3",
          body: "Hai âm thanh 3 đứng liền nhau thì âm đầu đọc thành thanh 2. Chữ viết pinyin vẫn giữ dấu thanh 3.",
          examples: [
            { hz: "你好", py: "nǐ hǎo  →  đọc ní hǎo", vi: "Xin chào" },
            { hz: "很好", py: "hěn hǎo  →  đọc hén hǎo", vi: "Rất tốt" }
          ] },
        { title: "Biến điệu của 不",
          body: "不 vốn đọc bù (thanh 4). Khi đứng trước một âm thanh 4 thì đọc thành bú (thanh 2).",
          examples: [
            { hz: "不客气", py: "bú kèqi", vi: "Không có gì" }
          ] }
      ],
      pronFocus: ["n", "h", "l", "sh", "x", "q", "ao", "ie", "uo"]
    }
  ]
};

/* Nạp thêm bài từ các file trong thư mục data/ (định dạng gọn) */
window.HSK_ADD = function (arr) {
  arr.forEach(function (l) {
    var lesson = {
      id: l.id, level: l.level, no: l.no, title: l.title, titlePy: l.titlePy, titleVi: l.titleVi, sample: true,
      goals: l.goals || [],
      vocab: (l.v || []).map(function (a) {
        return { hz: a[0], syl: a[1], py: a[1].replace(/ /g, ""), hv: a[2], vi: a[3], pos: a[4], ex: a[5] ? { hz: a[5], py: a[6], vi: a[7] } : null };
      }),
      dialogues: l.d ? [{ title: l.d.title, lines: l.d.lines.map(function (x) { return { who: x[0], hz: x[1], py: x[2], vi: x[3] }; }) }] : [],
      grammar: (l.g || []).map(function (g) { return { title: g[0], body: g[1], examples: (g[2] || []).map(function (e) { return { hz: e[0], py: e[1], vi: e[2] }; }) }; }),
      pronFocus: l.pronFocus || []
    };
    window.HSK_DATA.lessons.push(lesson);
  });
};
