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
          "Chúc mừng sinh nhật cô gái tuyệt vời nhất trong thế giới của anh! Cảm ơn em vì đã đến bên anh, mang theo nụ cười rạng rỡ và cả những điều ngọt ngào dịu êm nhất.",
          "Mỗi khoảnh khắc được cùng em đi qua những góc phố, chia sẻ từng câu chuyện thường ngày, hay chỉ đơn giản là cùng ngồi ngắm hoàng hôn buông xuống đều là những trang ký ức vô giá mà anh luôn trân trọng."
        ]
      },
      {
        pageNumber: 2,
        subtitle: "Hành trình yêu thương phía trước",
        paragraphs: [
          "Bước sang tuổi mới, anh chúc em luôn an yên, rạng rỡ, tự tin theo đuổi mọi ước mơ của mình. Dù chặng đường phía trước có ra sao, anh vẫn sẽ luôn ở đây, đồng hành và yêu thương em từng ngày.",
          "Cảm ơn em vì đã là một phần không thể thiếu trong cuộc đời anh. Hãy luôn mỉm cười thật tươi nhé em bé, vì nụ cười của em chính là điều kỳ diệu nhất đối với anh ♡"
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
    signature: "Anh của em ♡",
    continueButtonText: "Đọc xong rồi, tiếp tục nhé ♡"
  },

  // 4. Màn 3: Thiên Hà Kỷ Niệm (Galaxy of Memories - Polaroid 3D)[cite: 1, 4]
  memories: [
    {
      id: "memory-1",
      title: "Ngày Đầu Tiên Gặp Gỡ",
      date: "14/02/2024",
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
      date: "15/10/2024",
      image: "./assets/images/an3.jpg",
      story: "Lúc này là năm đầu tiên mình được chơi tết với bé nè, ùi ui hôm đó quá tuyệt vời với cô nàng váy đỏ."
    },
    {
      id: "memory-4",
      title: "Lúc này bé dô SG thăm anh nè",
      date: "25/12/2024",
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

  // 5. Màn 4: Hành Trình Của Chúng Mình (Our Story Timeline)[cite: 1]
  timeline: [
    {
      id: "story-1",
      period: "Tháng 2, 2024",
      title: "Khi Định Mệnh Gõ Cửa",
      description: "Hai con người từ xa lạ tình cờ bước vào thế giới của nhau, bắt đầu cho một hành trình dịu dàng.",
      mediaType: "image", // "image" hoặc "video"
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

  // 6. Màn 5: Rạp Phim Yêu Thương (Video Anniversary)[cite: 4]
  videos: [
    {
      title: "Khung Hình Tình Yêu",
      date: "14/02/2024",
      src: "./assets/videos/video1.mp4",
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