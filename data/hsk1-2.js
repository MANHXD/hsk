/* HSK 1 - 2: bài tự soạn theo chủ đề. Định dạng gọn, app.js tự chuyển đổi.
   v: [chữ Hán, âm tiết cách nhau dấu cách, Hán Việt, nghĩa, từ loại, câu ví dụ, pinyin ví dụ, nghĩa ví dụ]
   d: hội thoại { title, lines: [[người nói, chữ Hán, pinyin, nghĩa]] }
   g: ngữ pháp [[tiêu đề, giải thích, [[chữ Hán, pinyin, nghĩa]]]] */
HSK_ADD([
  { id: "hsk1-02", level: 1, no: 2, title: "你叫什么名字", titlePy: "Nǐ jiào shénme míngzi", titleVi: "Bạn tên là gì",
    goals: ["Hỏi và nói tên, quốc tịch", "Dùng câu chữ 是 và câu hỏi với 吗, 什么"],
    v: [
      ["叫", "jiào", "khiếu", "gọi, tên là", "Động từ", "我叫王兰。", "Wǒ jiào Wáng Lán.", "Mình tên là Vương Lan."],
      ["什么", "shén me", "thập ma", "gì, cái gì", "Đại từ", "这是什么？", "Zhè shì shénme?", "Đây là cái gì?"],
      ["名字", "míng zi", "danh tự", "tên", "Danh từ", "你叫什么名字？", "Nǐ jiào shénme míngzi?", "Bạn tên là gì?"],
      ["是", "shì", "thị", "là", "Động từ", "我是学生。", "Wǒ shì xuésheng.", "Mình là học sinh."],
      ["不", "bù", "bất", "không", "Phó từ", "我不是老师。", "Wǒ bú shì lǎoshī.", "Mình không phải giáo viên."],
      ["吗", "ma", "ma", "(trợ từ cuối câu hỏi)", "Trợ từ", "你是中国人吗？", "Nǐ shì Zhōngguó rén ma?", "Bạn là người Trung Quốc à?"],
      ["人", "rén", "nhân", "người", "Danh từ", "他是越南人。", "Tā shì Yuènán rén.", "Anh ấy là người Việt Nam."],
      ["中国", "zhōng guó", "trung quốc", "Trung Quốc", "Danh từ", "我想去中国。", "Wǒ xiǎng qù Zhōngguó.", "Mình muốn đi Trung Quốc."],
      ["越南", "yuè nán", "việt nam", "Việt Nam", "Danh từ", "我是越南人。", "Wǒ shì Yuènán rén.", "Mình là người Việt Nam."],
      ["学生", "xué sheng", "học sinh", "học sinh, sinh viên", "Danh từ", "她是学生。", "Tā shì xuésheng.", "Cô ấy là sinh viên."],
      ["他", "tā", "tha", "anh ấy, ông ấy", "Đại từ", "他是我的老师。", "Tā shì wǒ de lǎoshī.", "Anh ấy là thầy giáo của mình."],
      ["她", "tā", "tha", "cô ấy, bà ấy", "Đại từ", "她叫什么名字？", "Tā jiào shénme míngzi?", "Cô ấy tên là gì?"]
    ],
    d: { title: "Làm quen", lines: [
      ["A", "你好！你叫什么名字？", "Nǐ hǎo! Nǐ jiào shénme míngzi?", "Chào bạn! Bạn tên là gì?"],
      ["B", "我叫阮明。你呢？", "Wǒ jiào Ruǎn Míng. Nǐ ne?", "Mình tên là Nguyễn Minh. Còn bạn?"],
      ["A", "我叫王兰。你是中国人吗？", "Wǒ jiào Wáng Lán. Nǐ shì Zhōngguó rén ma?", "Mình là Vương Lan. Bạn là người Trung Quốc à?"],
      ["B", "不是，我是越南人。", "Bú shì, wǒ shì Yuènán rén.", "Không, mình là người Việt Nam."]
    ] },
    g: [
      ["Câu chữ 是: A 是 B", "Dùng để nói A là B. Phủ định thêm 不 trước 是 (đọc bú shì).", [["我是学生。", "Wǒ shì xuésheng.", "Mình là học sinh."], ["他不是老师。", "Tā bú shì lǎoshī.", "Anh ấy không phải giáo viên."]]],
      ["Câu hỏi với 吗 và 什么", "Thêm 吗 cuối câu trần thuật để hỏi có/không. 什么 đứng ở vị trí của thông tin cần hỏi, không cần 吗.", [["你是老师吗？", "Nǐ shì lǎoshī ma?", "Bạn là giáo viên à?"], ["你叫什么？", "Nǐ jiào shénme?", "Bạn tên gì?"]]]
    ] },

  { id: "hsk1-03", level: 1, no: 3, title: "我的家", titlePy: "Wǒ de jiā", titleVi: "Gia đình của mình",
    goals: ["Giới thiệu các thành viên trong gia đình", "Dùng 有, 没有, 的 và hỏi số lượng với 几"],
    v: [
      ["家", "jiā", "gia", "nhà, gia đình", "Danh từ", "我家在河内。", "Wǒ jiā zài Hénèi.", "Nhà mình ở Hà Nội."],
      ["爸爸", "bà ba", "ba ba", "bố", "Danh từ", "我爸爸是医生。", "Wǒ bàba shì yīshēng.", "Bố mình là bác sĩ."],
      ["妈妈", "mā ma", "ma ma", "mẹ", "Danh từ", "妈妈很忙。", "Māma hěn máng.", "Mẹ rất bận."],
      ["哥哥", "gē ge", "ca ca", "anh trai", "Danh từ", "我有一个哥哥。", "Wǒ yǒu yí gè gēge.", "Mình có một anh trai."],
      ["姐姐", "jiě jie", "tỷ tỷ", "chị gái", "Danh từ", "姐姐是老师。", "Jiějie shì lǎoshī.", "Chị gái là giáo viên."],
      ["弟弟", "dì di", "đệ đệ", "em trai", "Danh từ", "弟弟八岁。", "Dìdi bā suì.", "Em trai tám tuổi."],
      ["妹妹", "mèi mei", "muội muội", "em gái", "Danh từ", "我没有妹妹。", "Wǒ méiyǒu mèimei.", "Mình không có em gái."],
      ["有", "yǒu", "hữu", "có", "Động từ", "你有哥哥吗？", "Nǐ yǒu gēge ma?", "Bạn có anh trai không?"],
      ["没有", "méi yǒu", "một hữu", "không có", "Động từ", "我没有钱。", "Wǒ méiyǒu qián.", "Mình không có tiền."],
      ["几", "jǐ", "kỷ", "mấy", "Đại từ", "你家有几口人？", "Nǐ jiā yǒu jǐ kǒu rén?", "Nhà bạn có mấy người?"],
      ["口", "kǒu", "khẩu", "(lượng từ cho người trong nhà)", "Lượng từ", "我家有四口人。", "Wǒ jiā yǒu sì kǒu rén.", "Nhà mình có bốn người."],
      ["的", "de", "đích", "của", "Trợ từ", "这是我的书。", "Zhè shì wǒ de shū.", "Đây là sách của mình."]
    ],
    d: { title: "Nhà bạn có mấy người", lines: [
      ["A", "你家有几口人？", "Nǐ jiā yǒu jǐ kǒu rén?", "Nhà bạn có mấy người?"],
      ["B", "我家有五口人：爸爸、妈妈、哥哥、妹妹和我。", "Wǒ jiā yǒu wǔ kǒu rén: bàba, māma, gēge, mèimei hé wǒ.", "Nhà mình có năm người: bố, mẹ, anh trai, em gái và mình."],
      ["A", "你有弟弟吗？", "Nǐ yǒu dìdi ma?", "Bạn có em trai không?"],
      ["B", "我没有弟弟。", "Wǒ méiyǒu dìdi.", "Mình không có em trai."]
    ] },
    g: [
      ["有 và 没有", "有 là có. Phủ định của 有 luôn là 没有, không dùng 不有.", [["我有姐姐。", "Wǒ yǒu jiějie.", "Mình có chị gái."], ["我没有姐姐。", "Wǒ méiyǒu jiějie.", "Mình không có chị gái."]]],
      ["的 chỉ sở hữu", "Người sở hữu + 的 + vật. Với người thân thiết có thể bỏ 的: 我妈妈.", [["老师的书", "lǎoshī de shū", "sách của thầy"], ["我妈妈", "wǒ māma", "mẹ mình"]]]
    ] },

  { id: "hsk1-04", level: 1, no: 4, title: "你多大", titlePy: "Nǐ duō dà", titleVi: "Số đếm và tuổi",
    goals: ["Đếm từ 1 đến 99", "Hỏi và nói tuổi"],
    v: [
      ["一", "yī", "nhất", "một", "Số từ", "一个人", "yí gè rén", "một người"],
      ["二", "èr", "nhị", "hai", "Số từ", "二十", "èrshí", "hai mươi"],
      ["三", "sān", "tam", "ba", "Số từ", "三口人", "sān kǒu rén", "ba người (trong nhà)"],
      ["四", "sì", "tứ", "bốn", "Số từ", "四岁", "sì suì", "bốn tuổi"],
      ["五", "wǔ", "ngũ", "năm", "Số từ", "五十五", "wǔshíwǔ", "năm mươi lăm"],
      ["六", "liù", "lục", "sáu", "Số từ", "六月", "liù yuè", "tháng sáu"],
      ["七", "qī", "thất", "bảy", "Số từ", "七点", "qī diǎn", "bảy giờ"],
      ["八", "bā", "bát", "tám", "Số từ", "十八岁", "shíbā suì", "mười tám tuổi"],
      ["九", "jiǔ", "cửu", "chín", "Số từ", "九十九", "jiǔshíjiǔ", "chín mươi chín"],
      ["十", "shí", "thập", "mười", "Số từ", "十个学生", "shí gè xuésheng", "mười học sinh"],
      ["岁", "suì", "tuế", "tuổi", "Lượng từ", "我二十五岁。", "Wǒ èrshíwǔ suì.", "Mình hai mươi lăm tuổi."],
      ["多大", "duō dà", "đa đại", "bao nhiêu tuổi", "Cụm từ", "你今年多大？", "Nǐ jīnnián duō dà?", "Năm nay bạn bao nhiêu tuổi?"]
    ],
    d: { title: "Hỏi tuổi", lines: [
      ["A", "你今年多大？", "Nǐ jīnnián duō dà?", "Năm nay bạn bao nhiêu tuổi?"],
      ["B", "我二十八岁。你呢？", "Wǒ èrshíbā suì. Nǐ ne?", "Mình hai mươi tám tuổi. Còn bạn?"],
      ["A", "我三十岁。你弟弟几岁？", "Wǒ sānshí suì. Nǐ dìdi jǐ suì?", "Mình ba mươi tuổi. Em trai bạn mấy tuổi?"],
      ["B", "他九岁。", "Tā jiǔ suì.", "Em ấy chín tuổi."]
    ] },
    g: [
      ["Đọc số từ 11 đến 99", "Ghép như tiếng Việt: 十一 (11), 二十 (20), 二十一 (21), 九十九 (99).", [["十五", "shíwǔ", "15"], ["六十八", "liùshíbā", "68"]]],
      ["Hỏi tuổi: 几岁 và 多大", "几岁 hỏi trẻ em dưới 10 tuổi. 多大 hỏi người trẻ, ngang tuổi. Người lớn tuổi dùng 您多大年纪.", [["你几岁？", "Nǐ jǐ suì?", "Con mấy tuổi?"], ["你多大？", "Nǐ duō dà?", "Bạn bao nhiêu tuổi?"]]],
      ["Biến điệu của 一", "一 đứng trước thanh 4 đọc yí, trước thanh 1, 2, 3 đọc yì. Đếm số hoặc đứng cuối thì đọc yī.", [["一个", "yí gè", "một cái"], ["一起", "yìqǐ", "cùng nhau"]]]
    ] },

  { id: "hsk1-05", level: 1, no: 5, title: "今天几号", titlePy: "Jīntiān jǐ hào", titleVi: "Ngày tháng và giờ",
    goals: ["Nói ngày, tháng, năm, thứ", "Hỏi và nói giờ"],
    v: [
      ["今天", "jīn tiān", "kim thiên", "hôm nay", "Danh từ", "今天星期一。", "Jīntiān xīngqīyī.", "Hôm nay thứ hai."],
      ["明天", "míng tiān", "minh thiên", "ngày mai", "Danh từ", "明天见！", "Míngtiān jiàn!", "Mai gặp nhé!"],
      ["昨天", "zuó tiān", "tạc thiên", "hôm qua", "Danh từ", "昨天很冷。", "Zuótiān hěn lěng.", "Hôm qua rất lạnh."],
      ["年", "nián", "niên", "năm", "Danh từ", "二〇二六年", "èr líng èr liù nián", "năm 2026"],
      ["月", "yuè", "nguyệt", "tháng", "Danh từ", "十月", "shí yuè", "tháng mười"],
      ["号", "hào", "hiệu", "ngày (trong tháng), số", "Danh từ", "今天十四号。", "Jīntiān shísì hào.", "Hôm nay ngày 14."],
      ["星期", "xīng qī", "tinh kỳ", "tuần, thứ", "Danh từ", "今天星期几？", "Jīntiān xīngqī jǐ?", "Hôm nay thứ mấy?"],
      ["现在", "xiàn zài", "hiện tại", "bây giờ", "Danh từ", "现在几点？", "Xiànzài jǐ diǎn?", "Bây giờ mấy giờ?"],
      ["点", "diǎn", "điểm", "giờ", "Lượng từ", "现在八点。", "Xiànzài bā diǎn.", "Bây giờ là tám giờ."],
      ["分", "fēn", "phân", "phút", "Lượng từ", "十点二十分", "shí diǎn èrshí fēn", "mười giờ hai mươi phút"],
      ["上午", "shàng wǔ", "thượng ngọ", "buổi sáng", "Danh từ", "上午九点", "shàngwǔ jiǔ diǎn", "chín giờ sáng"],
      ["下午", "xià wǔ", "hạ ngọ", "buổi chiều", "Danh từ", "我下午去商店。", "Wǒ xiàwǔ qù shāngdiàn.", "Chiều nay mình đi cửa hàng."]
    ],
    d: { title: "Hẹn ngày", lines: [
      ["A", "今天几号？", "Jīntiān jǐ hào?", "Hôm nay ngày bao nhiêu?"],
      ["B", "今天十月十四号，星期三。", "Jīntiān shí yuè shísì hào, xīngqīsān.", "Hôm nay ngày 14 tháng 10, thứ tư."],
      ["A", "明天下午你有时间吗？", "Míngtiān xiàwǔ nǐ yǒu shíjiān ma?", "Chiều mai bạn có thời gian không?"],
      ["B", "有，三点半见！", "Yǒu, sān diǎn bàn jiàn!", "Có, ba rưỡi gặp nhé!"]
    ] },
    g: [
      ["Thứ tự thời gian: lớn trước, nhỏ sau", "Năm, tháng, ngày, thứ, buổi, giờ. Ngược với tiếng Việt.", [["二〇二六年十月十四号", "èr líng èr liù nián shí yuè shísì hào", "ngày 14 tháng 10 năm 2026"]]],
      ["Các thứ trong tuần", "星期 + số từ 1 đến 6 là thứ hai đến thứ bảy. Chủ nhật là 星期天 hoặc 星期日.", [["星期一", "xīngqīyī", "thứ hai"], ["星期天", "xīngqītiān", "chủ nhật"]]],
      ["Nói giờ", "Số + 点 + số + 分. Rưỡi là 半.", [["七点半", "qī diǎn bàn", "bảy rưỡi"], ["九点十分", "jiǔ diǎn shí fēn", "chín giờ mười"]]]
    ] },

  { id: "hsk1-06", level: 1, no: 6, title: "你想吃什么", titlePy: "Nǐ xiǎng chī shénme", titleVi: "Ăn uống",
    goals: ["Gọi món ở quán", "Diễn đạt mong muốn với 想 và 要"],
    v: [
      ["吃", "chī", "ngật", "ăn", "Động từ", "你吃饭了吗？", "Nǐ chī fàn le ma?", "Bạn ăn cơm chưa?"],
      ["喝", "hē", "hát", "uống", "Động từ", "我想喝茶。", "Wǒ xiǎng hē chá.", "Mình muốn uống trà."],
      ["饭", "fàn", "phạn", "cơm, bữa ăn", "Danh từ", "我们一起吃饭吧。", "Wǒmen yìqǐ chī fàn ba.", "Chúng ta cùng ăn cơm nhé."],
      ["米饭", "mǐ fàn", "mễ phạn", "cơm trắng", "Danh từ", "要两碗米饭。", "Yào liǎng wǎn mǐfàn.", "Cho hai bát cơm."],
      ["水", "shuǐ", "thủy", "nước", "Danh từ", "请给我一杯水。", "Qǐng gěi wǒ yì bēi shuǐ.", "Cho mình một cốc nước."],
      ["茶", "chá", "trà", "trà", "Danh từ", "中国茶很好喝。", "Zhōngguó chá hěn hǎohē.", "Trà Trung Quốc rất ngon."],
      ["菜", "cài", "thái", "món ăn, rau", "Danh từ", "这个菜很好吃。", "Zhège cài hěn hǎochī.", "Món này rất ngon."],
      ["想", "xiǎng", "tưởng", "muốn, nghĩ, nhớ", "Động từ", "我想吃米饭。", "Wǒ xiǎng chī mǐfàn.", "Mình muốn ăn cơm."],
      ["要", "yào", "yếu", "muốn, cần, lấy", "Động từ", "我要一杯茶。", "Wǒ yào yì bēi chá.", "Cho mình một cốc trà."],
      ["饭店", "fàn diàn", "phạn điếm", "nhà hàng", "Danh từ", "这个饭店很大。", "Zhège fàndiàn hěn dà.", "Nhà hàng này rất lớn."],
      ["杯子", "bēi zi", "bôi tử", "cái cốc", "Danh từ", "这是我的杯子。", "Zhè shì wǒ de bēizi.", "Đây là cốc của mình."],
      ["好吃", "hǎo chī", "hảo ngật", "ngon (đồ ăn)", "Tính từ", "妈妈做的菜很好吃。", "Māma zuò de cài hěn hǎochī.", "Món mẹ nấu rất ngon."]
    ],
    d: { title: "Gọi món", lines: [
      ["Phục vụ", "你们想吃什么？", "Nǐmen xiǎng chī shénme?", "Các bạn muốn ăn gì?"],
      ["A", "我要两个菜和两碗米饭。", "Wǒ yào liǎng gè cài hé liǎng wǎn mǐfàn.", "Cho mình hai món và hai bát cơm."],
      ["Phục vụ", "喝什么？", "Hē shénme?", "Uống gì ạ?"],
      ["A", "我们喝茶，谢谢！", "Wǒmen hē chá, xièxie!", "Bọn mình uống trà, cảm ơn!"]
    ] },
    g: [
      ["想 + động từ", "Diễn đạt mong muốn, dự định. Phủ định: 不想.", [["我想去中国。", "Wǒ xiǎng qù Zhōngguó.", "Mình muốn đi Trung Quốc."], ["我不想喝水。", "Wǒ bù xiǎng hē shuǐ.", "Mình không muốn uống nước."]]],
      ["要 + danh từ", "Dùng khi gọi món, mua hàng: muốn lấy cái gì.", [["我要这个。", "Wǒ yào zhège.", "Mình lấy cái này."]]]
    ] },

  { id: "hsk1-07", level: 1, no: 7, title: "多少钱", titlePy: "Duōshao qián", titleVi: "Mua sắm",
    goals: ["Hỏi giá, mặc cả đơn giản", "Dùng 这, 那 và 太...了"],
    v: [
      ["买", "mǎi", "mãi", "mua", "Động từ", "我想买水果。", "Wǒ xiǎng mǎi shuǐguǒ.", "Mình muốn mua hoa quả."],
      ["卖", "mài", "mại", "bán", "Động từ", "这儿卖手机吗？", "Zhèr mài shǒujī ma?", "Ở đây có bán điện thoại không?"],
      ["东西", "dōng xi", "đông tây", "đồ, đồ vật", "Danh từ", "我去商店买东西。", "Wǒ qù shāngdiàn mǎi dōngxi.", "Mình đi cửa hàng mua đồ."],
      ["钱", "qián", "tiền", "tiền", "Danh từ", "这个多少钱？", "Zhège duōshao qián?", "Cái này bao nhiêu tiền?"],
      ["多少", "duō shao", "đa thiểu", "bao nhiêu", "Đại từ", "你们班有多少学生？", "Nǐmen bān yǒu duōshao xuésheng?", "Lớp bạn có bao nhiêu học sinh?"],
      ["块", "kuài", "khối", "đồng (đơn vị tiền khẩu ngữ)", "Lượng từ", "十五块。", "Shíwǔ kuài.", "Mười lăm đồng."],
      ["个", "gè", "cá", "cái, chiếc (lượng từ chung)", "Lượng từ", "我要三个。", "Wǒ yào sān gè.", "Mình lấy ba cái."],
      ["这", "zhè", "giá", "này", "Đại từ", "这是什么？", "Zhè shì shénme?", "Đây là gì?"],
      ["那", "nà", "na", "kia, đó", "Đại từ", "那个也很好。", "Nàge yě hěn hǎo.", "Cái kia cũng rất tốt."],
      ["太", "tài", "thái", "quá", "Phó từ", "太贵了！", "Tài guì le!", "Đắt quá!"],
      ["贵", "guì", "quý", "đắt", "Tính từ", "这个手机很贵。", "Zhège shǒujī hěn guì.", "Chiếc điện thoại này rất đắt."],
      ["便宜", "pián yi", "tiện nghi", "rẻ", "Tính từ", "便宜一点儿吧。", "Piányi yìdiǎnr ba.", "Rẻ chút đi."]
    ],
    d: { title: "Mặc cả", lines: [
      ["Khách", "这个杯子多少钱？", "Zhège bēizi duōshao qián?", "Cái cốc này bao nhiêu tiền?"],
      ["Người bán", "三十块。", "Sānshí kuài.", "Ba mươi đồng."],
      ["Khách", "太贵了！二十块，可以吗？", "Tài guì le! Èrshí kuài, kěyǐ ma?", "Đắt quá! Hai mươi đồng được không?"],
      ["Người bán", "二十五块吧。", "Èrshíwǔ kuài ba.", "Hai mươi lăm đồng nhé."]
    ] },
    g: [
      ["Hỏi giá: ... 多少钱?", "Đặt món đồ trước, 多少钱 ở cuối.", [["这个多少钱？", "Zhège duōshao qián?", "Cái này bao nhiêu tiền?"]]],
      ["太 + tính từ + 了", "Diễn đạt mức độ quá, thường mang ý cảm thán.", [["太好了！", "Tài hǎo le!", "Tốt quá!"], ["太便宜了！", "Tài piányi le!", "Rẻ quá!"]]],
      ["这/那 + lượng từ + danh từ", "Giữa 这, 那 và danh từ cần có lượng từ.", [["这个人", "zhège rén", "người này"], ["那个杯子", "nàge bēizi", "cái cốc kia"]]]
    ] },

  /* ---------------- HSK 2 ---------------- */
  { id: "hsk2-01", level: 2, no: 1, title: "你在哪里工作", titlePy: "Nǐ zài nǎlǐ gōngzuò", titleVi: "Công việc",
    goals: ["Nói về nơi làm việc, nghề nghiệp", "Dùng 在 + nơi chốn + động từ"],
    v: [
      ["工作", "gōng zuò", "công tác", "làm việc, công việc", "Động từ", "你做什么工作？", "Nǐ zuò shénme gōngzuò?", "Bạn làm nghề gì?"],
      ["公司", "gōng sī", "công ty", "công ty", "Danh từ", "我在一家公司工作。", "Wǒ zài yì jiā gōngsī gōngzuò.", "Mình làm ở một công ty."],
      ["医生", "yī shēng", "y sinh", "bác sĩ", "Danh từ", "她是医生。", "Tā shì yīshēng.", "Cô ấy là bác sĩ."],
      ["医院", "yī yuàn", "y viện", "bệnh viện", "Danh từ", "医院离这儿不远。", "Yīyuàn lí zhèr bù yuǎn.", "Bệnh viện cách đây không xa."],
      ["在", "zài", "tại", "ở, tại", "Giới từ", "我在家休息。", "Wǒ zài jiā xiūxi.", "Mình nghỉ ở nhà."],
      ["哪里", "nǎ lǐ", "na lý", "ở đâu", "Đại từ", "你住在哪里？", "Nǐ zhù zài nǎlǐ?", "Bạn sống ở đâu?"],
      ["每天", "měi tiān", "mỗi thiên", "mỗi ngày", "Danh từ", "我每天八点上班。", "Wǒ měitiān bā diǎn shàngbān.", "Mỗi ngày mình đi làm lúc tám giờ."],
      ["忙", "máng", "mang", "bận", "Tính từ", "最近工作很忙。", "Zuìjìn gōngzuò hěn máng.", "Dạo này công việc rất bận."],
      ["累", "lèi", "lụy", "mệt", "Tính từ", "你累不累？", "Nǐ lèi bu lèi?", "Bạn có mệt không?"],
      ["上班", "shàng bān", "thượng ban", "đi làm", "Động từ", "你几点上班？", "Nǐ jǐ diǎn shàngbān?", "Bạn đi làm lúc mấy giờ?"],
      ["下班", "xià bān", "hạ ban", "tan làm", "Động từ", "我六点下班。", "Wǒ liù diǎn xiàbān.", "Mình tan làm lúc sáu giờ."],
      ["开始", "kāi shǐ", "khai thủy", "bắt đầu", "Động từ", "会议九点开始。", "Huìyì jiǔ diǎn kāishǐ.", "Cuộc họp bắt đầu lúc chín giờ."]
    ],
    d: { title: "Hỏi về công việc", lines: [
      ["A", "你在哪里工作？", "Nǐ zài nǎlǐ gōngzuò?", "Bạn làm việc ở đâu?"],
      ["B", "我在一家电商公司工作。", "Wǒ zài yì jiā diànshāng gōngsī gōngzuò.", "Mình làm ở một công ty thương mại điện tử."],
      ["A", "你每天几点下班？", "Nǐ měitiān jǐ diǎn xiàbān?", "Mỗi ngày bạn tan làm lúc mấy giờ?"],
      ["B", "六点，可是最近很忙，常常很累。", "Liù diǎn, kěshì zuìjìn hěn máng, chángcháng hěn lèi.", "Sáu giờ, nhưng dạo này bận lắm, hay bị mệt."]
    ] },
    g: [
      ["在 + nơi chốn + động từ", "Nơi chốn đặt trước động từ, khác tiếng Việt.", [["我在公司工作。", "Wǒ zài gōngsī gōngzuò.", "Mình làm việc ở công ty."]]],
      ["Câu hỏi chính phản: A 不 A", "Lặp lại động từ hoặc tính từ dạng khẳng định và phủ định để hỏi, không dùng 吗.", [["你忙不忙？", "Nǐ máng bu máng?", "Bạn có bận không?"], ["你去不去？", "Nǐ qù bu qù?", "Bạn có đi không?"]]]
    ] },

  { id: "hsk2-02", level: 2, no: 2, title: "怎么去机场", titlePy: "Zěnme qù jīchǎng", titleVi: "Đi lại",
    goals: ["Hỏi đường, nói phương tiện", "Nói khoảng cách với 离"],
    v: [
      ["怎么", "zěn me", "chẩm ma", "thế nào, làm sao", "Đại từ", "去机场怎么走？", "Qù jīchǎng zěnme zǒu?", "Đi sân bay đi thế nào?"],
      ["去", "qù", "khứ", "đi", "Động từ", "你去哪里？", "Nǐ qù nǎlǐ?", "Bạn đi đâu?"],
      ["来", "lái", "lai", "đến", "Động từ", "你什么时候来？", "Nǐ shénme shíhou lái?", "Khi nào bạn đến?"],
      ["坐", "zuò", "tọa", "ngồi, đi (xe)", "Động từ", "我坐出租车去。", "Wǒ zuò chūzūchē qù.", "Mình đi taxi."],
      ["出租车", "chū zū chē", "xuất tô xa", "taxi", "Danh từ", "这儿很难打出租车。", "Zhèr hěn nán dǎ chūzūchē.", "Ở đây rất khó bắt taxi."],
      ["飞机", "fēi jī", "phi cơ", "máy bay", "Danh từ", "我坐飞机去北京。", "Wǒ zuò fēijī qù Běijīng.", "Mình đi máy bay đến Bắc Kinh."],
      ["火车站", "huǒ chē zhàn", "hỏa xa trạm", "ga tàu", "Danh từ", "火车站在哪里？", "Huǒchēzhàn zài nǎlǐ?", "Ga tàu ở đâu?"],
      ["机场", "jī chǎng", "cơ trường", "sân bay", "Danh từ", "机场离这儿很远。", "Jīchǎng lí zhèr hěn yuǎn.", "Sân bay cách đây rất xa."],
      ["离", "lí", "ly", "cách", "Giới từ", "我家离公司很近。", "Wǒ jiā lí gōngsī hěn jìn.", "Nhà mình cách công ty rất gần."],
      ["远", "yuǎn", "viễn", "xa", "Tính từ", "远不远？", "Yuǎn bu yuǎn?", "Có xa không?"],
      ["近", "jìn", "cận", "gần", "Tính từ", "超市很近。", "Chāoshì hěn jìn.", "Siêu thị rất gần."],
      ["走", "zǒu", "tẩu", "đi bộ, đi", "Động từ", "我们走路去吧。", "Wǒmen zǒulù qù ba.", "Chúng ta đi bộ đi."]
    ],
    d: { title: "Hỏi đường", lines: [
      ["A", "请问，去火车站怎么走？", "Qǐngwèn, qù huǒchēzhàn zěnme zǒu?", "Xin hỏi, đến ga tàu đi thế nào?"],
      ["B", "一直往前走，大概十分钟。", "Yìzhí wǎng qián zǒu, dàgài shí fēnzhōng.", "Cứ đi thẳng, khoảng mười phút."],
      ["A", "离这儿远吗？", "Lí zhèr yuǎn ma?", "Cách đây có xa không?"],
      ["B", "不太远，你也可以坐出租车。", "Bú tài yuǎn, nǐ yě kěyǐ zuò chūzūchē.", "Không xa lắm, bạn cũng có thể đi taxi."]
    ] },
    g: [
      ["A 离 B + 远/近", "Nói khoảng cách giữa hai nơi.", [["学校离我家很近。", "Xuéxiào lí wǒ jiā hěn jìn.", "Trường cách nhà mình rất gần."]]],
      ["坐 + phương tiện + 去 + nơi", "Phương tiện đặt trước động từ chính.", [["坐飞机去上海", "zuò fēijī qù Shànghǎi", "đi máy bay đến Thượng Hải"]]],
      ["怎么 + động từ", "Hỏi cách thức làm việc gì.", [["这个字怎么读？", "Zhège zì zěnme dú?", "Chữ này đọc thế nào?"]]]
    ] },

  { id: "hsk2-03", level: 2, no: 3, title: "今天天气怎么样", titlePy: "Jīntiān tiānqì zěnmeyàng", titleVi: "Thời tiết",
    goals: ["Miêu tả thời tiết", "Dùng 了 chỉ sự thay đổi và 可能 phỏng đoán"],
    v: [
      ["天气", "tiān qì", "thiên khí", "thời tiết", "Danh từ", "今天天气很好。", "Jīntiān tiānqì hěn hǎo.", "Hôm nay thời tiết rất đẹp."],
      ["下雨", "xià yǔ", "hạ vũ", "mưa", "Động từ", "外面下雨了。", "Wàimiàn xià yǔ le.", "Bên ngoài mưa rồi."],
      ["雪", "xuě", "tuyết", "tuyết", "Danh từ", "北京冬天下雪。", "Běijīng dōngtiān xià xuě.", "Mùa đông Bắc Kinh có tuyết."],
      ["冷", "lěng", "lãnh", "lạnh", "Tính từ", "今天有点儿冷。", "Jīntiān yǒudiǎnr lěng.", "Hôm nay hơi lạnh."],
      ["热", "rè", "nhiệt", "nóng", "Tính từ", "夏天很热。", "Xiàtiān hěn rè.", "Mùa hè rất nóng."],
      ["晴", "qíng", "tình", "nắng, quang", "Tính từ", "明天是晴天。", "Míngtiān shì qíngtiān.", "Ngày mai trời nắng."],
      ["阴", "yīn", "âm", "âm u", "Tính từ", "今天阴天。", "Jīntiān yīntiān.", "Hôm nay trời âm u."],
      ["觉得", "jué de", "giác đắc", "cảm thấy, thấy rằng", "Động từ", "我觉得有点儿热。", "Wǒ juéde yǒudiǎnr rè.", "Mình thấy hơi nóng."],
      ["可能", "kě néng", "khả năng", "có lẽ, có thể", "Phó từ", "明天可能下雨。", "Míngtiān kěnéng xià yǔ.", "Ngày mai có lẽ mưa."],
      ["已经", "yǐ jīng", "dĩ kinh", "đã", "Phó từ", "雨已经停了。", "Yǔ yǐjīng tíng le.", "Mưa đã tạnh rồi."],
      ["度", "dù", "độ", "độ (nhiệt độ)", "Lượng từ", "今天三十五度。", "Jīntiān sānshíwǔ dù.", "Hôm nay 35 độ."],
      ["比较", "bǐ jiào", "tỉ giảo", "khá, tương đối", "Phó từ", "河内冬天比较冷。", "Hénèi dōngtiān bǐjiào lěng.", "Mùa đông Hà Nội khá lạnh."]
    ],
    d: { title: "Hỏi thời tiết", lines: [
      ["A", "今天天气怎么样？", "Jīntiān tiānqì zěnmeyàng?", "Hôm nay thời tiết thế nào?"],
      ["B", "上午是晴天，现在阴了。", "Shàngwǔ shì qíngtiān, xiànzài yīn le.", "Buổi sáng nắng, giờ âm u rồi."],
      ["A", "下午可能下雨吗？", "Xiàwǔ kěnéng xià yǔ ma?", "Chiều có thể mưa không?"],
      ["B", "可能，你带伞吧。", "Kěnéng, nǐ dài sǎn ba.", "Có thể đấy, bạn mang ô đi."]
    ] },
    g: [
      ["了 cuối câu: sự thay đổi", "Trạng thái mới xuất hiện so với trước.", [["天冷了。", "Tiān lěng le.", "Trời lạnh rồi."], ["下雨了。", "Xià yǔ le.", "Mưa rồi."]]],
      ["有点儿 + tính từ", "Hơi..., thường mang ý không như mong muốn.", [["有点儿贵。", "Yǒudiǎnr guì.", "Hơi đắt."]]]
    ] },

  { id: "hsk2-04", level: 2, no: 4, title: "你的爱好是什么", titlePy: "Nǐ de àihào shì shénme", titleVi: "Sở thích",
    goals: ["Nói về sở thích và hoạt động lúc rảnh", "Dùng 喜欢 + động từ, 一起, 最"],
    v: [
      ["喜欢", "xǐ huan", "hỉ hoan", "thích", "Động từ", "我喜欢看电影。", "Wǒ xǐhuan kàn diànyǐng.", "Mình thích xem phim."],
      ["运动", "yùn dòng", "vận động", "thể thao, vận động", "Danh từ", "你喜欢什么运动？", "Nǐ xǐhuan shénme yùndòng?", "Bạn thích môn thể thao nào?"],
      ["跑步", "pǎo bù", "bào bộ", "chạy bộ", "Động từ", "我每天早上跑步。", "Wǒ měitiān zǎoshang pǎobù.", "Sáng nào mình cũng chạy bộ."],
      ["游泳", "yóu yǒng", "du vịnh", "bơi", "Động từ", "夏天我常常游泳。", "Xiàtiān wǒ chángcháng yóuyǒng.", "Mùa hè mình hay đi bơi."],
      ["唱歌", "chàng gē", "xướng ca", "hát", "Động từ", "她唱歌唱得很好。", "Tā chàng gē chàng de hěn hǎo.", "Cô ấy hát rất hay."],
      ["跳舞", "tiào wǔ", "khiêu vũ", "nhảy, khiêu vũ", "Động từ", "我不会跳舞。", "Wǒ bú huì tiàowǔ.", "Mình không biết nhảy."],
      ["看书", "kàn shū", "khán thư", "đọc sách", "Động từ", "周末我在家看书。", "Zhōumò wǒ zài jiā kàn shū.", "Cuối tuần mình ở nhà đọc sách."],
      ["电影", "diàn yǐng", "điện ảnh", "phim", "Danh từ", "这个电影很有意思。", "Zhège diànyǐng hěn yǒu yìsi.", "Bộ phim này rất hay."],
      ["旅游", "lǚ yóu", "lữ du", "du lịch", "Động từ", "我想去中国旅游。", "Wǒ xiǎng qù Zhōngguó lǚyóu.", "Mình muốn đi du lịch Trung Quốc."],
      ["一起", "yì qǐ", "nhất khởi", "cùng nhau", "Phó từ", "我们一起去吧！", "Wǒmen yìqǐ qù ba!", "Chúng ta cùng đi nhé!"],
      ["有意思", "yǒu yì si", "hữu ý tư", "thú vị, hay", "Tính từ", "学汉语很有意思。", "Xué Hànyǔ hěn yǒu yìsi.", "Học tiếng Trung rất thú vị."],
      ["最", "zuì", "tối", "nhất", "Phó từ", "我最喜欢游泳。", "Wǒ zuì xǐhuan yóuyǒng.", "Mình thích bơi nhất."]
    ],
    d: { title: "Cuối tuần làm gì", lines: [
      ["A", "周末你喜欢做什么？", "Zhōumò nǐ xǐhuan zuò shénme?", "Cuối tuần bạn thích làm gì?"],
      ["B", "我喜欢跑步和看电影。你呢？", "Wǒ xǐhuan pǎobù hé kàn diànyǐng. Nǐ ne?", "Mình thích chạy bộ và xem phim. Còn bạn?"],
      ["A", "我最喜欢游泳。", "Wǒ zuì xǐhuan yóuyǒng.", "Mình thích bơi nhất."],
      ["B", "那星期六我们一起去游泳吧！", "Nà xīngqīliù wǒmen yìqǐ qù yóuyǒng ba!", "Vậy thứ bảy mình cùng đi bơi nhé!"]
    ] },
    g: [
      ["喜欢 + động từ", "Thích làm gì. 最喜欢: thích nhất.", [["我喜欢唱歌。", "Wǒ xǐhuan chàng gē.", "Mình thích hát."]]],
      ["Động từ + 得 + bổ ngữ", "Đánh giá mức độ của hành động. Có tân ngữ thì lặp lại động từ.", [["他跑得很快。", "Tā pǎo de hěn kuài.", "Anh ấy chạy rất nhanh."], ["她唱歌唱得很好。", "Tā chàng gē chàng de hěn hǎo.", "Cô ấy hát rất hay."]]]
    ] },

  { id: "hsk2-05", level: 2, no: 5, title: "你哪里不舒服", titlePy: "Nǐ nǎlǐ bù shūfu", titleVi: "Sức khỏe",
    goals: ["Nói triệu chứng khi đi khám", "Khuyên nhủ với 应该 và 别"],
    v: [
      ["身体", "shēn tǐ", "thân thể", "cơ thể, sức khỏe", "Danh từ", "你身体好吗？", "Nǐ shēntǐ hǎo ma?", "Bạn khỏe không?"],
      ["生病", "shēng bìng", "sinh bệnh", "bị ốm", "Động từ", "他生病了。", "Tā shēngbìng le.", "Anh ấy bị ốm rồi."],
      ["疼", "téng", "đông", "đau", "Tính từ", "我头疼。", "Wǒ tóu téng.", "Mình đau đầu."],
      ["药", "yào", "dược", "thuốc", "Danh từ", "你吃药了吗？", "Nǐ chī yào le ma?", "Bạn uống thuốc chưa?"],
      ["休息", "xiū xi", "hưu tức", "nghỉ ngơi", "Động từ", "你应该好好休息。", "Nǐ yīnggāi hǎohǎo xiūxi.", "Bạn nên nghỉ ngơi cho tốt."],
      ["感冒", "gǎn mào", "cảm mạo", "cảm cúm", "Động từ", "我感冒了。", "Wǒ gǎnmào le.", "Mình bị cảm rồi."],
      ["发烧", "fā shāo", "phát thiêu", "sốt", "Động từ", "孩子发烧了。", "Háizi fāshāo le.", "Con bị sốt rồi."],
      ["眼睛", "yǎn jing", "nhãn tình", "mắt", "Danh từ", "我眼睛有点儿疼。", "Wǒ yǎnjing yǒudiǎnr téng.", "Mắt mình hơi đau."],
      ["头", "tóu", "đầu", "đầu", "Danh từ", "头疼吗？", "Tóu téng ma?", "Có đau đầu không?"],
      ["应该", "yīng gāi", "ưng cai", "nên", "Động từ năng nguyện", "你应该去医院。", "Nǐ yīnggāi qù yīyuàn.", "Bạn nên đi bệnh viện."],
      ["别", "bié", "biệt", "đừng", "Phó từ", "别喝冰水。", "Bié hē bīng shuǐ.", "Đừng uống nước đá."],
      ["舒服", "shū fu", "thư phục", "dễ chịu, khỏe", "Tính từ", "我不太舒服。", "Wǒ bú tài shūfu.", "Mình thấy không khỏe lắm."]
    ],
    d: { title: "Đi khám", lines: [
      ["Bác sĩ", "你哪里不舒服？", "Nǐ nǎlǐ bù shūfu?", "Bạn thấy không khỏe ở đâu?"],
      ["Bệnh nhân", "我头疼，还有点儿发烧。", "Wǒ tóu téng, hái yǒudiǎnr fāshāo.", "Tôi đau đầu, còn hơi sốt."],
      ["Bác sĩ", "你感冒了。吃点儿药，应该多休息。", "Nǐ gǎnmào le. Chī diǎnr yào, yīnggāi duō xiūxi.", "Bạn bị cảm. Uống chút thuốc, nên nghỉ ngơi nhiều."],
      ["Bác sĩ", "别喝冰水，多喝热水。", "Bié hē bīng shuǐ, duō hē rè shuǐ.", "Đừng uống nước đá, uống nhiều nước ấm."]
    ] },
    g: [
      ["应该 + động từ", "Lời khuyên: nên làm gì. Phủ định: 不应该.", [["你应该早点儿睡觉。", "Nǐ yīnggāi zǎo diǎnr shuìjiào.", "Bạn nên ngủ sớm một chút."]]],
      ["别 + động từ", "Khuyên ngăn, cấm: đừng làm gì.", [["别担心。", "Bié dānxīn.", "Đừng lo."]]]
    ] },

  { id: "hsk2-06", level: 2, no: 6, title: "你去过中国吗", titlePy: "Nǐ qù guo Zhōngguó ma", titleVi: "Trải nghiệm đã qua",
    goals: ["Kể việc đã làm, đã từng làm", "Phân biệt 了 và 过"],
    v: [
      ["过", "guo", "quá", "đã từng (trợ từ)", "Trợ từ", "我去过上海。", "Wǒ qù guo Shànghǎi.", "Mình từng đi Thượng Hải."],
      ["了", "le", "liễu", "rồi, đã (trợ từ)", "Trợ từ", "我买了一本书。", "Wǒ mǎi le yì běn shū.", "Mình đã mua một quyển sách."],
      ["以前", "yǐ qián", "dĩ tiền", "trước đây", "Danh từ", "以前我不会说汉语。", "Yǐqián wǒ bú huì shuō Hànyǔ.", "Trước đây mình không biết nói tiếng Trung."],
      ["第一次", "dì yī cì", "đệ nhất thứ", "lần đầu tiên", "Cụm từ", "这是我第一次来中国。", "Zhè shì wǒ dì yī cì lái Zhōngguó.", "Đây là lần đầu mình đến Trung Quốc."],
      ["次", "cì", "thứ", "lần", "Lượng từ", "我去过两次。", "Wǒ qù guo liǎng cì.", "Mình từng đi hai lần."],
      ["准备", "zhǔn bèi", "chuẩn bị", "chuẩn bị, định", "Động từ", "我准备明年去北京。", "Wǒ zhǔnbèi míngnián qù Běijīng.", "Mình định sang năm đi Bắc Kinh."],
      ["送", "sòng", "tống", "tặng, tiễn", "Động từ", "我送你一个礼物。", "Wǒ sòng nǐ yí gè lǐwù.", "Mình tặng bạn một món quà."],
      ["礼物", "lǐ wù", "lễ vật", "quà", "Danh từ", "谢谢你的礼物！", "Xièxie nǐ de lǐwù!", "Cảm ơn quà của bạn!"],
      ["生日", "shēng rì", "sinh nhật", "sinh nhật", "Danh từ", "今天是我的生日。", "Jīntiān shì wǒ de shēngrì.", "Hôm nay là sinh nhật mình."],
      ["快乐", "kuài lè", "khoái lạc", "vui vẻ", "Tính từ", "生日快乐！", "Shēngrì kuàilè!", "Chúc mừng sinh nhật!"],
      ["希望", "xī wàng", "hy vọng", "hy vọng, mong", "Động từ", "希望你喜欢。", "Xīwàng nǐ xǐhuan.", "Mong bạn thích."],
      ["知道", "zhī dao", "tri đạo", "biết", "Động từ", "我不知道他的电话。", "Wǒ bù zhīdào tā de diànhuà.", "Mình không biết số điện thoại của anh ấy."]
    ],
    d: { title: "Bạn từng đến chưa", lines: [
      ["A", "你去过中国吗？", "Nǐ qù guo Zhōngguó ma?", "Bạn từng đến Trung Quốc chưa?"],
      ["B", "去过一次，去年去了广州。", "Qù guo yí cì, qùnián qù le Guǎngzhōu.", "Từng đi một lần, năm ngoái mình đi Quảng Châu."],
      ["A", "我还没去过，准备明年去。", "Wǒ hái méi qù guo, zhǔnbèi míngnián qù.", "Mình chưa đi bao giờ, định sang năm đi."],
      ["B", "希望你玩儿得开心！", "Xīwàng nǐ wánr de kāixīn!", "Mong bạn đi chơi vui vẻ!"]
    ] },
    g: [
      ["Động từ + 过: kinh nghiệm", "Đã từng làm gì. Phủ định: 没 + động từ + 过.", [["我吃过北京烤鸭。", "Wǒ chī guo Běijīng kǎoyā.", "Mình từng ăn vịt quay Bắc Kinh."], ["我没去过。", "Wǒ méi qù guo.", "Mình chưa từng đi."]]],
      ["Động từ + 了: hành động hoàn thành", "Hành động đã xảy ra. Phủ định: 没 + động từ, bỏ 了.", [["我吃了。", "Wǒ chī le.", "Mình ăn rồi."], ["我没吃。", "Wǒ méi chī.", "Mình chưa ăn."]]]
    ] }
]);
