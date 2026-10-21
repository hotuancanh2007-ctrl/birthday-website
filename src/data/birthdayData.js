/**
 * ==============================================================================
 * DỮ LIỆU CÁ NHÂN HÓA CHO WEBSITE SINH NHẬT
 * ==============================================================================
 * Bạn chỉ cần chỉnh sửa các nội dung trong file này để thay đổi lời chúc,
 * tên gọi, các bức ảnh kỷ niệm và câu chuyện của hai bạn.
 */

export const birthdayData = {
  // 1. Thông tin chung[cite: 1, 4]
  recipient: {
    nickname: "Bé meo",      // Tên gọi thân mật hiển thị ở đầu thư hoặc tiêu đề
    fullName: "Em bé meo",    // Tên bạn gái (tùy chọn)
    birthdate: "02-11-2009",  // Ngày sinh nhật
  },

  // 2. Màn 1: Cảnh Hộp Quà 3D[cite: 1, 4]
  giftScene: {
    subtitle: "Tặng Bé Meo ó ♡",
    openButtonText: "Có Bất Ngờ",
  },

  // 3. Màn 2: Bức Thư Sinh Nhật (The Birthday Letter)[cite: 1, 4]
  letter: {
    title: "Happy Birthday vợ eooo ♡",
    date: "Ngày 02 tháng 11 năm 2026",
    salutation: "Đan meo,",
    // Hỗ trợ chia nhiều trang (qua trang) nếu viết thư dài:
    pages: [
      {
        pageNumber: 1,
        subtitle: "Chúc Mừng Sinh Nhật Em Yêu",
        paragraphs: [
          "Ta daadaaaaaaa phải Đan meoo đó hom ta , Hôm này là sinh nhật của ai í taaaa?(Gợi ý:hỏi anh Tuấn Cảnh í hehehe)",
          "Tuấn Cảnh trả lời: hôm nay là 1 ngày rất rất rất đặc biệt đối với  cô gái bé nhỏ của anh, chúc bé iu của anh có 1 ngày sinh nhật thật là vui vẻ hạnh phúc ,  mọi sự không may và những nỗi buồn meo đã và đang trải qua đều biến mất,chúc bé iu của anh ngày càng trở nên xinh đẹp ,đáng iuuu , nhẹ nhàng(với anh). Trong mọi tình huống đều có thể mạnh mẽ và đối mặt(nma nhõng nhẽo với anh hehe), người ta nói ó học chưa chắc đã thành công nhưng nó là con đường ngắn nhất dẫn đến thành công nên là mong bé của anh sẽ học thật là giỏi để đạt được những ước mơ mà bé mong muốn. "
        ]
      },
      {
        pageNumber: 2,
        subtitle: "....",
        paragraphs: [
          "Hôm này là sinh nhật của bé và đã 2 năm tụi mình chưa được đón sinh nhật với nhau rồi, thật sự thì anh thấy rất thiệt thòi cho bé vì phải yêu xa, đối với nhiều người thì yêu xa rất khó, nhưng emmm vẫn bỏ qua điều đó và yêu anh đến hiện tại, mong là tụi mình có thể vì nhau trong những lúc chúng ta bất đồng mà nắm tay nhau đi đến đoạn được phía trước và có 'Chúng Ta Của Tương lai' ,sẽ có 1 đám cưới thật là linh đình anh là chú rể meo là cô dâu ó nho , sống với nhau hạnh phúc mãi mãi....",
          "Cảm ơn em vì đã là một phần không thể thiếu trong cuộc đời anh, lúc ở trong Sài Gòn ó 1 ngày có thể anh chỉ có trò chuyện mình em ò, u thật sự rất vuiii khi vẫn còn người luôn nhớ và trò chuyện với anh mỗi ngày lun í.Nhớ đợt em dô thăm anh á lúc đó anh cảm nhận được sự yêu thương từ em quá trời luôn, dô Sài Gòn thăm anh nè,Chị Ý ha Bé Anh ăn cái gì là anh cũng phải có , rồi bé lột vỏ trái cây cho anh ăn , ngồi sửa kính cho anh, rồi lúc em sợ anh học bài bùn xún ngồi với anh nữa, eyyy lúc đó yêu em quá trời luôn.Rồi lên nhà Meo chơi em lo cho anh đem nhiều mềnh gối xuống cho anh nằm, Hú Hú vuiii quá trời lun ò .Cảm ơn em, Cảm ơn emmm đã yêu anh, Cảm ơn em đã Đến bên đời anhhhh♡"
        ]
      }
    ],
    // Hỗ trợ dự phòng nếu người dùng viết mảng paragraphs phẳng:
    paragraphs: [
      "Chúc mừng sinh nhật cô gái tuyệt vời nhất trong thế giới của anh! Cảm ơn em vì đã đến bên anh, mang theo nụ cười rạng rỡ và cả những điều ngọt ngào dịu êm nhất.",
      "Mỗi khoảnh khắc được cùng em đi qua những góc phố, chia sẻ từng câu chuyện thường ngày, hay chỉ đơn giản là cùng ngồi ngắm hoàng hôn buông xuống đều là những trang ký ức vô giá mà anh luôn trân trọng.",
      "Bước sang tuổi mới, anh chúc em luôn an yên, rạng rỡ, tự tin theo đuổi mọi ước mơ của mình. Dù chặng đường phía trước có ra sao, anh vẫn sẽ luôn ở đây, đồng hành và yêu thương em từng ngày."
    ],
    closing: "Mãi yêu em,",
    signature: "Bi Gieoo ♡",
    continueButtonText: "Đọc xong rồi, tiếp tục nhé ♡"
  },

  // 4. Màn 3: Thiên Hà Kỷ Niệm (Galaxy of Memories - Polaroid 3D)[cite: 1, 4]
  memories: [
    {
      id: "memory-1",
      title: "Ngày Đầu Tiên Gặp Gỡ",
      date: "17/08/2025",
      image: "./assets/images/anh1.jpg",
      story: "Lần đầu tiên gặp mặt nè bé siêu hồi hợp , may mắn là anh cũng nói chuyện nhiều với meo"
    },
    {
      id: "memory-2",
      title: "Chuyến đi chơi trọn vẹn đầu tiên",
      date: "02/01/2026",
      image: "./assets/images/anh2.jpg",
      story: "Lúc này anh được nghỉ tết tay về chơi với bé nè, siêu vuiii lun ý cảm giác lần đầu đi chơi trọn vẹn rất tuyệt lun í."
    },
    {
      id: "memory-3",
      title: "Đi chuwiii tết nè há vợ",
      date: "20/02/2026",
      image: "./assets/images/an3.jpg",
      story: "Lúc này là năm đầu tiên mình được chơi tết với bé nè, ùi ui hôm đó quá tuyệt vời với cô nàng váy đỏ."
    },
    {
      id: "memory-4",
      title: "Lúc này bé dô SG thăm anh nè",
      date: "30/06/2024",
      image: "./assets/images/anh4.jpg",
      story: "Siêu bất ngờ lun ó bé, yêu xa lâu ngày quó bé dô anh mừng quá trời luôn, ngày bé lên xe về lại anh bùn thiu lun ò =((."
    },
    {
      id: "memory-5",
      title: "1st anniversary of being together",
      date: "26/08/2026",
      image: "./assets/images/anh5.jpg",
      story: "Happy ha em, cảm ơn bé iuuu đã cùng anh vượt qua mọi vấn đề để có ngày hôm ngày nì."
    }
  ],

  timeline: [
    {
      id: "story-1",
      period: "Tháng 2, 2024",
      title: "Khi Định Mệnh Gõ Cửa",
      description: "Hai con người từ xa lạ tình cờ bước vào thế giới của nhau, bắt đầu cho một hành trình dịu dàng.",
      mediaType: "./assets/images/placeholder-1.jpg", // "image" hoặc "video"
      mediaSrc: "./assets/images/placeholder-1.jpg"
    },
    {
      id: "story-2",
      period: "Mùa Hè 2024",
      title: "Những Chuyến Đi Cùng Nhau",
      description: "Từng bước chân in dấu trên những miền đất mới, cùng nhau lưu giữ hàng trăm bức ảnh kỷ niệm.",
      mediaType: "image",
      mediaSrc: "./assets/images/placeholder-2.jpg"
    },
    {
      id: "story-3",
      period: "Hiện Tại & Mãi Mãi",
      title: "Hôm Nay & Tương Lai",
      description: "Cảm ơn em vì đã là một phần tuyệt vời nhất trong cuộc đời anh. Chúc mừng sinh nhật em yêu!",
      mediaType: "image",
      mediaSrc: "./assets/images/placeholder-3.jpg"
    }
  ],

  videos: [
    {
      title: "Khung Hình Tình Yêu",
      date: "14/02/2024",
      src: "./assets/videos/video3.mp4",
      poster: "./assets/images/poster1.jpg"
    },
    {
      title: "Chuyến đi Đà Lạt",
      date: "02/01/2026",
      src: "./assets/videos/video2.mp4",
      poster: "./assets/images/poster2.jpg"
    }
  ],

  // Lời nhắn kết thúc ở cuối trang[cite: 1, 4]
  finalMessage: {
    quote: "“Dù thời gian có trôi đi bao lâu, anh vẫn sẽ chọn yêu em thêm một lần nữa.”",
    subtext: "Happy Birthday My Sunshine ✨",
    backToGalleryText: "Xem lại thiên hà kỷ niệm ♡"
  }
};